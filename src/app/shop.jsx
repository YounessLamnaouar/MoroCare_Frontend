import { Person } from './avatar';
import { ProductImage, ProductImageField } from './product-image';
import { FilterBar } from './FilterBar';
import { queryString } from './filters';
import { notify } from './notifications';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAuth } from './auth-state';
import { useLocale } from './locale-state';
import { api, errorText } from './client';
import { useData } from './data';
import { Page, Field, ErrorNotice, Loading, Empty, Status, formValues } from './ui';
function readCart(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved.filter(x => Number.isInteger(x.product_id) && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 20).slice(0, 30) : [];
  } catch {
    return [];
  }
}
function useCart() {
  const {
    user
  } = useAuth();
  const key = `morocare-cart-${user?.id || 'guest'}`;
  const [state, setState] = useState(() => ({
    key,
    items: readCart(key)
  }));
  useEffect(() => {
    setState({
      key,
      items: readCart(key)
    });
  }, [key]);
  const items = state.key === key ? state.items : readCart(key);
  function update(next) {
    setState({
      key,
      items: next
    });
    sessionStorage.setItem(key, JSON.stringify(next));
  }
  return [items, update];
}
function useMoney() {
  const {
    language
  } = useLocale();
  return cents => new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'MAD'
  }).format(cents / 100);
}
function DemoNotice() {
  const {
    t
  } = useLocale();
  return <p className="mc-notice">{t('Demo shop — no real payment or delivery. Prescription products cannot be purchased online here.')}</p>;
}
function Pager({
  page,
  last,
  setPage
}) {
  const {
    t
  } = useLocale();
  return <div className="mc-pagination"><button className="mc-button secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('Previous')}</button><span>{t('Page {page}', {
        page
      })}</span><button className="mc-button secondary" disabled={page >= last} onClick={() => setPage(page + 1)}>{t('Next')}</button></div>;
}
function StockBadge({
  stock
}) {
  const {
    t
  } = useLocale();
  return <span className={`mc-stock-badge ${stock === 0 ? 'empty' : stock <= 5 ? 'low' : 'available'}`}>{t(stock === 0 ? 'Out of stock' : stock <= 5 ? 'Low stock' : 'In stock')}{stock > 0 ? ` · ${stock}` : ''}</span>;
}
export function Shop() {
  const {
      t
    } = useLocale(),
    {
      user
    } = useAuth(),
    money = useMoney(),
    navigate = useNavigate();
  const [filters, setFilters] = useState({}),
    [page, setPage] = useState(1),
    [cart, setCart] = useCart();
  const {
    data,
    error,
    load
  } = useData(`/shop/products?${queryString({
    page,
    ...filters
  })}`);
  function add(p) {
    if (!user) {
      navigate('/login');
      return;
    }
    const old = cart.find(x => x.product_id === p.id),
      quantity = (old?.quantity || 0) + 1;
    if (quantity > Math.min(p.stock, 20)) {
      notify('error', 'Maximum available quantity reached.');
      return;
    }
    setCart([...cart.filter(x => x.product_id !== p.id), {
      product_id: p.id,
      quantity
    }]);
    notify('success', 'Added to cart.');
  }
  return <Page title={t('Health shop')} subtitle={t('Browse products by name or SKU.')} action={<div className="mc-actions"><Link className="mc-button secondary" to={user?.role === 'admin' ? '/admin/orders' : '/shop/orders'}>{t(user?.role === 'admin' ? 'Orders' : 'My orders')}</Link><Link className="mc-button" to={user?.role === 'admin' ? '/admin/products' : '/shop/cart'}><ShoppingCart size={18} />{user?.role === 'admin' ? t('Products') : `${t('Cart')} (${cart.reduce((a, x) => a + x.quantity, 0)})`}</Link></div>}><DemoNotice /><FilterBar value={filters} onApply={next => {
      setFilters(next);
      setPage(1);
    }} dateLabel={false} selects={[{
      name: 'category',
      label: 'Category',
      options: data?.categories || []
    }, {
      name: 'stock',
      label: 'Stock',
      options: [['available', 'In stock'], ['out', 'Out of stock']]
    }, {
      name: 'sort',
      label: 'Sort by',
      options: [['name', 'Name'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['newest', 'Newest first']]
    }]} />{error ? <ErrorNotice message={errorText(error, t)} retry={load} /> : !data ? <Loading /> : !data.products.data.length ? <Empty>{t('No results match your filters.')}</Empty> : <><div className="mc-shop-results"><span>{t(data.products.total === 1 ? '1 product' : '{count} products', {
            count: data.products.total
          })}</span><span>{t('Cash on delivery')}</span></div><div className="mc-grid three">{data.products.data.map(p => <article className="mc-card mc-product mc-fashion-product" key={p.id}><ProductImage product={p} /><div className="mc-product-content"><div className="mc-product-meta"><span className="mc-status">{t('Demo product')}</span><StockBadge stock={p.stock} /></div><small>{t(p.category)} · {p.sku}</small><h2>{t(p.name)}</h2><p>{t(p.description)}</p><strong className="mc-price">{money(p.price_cents)}</strong>{p.requires_prescription ? <p className="mc-notice">{t('Prescription review required. Contact a pharmacy.')}</p> : <button className="mc-button" disabled={!p.stock || user && user.role !== 'user'} onClick={() => add(p)}><ShoppingBag size={18} />{t(p.stock ? 'Add to cart' : 'Out of stock')}</button>}</div></article>)}</div><Pager page={page} last={data.products.last_page} setPage={setPage} /></>}</Page>;
}
export function Cart() {
  const {
      t
    } = useLocale(),
    {
      user
    } = useAuth(),
    money = useMoney(),
    navigate = useNavigate();
  const [cart, setCart] = useCart(),
    [quote, setQuote] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [refresh, setRefresh] = useState(0);
  const request = useRef(null);
  const manualRefresh = useRef(false);
  useEffect(() => {
    let active = true;
    setQuote(null);
    setError('');
    if (cart.length) api.post('/shop/quote', {
      items: cart
    }).then(r => {
      if (active) {
        setQuote(r.data);
        if (manualRefresh.current) {
          notify('success', 'Cart refreshed.');
          manualRefresh.current = false;
        }
      }
    }).catch(e => {
      if (active && manualRefresh.current) {
        notify('error', null, e);
        manualRefresh.current = false;
      }
      if (active) setError(e.response?.status === 422 ? t('A cart item is unavailable. Adjust quantities or remove it.') : errorText(e, t));
    });
    return () => {
      active = false;
    };
  }, [cart, refresh, t]);
  function quantity(id, value) {
    setCart(cart.map(x => x.product_id === id ? {
      ...x,
      quantity: Number(value)
    } : x));
    notify('info', 'Cart updated.');
  }
  async function checkout(e) {
    e.preventDefault();
    if (!quote) return;
    setBusy(true);
    setError('');
    const data = {
      ...formValues(e),
      items: cart,
      expected_total_cents: quote.total_cents
    };
    const signature = JSON.stringify(data);
    if (request.current?.signature !== signature) request.current = {
      signature,
      id: crypto.randomUUID()
    };
    try {
      await api.post('/shop/orders', {
        ...data,
        client_id: request.current.id
      });
      setCart([]);
      navigate('/shop/orders');
    } catch (e) {
      setError(e.response?.status === 422 ? t('Stock or prices may have changed. Refresh your cart and check the delivery details.') : errorText(e, t));
    } finally {
      setBusy(false);
    }
  }
  return <Page title={t('Cart')} action={<Link className="mc-button secondary" to="/shop">{t('Continue shopping')}</Link>}><DemoNotice />{!cart.length ? <Empty>{t('Your cart is empty.')}</Empty> : <div className="mc-shop-checkout"><section className="mc-card"><h2>{t('Your items')}</h2>{error && <ErrorNotice message={error} />}<button className="mc-button secondary" disabled={busy} onClick={() => {
          manualRefresh.current = true;
          setRefresh(refresh + 1);
        }}>{t('Refresh cart')}</button>{cart.map(x => {
          const item = quote?.items.find(p => p.product_id === x.product_id);
          return <div className="mc-cart-line" key={x.product_id}><ProductImage compact product={item} /><div><strong>{item?.name || `${t('Product')} #${x.product_id}`}</strong>{item && <p>{money(item.unit_price_cents)} · {money(item.line_total_cents)}</p>}</div><Field label={t('Quantity')}><select disabled={busy} value={x.quantity} onChange={e => quantity(x.product_id, e.target.value)}>{Array.from({
                  length: 20
                }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></Field><button type="button" className="mc-button secondary" disabled={busy} onClick={() => {
              setCart(cart.filter(p => p.product_id !== x.product_id));
              notify('success', 'Item removed from cart.');
            }}>{t('Remove')}</button></div>;
        })}{!quote && !error && <Loading />}{quote && <div className="mc-order-totals"><p>{t('Subtotal')} <b>{money(quote.subtotal_cents)}</b></p><p>{t('Delivery fee')} <b>{money(quote.delivery_fee_cents)}</b></p><p>{t('Total')} <strong>{money(quote.total_cents)}</strong></p></div>}</section><form className="mc-card mc-form" onSubmit={checkout}><h2>{t('Delivery details')}</h2><Field label={t('Recipient')} name="recipient" defaultValue={user.name} required maxLength={160} /><Field label={t('Phone')} name="phone" defaultValue={user.phone || ''} required minLength={10} maxLength={30} type="tel" /><Field label={t('City')} name="city" required maxLength={100} /><Field label={t('Delivery address')}><textarea name="address" required minLength={8} maxLength={500} rows={3} /></Field><p className="mc-notice">{t('Cash on delivery. No card details are collected.')}</p><small>{t('By placing this demo order, you submit these delivery details to the shop administrator.')}</small><button className="mc-button" disabled={busy || !quote}>{t(busy ? 'Loading...' : 'Place demo order')}</button></form></div>}</Page>;
}
export function Orders({
  admin = false
}) {
  const {
      t,
      date,
      language
    } = useLocale(),
    money = useMoney();
  const [page, setPage] = useState(1),
    [filters, setFilters] = useState({}),
    [busy, setBusy] = useState(null),
    [error, setError] = useState('');
  const state = useData(`/shop/orders?${queryString({
    page,
    ...filters
  })}`);
  async function change(order, status) {
    if (status === 'Canceled' && !window.confirm(t('Cancel this order?'))) return;
    setBusy(order.id);
    setError('');
    try {
      await api.patch(`/shop/orders/${order.id}/status`, {
        status
      });
      await state.load();
    } catch (e) {
      setError(e.response?.status === 409 ? t('This order changed. Refresh and try again.') : errorText(e, t));
      await state.load();
    } finally {
      setBusy(null);
    }
  }
  async function copy(number) {
    try {
      await navigator.clipboard.writeText(number);
      notify('success', 'Order reference copied.');
    } catch {
      notify('error', 'Could not copy the order reference.');
    }
  }
  return <Page title={t(admin ? 'Orders' : 'My orders')} action={<div className="mc-actions">{!admin && <Link className="mc-button" to="/shop">{t('Continue shopping')}</Link>}<button className="mc-button secondary" onClick={async () => {
      if (await state.load()) notify('success', 'List refreshed.');else notify('error', 'Request failed. Please try again.');
    }}>{t('Refresh')}</button></div>}><DemoNotice /><FilterBar value={filters} onApply={next => {
      setFilters(next);
      setPage(1);
    }} placeholder="Search orders, customers or cities" selects={[{
      name: 'status',
      label: 'Status',
      options: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Canceled']
    }, {
      name: 'payment',
      label: 'Payment',
      options: ['Paid', 'Unpaid']
    }]} />{(error || state.error) && <ErrorNotice message={error || errorText(state.error, t)} retry={state.load} />} {!state.data ? <Loading /> : !state.data.data.length ? <Empty>{t('No results match your filters.')}</Empty> : <><p className="mc-muted">{t(state.data.total === 1 ? '1 order' : '{count} orders', {
          count: state.data.total
        })}</p><div className="mc-bookings">{state.data.data.map(o => <article className="mc-card mc-order-card" key={o.id}><div className="mc-order-summary"><div><div className="mc-person-line"><h2 className="mc-order-number"><bdi>{o.number || o.reference}</bdi></h2><button className="mc-icon-button" aria-label={t('Copy order reference')} onClick={() => copy(o.number || o.reference)}><Copy size={15} /></button></div><p>{date(o.created_at)}</p></div><Person user={o.customer} /><div><strong className="mc-price">{money(o.total_cents)}</strong><p>{t(o.payment_status)} · {t('Cash on delivery')}</p></div><Status value={o.status} /></div><details className="mc-order-details"><summary>{t('View order details')}</summary><div className="mc-order-detail-grid"><div><h3>{t('Your items')}</h3>{o.items.map(i => <div className="mc-order-item" key={i.id}><ProductImage compact product={i.product} /><div><strong>{t(i.name)}</strong><p>{i.sku} · {i.quantity} × {money(i.unit_price_cents)}</p></div><strong>{money(i.line_total_cents)}</strong></div>)}<p>{t('Delivery fee')}: {money(o.delivery_fee_cents)}</p></div><div><h3>{t('Delivery details')}</h3><Person user={o.customer?.name === o.recipient ? o.customer : {
                  name: o.recipient
                }} /><p><bdi>{o.phone}</bdi></p><p>{o.address}, {o.city}</p></div></div><h3>{t('Order history')}</h3><div className="mc-order-timeline">{o.events.map(ev => <div key={ev.id}><Status value={ev.status} /><Person user={ev.actor} /><time>{new Intl.DateTimeFormat(language, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }).format(new Date(ev.created_at))}</time></div>)}</div></details><div className="mc-actions">{admin && o.status === 'Pending' && <button className="mc-button" disabled={busy === o.id} onClick={() => change(o, 'Confirmed')}>{t('Confirm')}</button>}{admin && o.status === 'Confirmed' && <button className="mc-button" disabled={busy === o.id} onClick={() => change(o, 'Shipped')}>{t('Mark shipped')}</button>}{admin && o.status === 'Shipped' && <button className="mc-button" disabled={busy === o.id} onClick={() => change(o, 'Delivered')}>{t('Mark delivered and paid')}</button>}{(o.status === 'Pending' || admin && o.status === 'Confirmed') && <button className="mc-button secondary" disabled={busy === o.id} onClick={() => change(o, 'Canceled')}>{t('Cancel')}</button>}</div></article>)}</div><Pager page={page} last={state.data.last_page} setPage={setPage} /></>}</Page>;
}
export function ProductsAdmin() {
  const {
      t
    } = useLocale(),
    money = useMoney();
  const [page, setPage] = useState(1),
    [filters, setFilters] = useState({}),
    [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const state = useData(`/shop/products?${queryString({
    page,
    ...filters
  })}`);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = e.currentTarget;
    const body = new FormData(form);
    body.set('price_cents', String(Math.round(Number(body.get('price')) * 100)));
    body.delete('price');
    for (const key of ['is_active', 'requires_prescription', 'remove_image']) body.set(key, form.elements.namedItem(key)?.checked ? '1' : '0');
    if (!body.get('image')?.size) body.delete('image');
    if (editing.id) {
      body.set('_method', 'PUT');
      body.set('expected_stock', String(editing.stock));
    }
    try {
      await api.post(editing.id ? `/shop/products/${editing.id}` : '/shop/products', body);
      setEditing(null);
      await state.load();
    } catch (e) {
      setError(errorText(e, t));
      if (e.response?.status === 409) await state.load();
    } finally {
      setBusy(false);
    }
  }
  return <Page title={t('Products')} action={<div className="mc-actions"><button className="mc-button secondary" onClick={async () => {
      if (await state.load()) notify('success', 'List refreshed.');else notify('error', 'Request failed. Please try again.');
    }}>{t('Refresh')}</button><button className="mc-button" onClick={() => {
      setEditing({});
      setError('');
    }}>{t('Add product')}</button></div>}><DemoNotice /><FilterBar value={filters} onApply={next => {
      setFilters(next);
      setPage(1);
    }} selects={[{
      name: 'category',
      label: 'Category',
      options: state.data?.categories || []
    }, {
      name: 'active',
      label: 'Status',
      options: [['active', 'Active'], ['inactive', 'Inactive']]
    }, {
      name: 'stock',
      label: 'Stock',
      options: [['available', 'In stock'], ['low', 'Low stock'], ['out', 'Out of stock']]
    }]} />{error && <ErrorNotice message={error} />} {editing && <form className="mc-card mc-form mc-section-gap" key={editing.id ? `${editing.id}-${editing.stock}` : 'new'} onSubmit={save}><h2>{t(editing.id ? 'Edit product' : 'Add product')}</h2><div className="mc-product-editor"><ProductImageField product={editing} /><div className="mc-form"><div className="mc-grid two"><Field label={t('Name')} name="name" defaultValue={editing.name || ''} required maxLength={160} /><Field label="SKU" name="sku" defaultValue={editing.sku || ''} required maxLength={60} pattern="[A-Za-z0-9_-]+" /><Field label={t('Category')} name="category" defaultValue={editing.category || ''} required maxLength={80} /><Field label={t('Price (MAD)')} name="price" type="number" step="0.01" min="0.01" max="100000" defaultValue={editing.price_cents ? editing.price_cents / 100 : ''} required /><Field label={t('Available stock')} name="stock" type="number" min="0" max="100000" step="1" defaultValue={editing.stock || 0} required /></div><Field label={t('Description')}><textarea name="description" defaultValue={editing.description || ''} required maxLength={2000} rows={3} /></Field><div className="mc-actions"><label className="mc-checkbox"><input name="is_active" type="checkbox" defaultChecked={editing.is_active ?? true} />{t('Active')}</label><label className="mc-checkbox"><input name="requires_prescription" type="checkbox" defaultChecked={editing.requires_prescription || false} />{t('Requires prescription (not orderable)')}</label></div></div></div><div className="mc-actions"><button className="mc-button" disabled={busy}>{t('Save')}</button><button type="button" className="mc-button secondary" disabled={busy} onClick={() => setEditing(null)}>{t('Cancel')}</button></div></form>}{state.error ? <ErrorNotice message={errorText(state.error, t)} retry={state.load} /> : !state.data ? <Loading /> : <><p className="mc-muted">{t(state.data.products.total === 1 ? '1 product' : '{count} products', {
          count: state.data.products.total
        })}</p><div className="mc-table-scroll"><table><thead><tr>{['Product', 'Category', 'Price (MAD)', 'Stock', 'Status', 'Actions'].map(x => <th key={x}>{t(x)}</th>)}</tr></thead><tbody>{state.data.products.data.map(p => <tr key={p.id}><td><span className="mc-person"><ProductImage compact product={p} /><span><strong>{t(p.name)}</strong><br /><small>{p.sku}</small></span></span></td><td>{t(p.category)}</td><td>{money(p.price_cents)}</td><td><StockBadge stock={p.stock} /></td><td>{t(p.is_active ? 'Active' : 'Inactive')}</td><td><button className="mc-button secondary" onClick={() => {
                  setEditing(p);
                  setError('');
                }}>{t('Edit')}</button></td></tr>)}</tbody></table>{!state.data.products.data.length && <Empty>{t('No results match your filters.')}</Empty>}</div><Pager page={page} last={state.data.products.last_page} setPage={setPage} /></>}</Page>;
}
