import React, {useState} from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Divider} from '@astryxdesign/core/Divider';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Card} from '@astryxdesign/core/Card';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState('en');
  const [tz, setTz] = useState('utc');
  const [emailNotif, setEmailNotif] = useState(true);
  const [push, setPush] = useState(false);
  const [digest, setDigest] = useState(true);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 p-6">
      <Heading level={1}>Settings</Heading>

      <Card>
        <div className="flex flex-col gap-3">
          <Heading level={3}>Profile</Heading>
          <Text>Manage your personal information.</Text>
          <FormLayout>
            <TextInput label="Display name" value={name} onChange={setName} placeholder="Your name" />
            <TextInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          </FormLayout>
        </div>
      </Card>

      <Divider />

      <Card>
        <div className="flex flex-col gap-3">
          <Heading level={3}>Preferences</Heading>
          <Text>Locale and regional settings.</Text>
          <FormLayout>
            <Selector label="Language" options={[{value:'en',label:'English'},{value:'es',label:'Spanish'},{value:'fr',label:'French'}]} value={lang} onChange={setLang} />
            <Selector label="Timezone" options={[{value:'utc',label:'UTC'},{value:'est',label:'Eastern'},{value:'pst',label:'Pacific'}]} value={tz} onChange={setTz} />
          </FormLayout>
        </div>
      </Card>

      <Divider />

      <Card>
        <div className="flex flex-col gap-3">
          <Heading level={3}>Notifications</Heading>
          <Text>Control how you receive notifications.</Text>
          <Switch label="Email notifications" value={emailNotif} onChange={setEmailNotif} description="Important updates via email." />
          <Switch label="Push notifications" value={push} onChange={setPush} description="Real-time alerts." />
          <Switch label="Weekly digest" value={digest} onChange={setDigest} description="Summary every Monday." />
        </div>
      </Card>
    </div>
  );
}
