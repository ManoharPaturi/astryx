import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Separator} from '@/components/ui/separator';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState('en');
  const [tz, setTz] = useState('utc');
  const [emailNotif, setEmailNotif] = useState(true);
  const [push, setPush] = useState(false);
  const [digest, setDigest] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Manage your personal information.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="name">Display name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle><CardDescription>Locale and regional settings.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Timezone</Label>
            <Select value={tz} onValueChange={setTz}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern</SelectItem>
                <SelectItem value="pst">Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Control how you receive notifications.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><Label htmlFor="em">Email notifications</Label><p className="text-sm text-muted-foreground">Important updates via email.</p></div>
            <Switch id="em" checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label htmlFor="pu">Push notifications</Label><p className="text-sm text-muted-foreground">Real-time alerts.</p></div>
            <Switch id="pu" checked={push} onCheckedChange={setPush} />
          </div>
          <div className="flex items-center justify-between">
            <div><Label htmlFor="di">Weekly digest</Label><p className="text-sm text-muted-foreground">Summary every Monday.</p></div>
            <Switch id="di" checked={digest} onCheckedChange={setDigest} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
