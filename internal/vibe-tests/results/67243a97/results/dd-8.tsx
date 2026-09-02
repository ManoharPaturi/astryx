import React from 'react';

const typePillColor: Record<string, {bg: string; text: string}> = {
  Article: {bg: '#dbeafe', text: '#1e40af'},
  Video: {bg: '#ede9fe', text: '#6d28d9'},
  Podcast: {bg: '#ffedd5', text: '#c2410c'},
  Newsletter: {bg: '#ccfbf1', text: '#0f766e'},
  Course: {bg: '#dcfce7', text: '#15803d'},
};

const data = [
  {id: 1, title: 'Getting Started with React', type: 'Article', author: 'Jane Smith', date: '2024-01-15', status: 'Published'},
  {id: 2, title: 'Advanced TypeScript', type: 'Video', author: 'John Doe', date: '2024-01-20', status: 'Draft'},
  {id: 3, title: 'Design System Deep Dive', type: 'Podcast', author: 'Alice Wong', date: '2024-02-01', status: 'Published'},
  {id: 4, title: 'Weekly UI Digest', type: 'Newsletter', author: 'Bob Lee', date: '2024-02-05', status: 'Published'},
  {id: 5, title: 'Accessibility Fundamentals', type: 'Course', author: 'Carol Park', date: '2024-02-10', status: 'In Review'},
  {id: 6, title: 'CSS Grid Guide', type: 'Article', author: 'Dan Kim', date: '2024-02-12', status: 'Published'},
  {id: 7, title: 'Component Architecture', type: 'Video', author: 'Eve Chen', date: '2024-02-15', status: 'Draft'},
  {id: 8, title: 'UX Research Methods', type: 'Podcast', author: 'Frank Liu', date: '2024-02-18', status: 'Published'},
];

export default function ContentLibrary() {
  const cellStyle = {padding: '10px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 14};
  const headerStyle = {...cellStyle, fontWeight: 600, background: '#f9fafb', fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 0.5};

  return (
    <div style={{fontFamily: 'system-ui, sans-serif', padding: 16}}>
      <h2 style={{fontSize: 22, fontWeight: 700, marginBottom: 16}}>Content Library</h2>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            <th style={headerStyle}>Title</th><th style={headerStyle}>Type</th><th style={headerStyle}>Author</th><th style={headerStyle}>Date</th><th style={headerStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const pill = typePillColor[row.type] ?? {bg: '#f3f4f6', text: '#374151'};
            return (
              <tr key={row.id}>
                <td style={{...cellStyle, fontWeight: 500}}>{row.title}</td>
                <td style={cellStyle}>
                  <span style={{display: 'inline-block', padding: '2px 8px', borderRadius: 9999, background: pill.bg, color: pill.text, fontSize: 12, fontWeight: 600}}>{row.type}</span>
                </td>
                <td style={cellStyle}>{row.author}</td>
                <td style={cellStyle}>{row.date}</td>
                <td style={cellStyle}>{row.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
