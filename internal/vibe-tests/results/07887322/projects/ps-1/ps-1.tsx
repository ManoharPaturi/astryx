import React, {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import {SideNav, SideNavSection, SideNavItem, SideNavHeading} from '@astryxdesign/core/SideNav';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';

export default function SettingsDashboard() {
  const [page, setPage] = useState('general');
  const [appName, setAppName] = useState('My App');
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  return (
    <AppShell
      topNav={<TopNav heading={<TopNavHeading>Settings</TopNavHeading>} />}
      sideNav={
        <SideNav header={<SideNavHeading>Settings</SideNavHeading>} collapsible>
          <SideNavSection title="Config">
            <SideNavItem label="General" isSelected={page === 'general'} onClick={() => setPage('general')} />
            <SideNavItem label="Appearance" isSelected={page === 'appearance'} onClick={() => setPage('appearance')} />
            <SideNavItem label="Notifications" isSelected={page === 'notifications'} onClick={() => setPage('notifications')} />
          </SideNavSection>
        </SideNav>
      }
    >
      <div className="flex flex-col gap-6 p-6">
        <Heading level={2}>{page.charAt(0).toUpperCase() + page.slice(1)}</Heading>
        {page === 'general' && (
          <Card><div className="flex flex-col gap-3">
            <TextInput label="App name" value={appName} onChange={setAppName} />
            <Text type="supporting">Displayed in browser tab and notifications.</Text>
          </div></Card>
        )}
        {page === 'appearance' && (
          <Card><Switch label="Dark mode" value={dark} onChange={setDark} /></Card>
        )}
        {page === 'notifications' && (
          <Card><Switch label="Email notifications" value={notif} onChange={setNotif} description="Receive email updates." /></Card>
        )}
      </div>
    </AppShell>
  );
}
