import { useEffect, useState, useCallback } from 'react';
import { readData } from './client';
export function useData(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      setData((await readData(path)).data);
      return true;
    } catch (e) {
      setError(e);
      return false;
    }
  }, [path]);
  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    readData(path).then(r => {
      if (active) setData(r.data);
    }).catch(e => {
      if (active) setError(e);
    });
    return () => {
      active = false;
    };
  }, [path]);
  return {
    data,
    error,
    load,
    setData
  };
}
