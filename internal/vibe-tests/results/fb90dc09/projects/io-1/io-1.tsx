import React, {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Banner} from '@astryxdesign/core/Banner';
import {FormLayout} from '@astryxdesign/core/FormLayout';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setErrorMessage('');
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });
      if (!res.ok) throw new Error('Subscription failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <VStack gap={3}>
      <Heading level={3}>Subscribe to our newsletter</Heading>
      <Text>Get the latest updates delivered to your inbox.</Text>

      {status === 'success' && (
        <Banner variant="success">You have been subscribed.</Banner>
      )}
      {status === 'error' && (
        <Banner variant="error">Something went wrong. Please try again.</Banner>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <FormLayout>
          <TextInput
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            isRequired
            status={errorMessage ? {type: 'error', message: errorMessage} : undefined}
          />
          <Button
            label="Subscribe"
            variant="primary"
            type="submit"
            isLoading={status === 'loading'}
          />
        </FormLayout>
      </form>
    </VStack>
  );
}
