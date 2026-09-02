import React from 'react';

const projects = [
  {title: 'Website Redesign', desc: 'Modernize the marketing site.', status: 'In Progress', color: '#dbeafe', textColor: '#1e40af'},
  {title: 'Mobile App', desc: 'Build a native companion app.', status: 'Completed', color: '#dcfce7', textColor: '#15803d'},
  {title: 'API Migration', desc: 'Migrate from REST to GraphQL.', status: 'Planning', color: '#fef9c3', textColor: '#a16207'},
  {title: 'Analytics Dashboard', desc: 'Real-time metrics and reporting.', status: 'In Progress', color: '#dbeafe', textColor: '#1e40af'},
  {title: 'Auth Service', desc: 'Implement SSO and MFA.', status: 'Completed', color: '#dcfce7', textColor: '#15803d'},
  {title: 'Design Tokens', desc: 'Extract shared design tokens.', status: 'Planning', color: '#fef9c3', textColor: '#a16207'},
];

export default function ProjectCards() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16, fontFamily: 'system-ui, sans-serif'}}>
      {projects.map(p => (
        <div key={p.title} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 20}}>
          <span style={{display: 'inline-block', padding: '2px 8px', borderRadius: 9999, background: p.color, color: p.textColor, fontSize: 12, fontWeight: 600, marginBottom: 8}}>{p.status}</span>
          <h3 style={{fontSize: 16, fontWeight: 600, margin: '8px 0 4px'}}>{p.title}</h3>
          <p style={{fontSize: 14, color: '#555', margin: 0}}>{p.desc}</p>
        </div>
      ))}
    </div>
  );
}
