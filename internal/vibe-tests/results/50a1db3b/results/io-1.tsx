import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
      if (!res.ok) throw new Error('Failed');
      setStatus('success'); setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Subscribe</CardTitle>
        <CardDescription>Get the latest updates delivered to your inbox.</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'success' && <p className="text-green-600 mb-4">Subscribed!</p>}
        {status === 'error' && <p className="text-destructive mb-4">Something went wrong.</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            {errorMsg && <p className="text-sm text-destructive mt-1">{errorMsg}</p>}
          </div>
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
