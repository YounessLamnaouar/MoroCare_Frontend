import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Send } from 'lucide-react';
import { api, errorText } from './client';
import { useAuth } from './auth';
import { useLocale } from './locale';
import { Page, Loading, ErrorNotice, Field } from './ui';
import { Emergency } from './public-pages';
export function VideoCall({
  session
}) {
  const {
      t
    } = useLocale(),
    {
      user
    } = useAuth();
  const [config, setConfig] = useState(null),
    [joined, setJoined] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(''),
    [muted, setMuted] = useState(false),
    [cameraOff, setCameraOff] = useState(false);
  const localVideo = useRef(null),
    remoteVideo = useRef(null),
    stream = useRef(null),
    peer = useRef(null),
    timer = useRef(null),
    heartbeat = useRef(null),
    cursor = useRef(0),
    candidates = useRef([]),
    active = useRef(false),
    generation = useRef(0);
  const base = `/teleconsultations/${session.id}`;
  const stop = useCallback(() => {
    active.current = false;
    generation.current++;
    clearTimeout(timer.current);
    clearInterval(heartbeat.current);
    peer.current?.close();
    peer.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    setJoined(false);
    setBusy(false);
  }, []);
  useEffect(() => {
    let live = true;
    const refresh = () => api.get(`${base}/video`).then(r => {
      if (live) setConfig(r.data);
    }).catch(() => {
      if (live) setConfig({
        enabled: false
      });
    });
    refresh();
    const refreshTimer = setInterval(refresh, 30000);
    return () => {
      live = false;
      clearInterval(refreshTimer);
      stop();
    };
  }, [base, stop]);
  const signal = (type, payload = {}) => api.post(`${base}/signals`, {
    type,
    payload
  });
  async function join() {
    setBusy(true);
    setStatus('');
    const epoch = ++generation.current;
    try {
      const {
        data: fresh
      } = await api.get(`${base}/video`);
      if (epoch !== generation.current) return;
      setConfig(fresh);
      if (!fresh.enabled) {
        setBusy(false);
        return;
      }
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: {
            ideal: 640
          },
          height: {
            ideal: 360
          }
        }
      });
      if (epoch !== generation.current) {
        media.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = media;
      active.current = true;
      cursor.current = fresh.cursor;
      candidates.current = [];
      setMuted(false);
      setCameraOff(false);
      setJoined(true);
      setStatus('Waiting for the other participant...');
      if (localVideo.current) localVideo.current.srcObject = media;
      const pc = new RTCPeerConnection({
        iceServers: fresh.iceServers,
        iceTransportPolicy: 'relay'
      });
      peer.current = pc;
      media.getTracks().forEach(track => pc.addTrack(track, media));
      pc.ontrack = e => {
        if (remoteVideo.current) remoteVideo.current.srcObject = e.streams[0];
      };
      pc.onicecandidate = e => {
        if (e.candidate && active.current) signal('candidate', e.candidate.toJSON()).catch(() => {
          setStatus('Video connection failed. You can continue in chat.');
          stop();
        });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') setStatus('Connected');
        if (['failed', 'disconnected'].includes(pc.connectionState)) {
          setStatus('Video connection failed. You can continue in chat.');
          stop();
        }
      };
      let offered = false;
      async function poll() {
        if (!active.current || epoch !== generation.current) return;
        try {
          const {
            data
          } = await api.get(`${base}/signals?after=${cursor.current}`);
          if (!active.current || epoch !== generation.current) return;
          for (const row of data) {
            cursor.current = Math.max(cursor.current, row.id);
            if (row.sender_id === user.id) continue;
            if (row.type === 'leave') {
              setStatus('The other participant left the call.');
              stop();
              return;
            }
            if (row.type === 'ready' && user.id === session.doctor_id && !offered) {
              offered = true;
              await pc.setLocalDescription(await pc.createOffer());
              await signal('offer', {
                type: pc.localDescription.type,
                sdp: pc.localDescription.sdp
              });
            }
            if (row.type === 'offer' && user.id !== session.doctor_id && pc.signalingState === 'stable') {
              await pc.setRemoteDescription(row.payload);
              await pc.setLocalDescription(await pc.createAnswer());
              await signal('answer', {
                type: pc.localDescription.type,
                sdp: pc.localDescription.sdp
              });
            }
            if (row.type === 'answer' && pc.signalingState === 'have-local-offer') await pc.setRemoteDescription(row.payload);
            if (row.type === 'candidate') {
              if (pc.remoteDescription) await pc.addIceCandidate(row.payload);else candidates.current.push(row.payload);
            }
            if (pc.remoteDescription) while (candidates.current.length) await pc.addIceCandidate(candidates.current.shift());
          }
        } catch {
          if (active.current) {
            setStatus('Video connection failed. You can continue in chat.');
            stop();
            return;
          }
        }
        if (active.current) timer.current = setTimeout(poll, 1500);
      }
      await signal('ready');
      heartbeat.current = setInterval(() => {
        if (active.current) signal('ready').catch(() => {
          setStatus('Video connection failed. You can continue in chat.');
          stop();
        });
      }, 10000);
      poll();
    } catch {
      stop();
      setStatus('Camera or microphone unavailable. Check your browser permissions.');
    } finally {
      setBusy(false);
    }
  }
  async function leave() {
    stop();
    await signal('leave');
  }
  return <section className="mc-card mc-video"><h2>{t('Video call')}</h2><p>{t('Camera and microphone stay off until you choose to join. Calls are not recorded by MoroCare.')}</p><div className={joined ? 'mc-video-grid' : 'mc-hidden'}><video ref={localVideo} autoPlay playsInline muted aria-label={t('You')} /><video ref={remoteVideo} autoPlay playsInline aria-label={t('Doctor')} /></div>{status && <p role="status" className="mc-notice">{t(status)}</p>}{!joined ? <><p className="mc-muted">{config && !config.enabled ? t(config.reason === 'outside_window' ? 'Video opens 15 minutes before the appointment and closes 2 hours after it.' : 'Video is not configured. Private chat remains available.') : t('Video opens 15 minutes before the appointment and closes 2 hours after it.')}</p><button className="mc-button" disabled={busy || !config?.enabled} onClick={join}><Video size={18} />{t(busy ? 'Loading...' : 'Join video')}</button></> : <div className="mc-actions"><button className="mc-button secondary" onClick={() => {
        stream.current?.getAudioTracks().forEach(track => {
          track.enabled = muted;
        });
        setMuted(!muted);
      }}>{muted ? <Mic size={18} /> : <MicOff size={18} />} {t(muted ? 'Unmute microphone' : 'Mute microphone')}</button><button className="mc-button secondary" onClick={() => {
        stream.current?.getVideoTracks().forEach(track => {
          track.enabled = cameraOff;
        });
        setCameraOff(!cameraOff);
      }}>{cameraOff ? <Video size={18} /> : <VideoOff size={18} />} {t(cameraOff ? 'Turn camera on' : 'Turn camera off')}</button><button className="mc-button danger" onClick={() => leave().catch(() => {})}><PhoneOff size={18} />{t('Leave video')}</button></div>}</section>;
}
export function ConsultationRoom() {
  const {
      t,
      language
    } = useLocale(),
    {
      user
    } = useAuth(),
    [params] = useSearchParams();
  const id = params.get('session');
  const [session, setSession] = useState(null),
    [messages, setMessages] = useState([]),
    [body, setBody] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [failed, setFailed] = useState(false);
  const cursor = useRef(0),
    clientId = useRef(null),
    bottom = useRef(null);
  useEffect(() => {
    let active = true,
      timer;
    cursor.current = 0;
    setMessages([]);
    setSession(null);
    setFailed(false);
    async function poll() {
      try {
        const [details, result] = await Promise.all([api.get(`/teleconsultations/${encodeURIComponent(id)}`), api.get(`/teleconsultations/${encodeURIComponent(id)}/messages?after=${cursor.current}`)]);
        if (!active) return;
        setSession(details.data);
        setError('');
        if (result.data.length) {
          cursor.current = result.data.at(-1).id;
          setMessages(old => {
            const map = new Map(old.map(m => [m.id, m]));
            result.data.forEach(m => map.set(m.id, m));
            return [...map.values()].sort((a, b) => a.id - b.id);
          });
        }
      } catch (e) {
        if (!active) return;
        setError(errorText(e, t));
        if ([403, 404].includes(e.response?.status)) {
          setFailed(true);
          return;
        }
      }
      if (active) timer = setTimeout(poll, document.hidden ? 15000 : 4000);
    }
    if (id) poll();else setFailed(true);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, language, t]);
  useEffect(() => {
    bottom.current?.scrollIntoView({
      block: 'nearest'
    });
  }, [messages.length]);
  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    clientId.current ||= crypto.randomUUID();
    try {
      await api.post(`/teleconsultations/${id}/messages`, {
        body: body.trim(),
        client_id: clientId.current
      });
      setBody('');
      clientId.current = null;
      setError('');
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  if (failed) return <Page title={t('Consultation unavailable.')}><ErrorNotice message={t('You do not have access to this action.')} /></Page>;
  if (!session) return error ? <Page title={t('Private consultation')}><ErrorNotice message={error} /></Page> : <Loading />;
  return <Page title={t('Private consultation')} subtitle={user.role === 'doctor' ? session.patient?.name : session.doctor?.name}><div className="mc-consultation-grid"><section className="mc-card mc-chat"><h2>{t('Private messages')}</h2><p>{t('Only you and your doctor can read this conversation.')}</p>{error && <ErrorNotice message={error} />}<div className="mc-chat-history" role="log" aria-live="polite">{!messages.length && <p className="mc-muted">{t('No messages yet.')}</p>}{messages.map(m => <article className={`mc-bubble ${m.sender_id === user.id ? 'own' : ''}`} key={m.id}><strong>{m.sender_id === user.id ? t('You') : user.role === 'doctor' ? session.patient?.name : session.doctor?.name}</strong><p>{m.body}</p><time dateTime={m.created_at}>{new Intl.DateTimeFormat(language, {
                dateStyle: 'short',
                timeStyle: 'short'
              }).format(new Date(m.created_at))}</time></article>)}<div ref={bottom} /></div>{session.status === 'Confirmed' ? <form className="mc-chat-compose" onSubmit={send}><textarea aria-label={t('Write a message')} placeholder={t('Write a message')} value={body} onChange={e => {
            setBody(e.target.value);
            clientId.current = null;
          }} rows={3} maxLength={4000} required disabled={busy} /><button className="mc-button" disabled={busy || !body.trim()}><Send size={18} />{t('Send')}</button></form> : <p>{t('This consultation is complete. Messages are read-only.')}</p>}</section>{session.status === 'Confirmed' && <VideoCall session={session} />}</div></Page>;
}
export function Assistant() {
  const {
    t,
    language
  } = useLocale();
  const [question, setQuestion] = useState(''),
    [accepted, setAccepted] = useState(false),
    [messages, setMessages] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function ask(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const text = question;
    try {
      const {
        data
      } = await api.post('/ask-ai', {
        question: text,
        language,
        consent: true
      }, {
        timeout: 35000
      });
      setMessages(old => [...old, {
        question: text,
        answer: data.reply
      }]);
      setQuestion('');
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  return <Page title={t('Health information assistant')} subtitle={t('Health information, not a diagnosis.')}><Emergency /><div className="mc-card mc-form mc-narrow"><p>{t('Do not share identifying or sensitive details. Your question is sent to our external AI provider.')}</p><label className="mc-checkbox"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />{t('I understand and agree to send my question.')}</label>{messages.map((m, i) => <div key={i} className="mc-answer"><strong>{m.question}</strong><p className="mc-message-body">{m.answer}</p></div>)}{error && <ErrorNotice message={error} />}<form className="mc-form" onSubmit={ask}><Field label={t('Ask a general health question')}><textarea value={question} onChange={e => setQuestion(e.target.value)} maxLength={2000} required rows={4} /></Field><button className="mc-button" disabled={!accepted || busy || !question.trim()}>{t(busy ? 'Thinking...' : 'Ask')}</button></form></div></Page>;
}
