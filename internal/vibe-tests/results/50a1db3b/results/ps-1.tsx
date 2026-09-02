import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';

const navItems = ['General', 'Appearance', 'Notifications', 'Profile', 'Security'];

export default function SettingsDashboard() {
  const [page, setPage] = useState('General');
  const [appName, setAppName] = useState('My App');
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  return (
    <div className="flex h-screen">
      <header className="fixed top-0 left-0 right-0 h-14 border-b bg-background flex items-center px-6 z-10">
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <aside className="w-56 border-r pt-14 p-4 flex flex-col gap-1">
        {navItems.map(item => (
          <Button key={item} variant={page === item ? 'secondary' : 'ghost'}
            className="justify-start" onClick={() => setPage(item)}>
            {item}
          </Button>
        ))}
      </aside>

      <main className="flex-1 pt-14 p-6">
        <h2 className="text-2xl font-bold mb-6">{page}</h2>
        {page === 'General' && (
          <Card><CardHeader><CardTitle>Application</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label htmlFor="app-name">Application name</Label><Input id="app-name" value={appName} onChange={e => setAppName(e.target.value)} /></div>
              <p className="text-sm text-muted-foreground">Displayed in browser tab and notifications.</p>
            </CardContent></Card>
        )}
        {page === 'Appearance' && (
          <Card><CardContent className="pt-6 flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <Switch id="dark-mode" checked={dark} onCheckedChange={setDark} />
          </CardContent></Card>
        )}
        {page === 'Notifications' && (
          <Card><CardContent className="pt-6 flex items-center justify-between">
            <div><Label htmlFor="email-notif">Email notifications</Label><p className="text-sm text-muted-foreground">Receive email updates.</p></div>
            <Switch id="email-notif" checked={notif} onCheckedChange={setNotif} />
          </CardContent></Card>
        )}
      </main>
    </div>
  );
}
