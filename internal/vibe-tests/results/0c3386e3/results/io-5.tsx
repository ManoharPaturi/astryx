import {useState} from 'react';

const MAX_DESCRIPTION_LENGTH = 1000;

export default function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({subject, description, priority}),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14, boxSizing: 'border-box' as const};

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 500}}>
      <h2 style={{margin: 0}}>Submit a Support Ticket</h2>

      <div>
        <label htmlFor="subject" style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Subject *</label>
        <input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of the issue" style={inputStyle} />
      </div>

      <div>
        <label htmlFor="desc" style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Description *</label>
        <textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
          placeholder="Describe your issue in detail..."
          rows={6}
          style={{...inputStyle, resize: 'vertical'}}
        />
        <p style={{fontSize: 12, color: '#666', margin: '4px 0 0'}}>{description.length}/{MAX_DESCRIPTION_LENGTH} characters</p>
      </div>

      <div>
        <label htmlFor="priority" style={{display: 'block', fontWeight: 600, marginBottom: 4}}>Priority *</label>
        <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
          <option value="">Select priority level</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!subject || !description || !priority || isSubmitting}
        style={{
          padding: '10px 16px', borderRadius: 6, border: 'none',
          backgroundColor: (!subject || !description || !priority) ? '#ccc' : '#0066cc',
          color: '#fff', cursor: (!subject || !description || !priority) ? 'not-allowed' : 'pointer', fontWeight: 600,
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </div>
  );
}
