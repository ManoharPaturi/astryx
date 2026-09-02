import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Progress} from '@/components/ui/progress';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const steps = ['Personal Info', 'Preferences', 'Review'];

export default function FormWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 p-6">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        {steps.map((s, i) => (
          <span key={s} className={i <= step ? 'font-medium text-foreground' : ''}>{s}</span>
        ))}
      </div>
      <Progress value={progress} />

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 0 && (
            <>
              <div><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            </>
          )}
          {step === 1 && (
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="pm">Product Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {name || '(not provided)'}</p>
              <p><strong>Email:</strong> {email || '(not provided)'}</p>
              <p><strong>Role:</strong> {role || '(not selected)'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>Back</Button>
        {step < steps.length - 1
          ? <Button onClick={() => setStep(s => s + 1)}>Next</Button>
          : <Button onClick={() => alert('Submitted!')}>Submit</Button>}
      </div>
    </div>
  );
}
