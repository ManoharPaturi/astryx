import React, {useState} from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Divider} from '@astryxdesign/core/Divider';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Card} from '@astryxdesign/core/Card';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('utc');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <VStack gap={5}>
      <Heading level={1}>Settings</Heading>

      <Card>
        <VStack gap={3}>
          <Heading level={3}>Profile</Heading>
          <Text>Manage your personal information and how others see you.</Text>
          <FormLayout>
            <TextInput
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              placeholder="Enter your name"
            />
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />
          </FormLayout>
        </VStack>
      </Card>

      <Divider />

      <Card>
        <VStack gap={3}>
          <Heading level={3}>Preferences</Heading>
          <Text>Customize your experience with locale and regional settings.</Text>
          <FormLayout>
            <Selector
              label="Language"
              options={[
                {value: 'en', label: 'English'},
                {value: 'es', label: 'Spanish'},
                {value: 'fr', label: 'French'},
                {value: 'de', label: 'German'},
                {value: 'ja', label: 'Japanese'},
              ]}
              value={language}
              onChange={setLanguage}
            />
            <Selector
              label="Timezone"
              options={[
                {value: 'utc', label: 'UTC'},
                {value: 'est', label: 'Eastern (US)'},
                {value: 'pst', label: 'Pacific (US)'},
                {value: 'cet', label: 'Central European'},
                {value: 'jst', label: 'Japan Standard'},
              ]}
              value={timezone}
              onChange={setTimezone}
            />
          </FormLayout>
        </VStack>
      </Card>

      <Divider />

      <Card>
        <VStack gap={3}>
          <Heading level={3}>Notifications</Heading>
          <Text>Control how and when you receive notifications.</Text>
          <VStack gap={2}>
            <Switch
              label="Email notifications"
              value={emailNotifications}
              onChange={setEmailNotifications}
              description="Receive important updates via email."
            />
            <Switch
              label="Push notifications"
              value={pushNotifications}
              onChange={setPushNotifications}
              description="Get real-time alerts on your devices."
            />
            <Switch
              label="Weekly digest"
              value={weeklyDigest}
              onChange={setWeeklyDigest}
              description="A summary of activity sent every Monday."
            />
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
}
