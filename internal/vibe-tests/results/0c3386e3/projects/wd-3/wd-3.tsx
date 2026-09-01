import {useState} from 'react';

const steps = ['Welcome', 'Profile', 'Preferences', 'Done'];

export default function OnboardingFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleNext = () => setActiveStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24, padding: 24, maxWidth: 500}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        {steps.map((step, i) => (
          <div key={step} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600,
              backgroundColor: i <= activeStep ? '#0066cc' : '#e5e7eb',
              color: i <= activeStep ? '#fff' : '#666',
            }}>
              {i + 1}
            </div>
            <span style={{fontSize: 12, color: '#666'}}>{step}</span>
          </div>
        ))}
      </div>

      {activeStep === 0 && (
        <div>
          <h2 style={{margin: '0 0 8px'}}>Welcome!</h2>
          <p style={{color: '#666', margin: 0}}>Let us get you set up. This will only take a minute.</p>
        </div>
      )}

      {activeStep === 1 && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <h2 style={{margin: 0}}>Profile Setup</h2>
          <div>
            <label htmlFor="name" style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Name *</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} style={{width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box'}} />
          </div>
          <div>
            <label htmlFor="email" style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Email *</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', boxSizing: 'border-box'}} />
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <h2 style={{margin: 0}}>Preferences</h2>
          <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
            Enable dark mode
          </label>
          <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
            Email notifications
          </label>
        </div>
      )}

      {activeStep === 3 && (
        <div>
          <h2 style={{margin: '0 0 8px'}}>All Set!</h2>
          <p style={{color: '#666', margin: 0}}>Your account is ready. Welcome aboard, {name || 'friend'}!</p>
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
        {activeStep > 0 && activeStep < 3 && (
          <button onClick={handleBack} style={{padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', background: 'transparent', cursor: 'pointer'}}>Back</button>
        )}
        {activeStep < 3 && (
          <button onClick={handleNext} style={{padding: '8px 16px', borderRadius: 6, border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: 600}}>
            {activeStep === 0 ? 'Get Started' : 'Next'}
          </button>
        )}
      </div>
    </div>
  );
}
