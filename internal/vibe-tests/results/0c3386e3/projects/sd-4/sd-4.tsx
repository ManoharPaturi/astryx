import {useState} from 'react';

const TERMS_TEXT = `Terms of Service\n\n1. Acceptance of Terms\nBy accessing and using this service, you accept and agree to be bound by these terms.\n\n2. Description of Service\nWe provide a platform for managing digital content.\n\n3. User Responsibilities\nYou are responsible for maintaining the confidentiality of your account credentials.\n\n4. Privacy\nYour use of the service is governed by our Privacy Policy.\n\n5. Intellectual Property\nAll content and functionality are protected by intellectual property laws.\n\n6. Limitation of Liability\nWe shall not be liable for indirect or consequential damages.\n\n7. Termination\nWe reserve the right to terminate access for violations.\n\n8. Governing Law\nThese terms are governed by the laws of the applicable jurisdiction.`;

export default function TermsAcceptanceForm() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canContinue = agreedToTerms && agreedToPrivacy;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 500}}>
      <h2 style={{margin: 0}}>Terms and Conditions</h2>
      <p style={{color: '#666', margin: 0}}>Please read and accept the following terms to continue.</p>

      <div style={{maxHeight: 280, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 8, padding: 16}}>
        <p style={{whiteSpace: 'pre-line', fontSize: 14, margin: 0}}>{TERMS_TEXT}</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
          I agree to the Terms of Service
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <input type="checkbox" checked={agreedToPrivacy} onChange={(e) => setAgreedToPrivacy(e.target.checked)} />
          I agree to the Privacy Policy
        </label>
      </div>

      <button
        disabled={!canContinue}
        style={{
          padding: '10px 16px', borderRadius: 6, border: 'none',
          backgroundColor: canContinue ? '#0066cc' : '#ccc',
          color: '#fff', cursor: canContinue ? 'pointer' : 'not-allowed', fontWeight: 600,
        }}
      >
        Continue
      </button>
    </div>
  );
}
