import React, {useState} from 'react';

const navItems = ['General', 'Appearance', 'Notifications', 'Profile', 'Security'];

export default function SettingsDashboard() {
  const [page, setPage] = useState('General');
  const [appName, setAppName] = useState('My App');
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <header style={{height: 56, borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px'}}>
        <h1 style={{fontSize: 18, fontWeight: 600, margin: 0}}>Settings</h1>
      </header>
      <div style={{display: 'flex', flex: 1}}>
        <nav style={{width: 220, borderRight: '1px solid #e5e7eb', padding: 12}}>
          {navItems.map(item => (
            <button key={item} type="button" onClick={() => setPage(item)}
              style={{display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 6, border: 'none',
                background: page === item ? '#f3f4f6' : 'transparent', fontWeight: page === item ? 600 : 400, cursor: 'pointer', fontSize: 14, marginBottom: 2}}>
              {item}
            </button>
          ))}
        </nav>
        <main style={{flex: 1, padding: 32}}>
          <h2 style={{fontSize: 22, fontWeight: 700, marginBottom: 24}}>{page}</h2>
          {page === 'General' && (
            <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 20}}>
              <label style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Application name</label>
              <input value={appName} onChange={e => setAppName(e.target.value)}
                style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14}} />
              <p style={{fontSize: 13, color: '#888', marginTop: 8}}>Displayed in browser tab.</p>
            </div>
          )}
          {page === 'Appearance' && (
            <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <span style={{fontSize: 14, fontWeight: 500}}>Dark mode</span>
              <label style={{position: 'relative', display: 'inline-block', width: 44, height: 24}}>
                <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} style={{opacity: 0, width: 0, height: 0}} />
                <span style={{position: 'absolute', inset: 0, background: dark ? '#2563eb' : '#ccc', borderRadius: 12, transition: 'background 0.2s', cursor: 'pointer'}} />
                <span style={{position: 'absolute', top: 2, left: dark ? 22 : 2, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.2s'}} />
              </label>
            </div>
          )}
          {page === 'Notifications' && (
            <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div>
                <span style={{fontSize: 14, fontWeight: 500}}>Email notifications</span>
                <p style={{fontSize: 13, color: '#888', margin: '2px 0 0'}}>Receive email updates.</p>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: 44, height: 24}}>
                <input type="checkbox" checked={notif} onChange={e => setNotif(e.target.checked)} style={{opacity: 0, width: 0, height: 0}} />
                <span style={{position: 'absolute', inset: 0, background: notif ? '#2563eb' : '#ccc', borderRadius: 12, transition: 'background 0.2s', cursor: 'pointer'}} />
                <span style={{position: 'absolute', top: 2, left: notif ? 22 : 2, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left 0.2s'}} />
              </label>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
