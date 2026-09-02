import React, {useState} from 'react';

function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setErrorMsg('Please enter a valid email.'); return; }
    setErrorMsg(''); setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email})});
      if (!res.ok) throw new Error('fail');
      setStatus('success'); setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <div style={{maxWidth: 400, margin: '0 auto', fontFamily: 'system-ui, sans-serif', padding: 24}}>
      <h2 style={{fontSize: 22, fontWeight: 700, marginBottom: 4}}>Subscribe</h2>
      <p style={{color: '#666', marginBottom: 16, fontSize: 14}}>Get the latest updates delivered to your inbox.</p>
      {status === 'success' && <p style={{color: '#16a34a', marginBottom: 12}}>Subscribed!</p>}
      {status === 'error' && <p style={{color: '#dc2626', marginBottom: 12}}>Something went wrong.</p>}
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <div>
          <label htmlFor="email" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Email address *</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
            style={{width: '100%', padding: '8px 12px', border: `1px solid ${errorMsg ? '#dc2626' : '#ccc'}`, borderRadius: 6, fontSize: 14}} />
          {errorMsg && <p style={{color: '#dc2626', fontSize: 12, marginTop: 4}}>{errorMsg}</p>}
        </div>
        <button type="submit" disabled={status === 'loading'}
          style={{padding: '10px 20px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontWeight: 500, cursor: status === 'loading' ? 'wait' : 'pointer', opacity: status === 'loading' ? 0.7 : 1}}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
