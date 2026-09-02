import React, {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import {SideNav, SideNavSection, SideNavItem, SideNavHeading} from '@astryxdesign/core/SideNav';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {Card} from '@astryxdesign/core/Card';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';

export default function SettingsDashboard() {
  const [activePage, setActivePage] = useState('general');
  const [appName, setAppName] = useState('My Application');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <AppShell
      topNav={
        <TopNav
          heading={<TopNavHeading>Settings</TopNavHeading>}
        />
      }
      sideNav={
        <SideNav
          header={<SideNavHeading>Settings</SideNavHeading>}
          collapsible
        >
          <SideNavSection title="Configuration">
            <SideNavItem
              label="General"
              isSelected={activePage === 'general'}
              onClick={() => setActivePage('general')}
            />
            <SideNavItem
              label="Appearance"
              isSelected={activePage === 'appearance'}
              onClick={() => setActivePage('appearance')}
            />
            <SideNavItem
              label="Notifications"
              isSelected={activePage === 'notifications'}
              onClick={() => setActivePage('notifications')}
            />
          </SideNavSection>
          <SideNavSection title="Account">
            <SideNavItem
              label="Profile"
              isSelected={activePage === 'profile'}
              onClick={() => setActivePage('profile')}
            />
            <SideNavItem
              label="Security"
              isSelected={activePage === 'security'}
              onClick={() => setActivePage('security')}
            />
          </SideNavSection>
        </SideNav>
      }
    >
      <VStack gap={4}>
        <Heading level={2}>
          {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
        </Heading>

        {activePage === 'general' && (
          <Card>
            <VStack gap={3}>
              <TextInput
                label="Application name"
                value={appName}
                onChange={setAppName}
              />
              <Text type="supporting">
                This name is displayed in the browser tab and notifications.
              </Text>
            </VStack>
          </Card>
        )}

        {activePage === 'appearance' && (
          <Card>
            <VStack gap={3}>
              <Switch
                label="Dark mode"
                value={darkMode}
                onChange={setDarkMode}
              />
            </VStack>
          </Card>
        )}

        {activePage === 'notifications' && (
          <Card>
            <VStack gap={3}>
              <Switch
                label="Email notifications"
                value={notifications}
                onChange={setNotifications}
                description="Receive email updates about account activity."
              />
            </VStack>
          </Card>
        )}
      </VStack>
    </AppShell>
  );
}
