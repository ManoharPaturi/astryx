import React, {useState} from 'react';

const steps = ['Personal Info', 'Preferences', 'Review'];
const roles = ['Designer', 'Developer', 'PM', 'Other'];

export default function FormWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  return (
    <div style={{maxWidth: 500, margin: '0 auto', fontFamily: 'system-ui, sans-serif', padding: 24}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
        {steps.map((s, i) => (
          <span key={s} style={{fontSize: 13, fontWeight: i <= step ? 600 : 400, color: i <= step ? '#111' : '#888'}}>{s}</span>
        ))}
      </div>
      <div style={{height: 4, background: '#e5e7eb', borderRadius: 2, marginBottom: 24}}>
        <div style={{height: '100%', width: `${((step + 1) / steps.length) * 100}%`, background: '#2563eb', borderRadius: 2, transition: 'width 0.3s'}} />
      </div>

      <div style={{minHeight: 200}}>
        {step === 0 && (
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <h3 style={{fontSize: 18, fontWeight: 600}}>Personal Information</h3>
            <div>
              <label htmlFor="name" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Full name *</label>
              <input id="name" value={name} onChange={e => setName(e.target.value)} required
                style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14}} />
            </div>
            <div>
              <label htmlFor="email" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Email *</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14}} />
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 12}}>Preferences</h3>
            <label htmlFor="role" style={{display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4}}>Role</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value)}
              style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14}}>
              <option value="">Select a role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 style={{fontSize: 18, fontWeight: 600, marginBottom: 12}}>Review</h3>
            <p style={{margin: '4px 0'}}><strong>Name:</strong> {name || '(not provided)'}</p>
            <p style={{margin: '4px 0'}}><strong>Email:</strong> {email || '(not provided)'}</p>
            <p style={{margin: '4px 0'}}><strong>Role:</strong> {role || '(not selected)'}</p>
          </div>
        )}
      </div>

      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24}}>
        <button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)}
          style={{padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc', background: 'white', cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.5 : 1}}>Back</button>
        {step < steps.length - 1
          ? <button type="button" onClick={() => setStep(s => s + 1)} style={{padding: '8px 20px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer'}}>Next</button>
          : <button type="button" onClick={() => alert('Submitted!')} style={{padding: '8px 20px', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer'}}>Submit</button>}
      </div>
    </div>
  );
}
