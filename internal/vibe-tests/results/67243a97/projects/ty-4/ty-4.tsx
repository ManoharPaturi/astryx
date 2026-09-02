import React, {useState} from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState('en');
  const [tz, setTz] = useState('utc');
  const [emailNotif, setEmailNotif] = useState(true);
  const [push, setPush] = useState(false);
  const [digest, setDigest] = useState(true);

  const sectionStyle = {border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 24};
  const labelStyle = {display: 'block' as const, fontSize: 14, fontWeight: 500 as const, marginBottom: 4};
  const inputStyle = {width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14};

  const Toggle = ({checked, onChange, label, desc}: {checked: boolean; onChange: (v: boolean) => void; label: string; desc: string}) => (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0'}}>
      <div><span style={{fontSize: 14, fontWeight: 500}}>{label}</span><p style={{fontSize: 13, color: '#888', margin: '2px 0 0'}}>{desc}</p></div>
      <label style={{position: 'relative', display: 'inline-block', width: 44, height: 24}}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{opacity: 0, width: 0, height: 0}} />
        <span style={{position: 'absolute', inset: 0, background: checked ? '#2563eb' : '#ccc', borderRadius: 12, transition: 'background 0.2s', cursor: 'pointer'}} />
        <span style={{position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.2s'}} />
      </label>
    </div>
  );

  return (
    <div style={{maxWidth: 600, margin: '0 auto', fontFamily: 'system-ui, sans-serif', padding: 32}}>
      <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 32}}>Settings</h1>

      <div style={sectionStyle}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Profile</h2>
        <p style={{color: '#666', fontSize: 14, marginBottom: 16}}>Manage your personal information.</p>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div><label style={labelStyle}>Display name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} /></div>
          <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} /></div>
        </div>
      </div>

      <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0'}} />

      <div style={sectionStyle}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Preferences</h2>
        <p style={{color: '#666', fontSize: 14, marginBottom: 16}}>Locale and regional settings.</p>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div>
            <label style={labelStyle}>Language</label>
            <select value={lang} onChange={e => setLang(e.target.value)} style={inputStyle}>
              <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Timezone</label>
            <select value={tz} onChange={e => setTz(e.target.value)} style={inputStyle}>
              <option value="utc">UTC</option><option value="est">Eastern</option><option value="pst">Pacific</option>
            </select>
          </div>
        </div>
      </div>

      <hr style={{border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0'}} />

      <div style={sectionStyle}>
        <h2 style={{fontSize: 18, fontWeight: 600, marginBottom: 4}}>Notifications</h2>
        <p style={{color: '#666', fontSize: 14, marginBottom: 16}}>Control how you receive notifications.</p>
        <Toggle checked={emailNotif} onChange={setEmailNotif} label="Email notifications" desc="Important updates via email." />
        <Toggle checked={push} onChange={setPush} label="Push notifications" desc="Real-time alerts." />
        <Toggle checked={digest} onChange={setDigest} label="Weekly digest" desc="Summary every Monday." />
      </div>
    </div>
  );
}
