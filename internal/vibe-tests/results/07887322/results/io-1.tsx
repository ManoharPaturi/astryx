import React, {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';
import {FormLayout} from '@astryxdesign/core/FormLayout';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!isValidEmail(email)) { setErrorMsg('Please enter a valid email.'); return; }
    setErrorMsg('');
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email})});
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setEmail('');
    } catch { setStatus('error'); }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col gap-4 p-6">
      <Heading level={3}>Subscribe</Heading>
      <Text>Get the latest updates delivered to your inbox.</Text>
      {status === 'success' && <Banner variant="success">Subscribed!</Banner>}
      {status === 'error' && <Banner variant="error">Something went wrong.</Banner>}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <FormLayout>
          <TextInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" isRequired
            status={errorMsg ? {type: 'error', message: errorMsg} : undefined} />
          <Button label="Subscribe" variant="primary" type="submit" isLoading={status === 'loading'} />
        </FormLayout>
      </form>
    </div>
  );
}
