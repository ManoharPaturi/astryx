import React, {useState} from 'react';

const icons = ['\u{1F4DD}', '\u{1F4DA}', '\u{1F680}', '\u{2B50}', '\u{1F3AF}', '\u{1F4A1}', '\u{1F525}', '\u{1F389}', '\u{1F30E}', '\u{1F4C8}', '\u{1F3B5}', '\u{2764}'];
const covers = ['https://picsum.photos/seed/c1/1200/300', 'https://picsum.photos/seed/c2/1200/300', 'https://picsum.photos/seed/c3/1200/300', 'https://picsum.photos/seed/c4/1200/300'];

export default function NotionPageHeader() {
  const [icon, setIcon] = useState('\u{1F4DD}');
  const [cover, setCover] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [showIcons, setShowIcons] = useState(false);
  const [showCovers, setShowCovers] = useState(false);

  return (
    <div style={{maxWidth: 700, margin: '0 auto', fontFamily: 'system-ui, sans-serif'}}>
      {cover ? (
        <img src={cover} alt="Cover" style={{width: '100%', height: 200, objectFit: 'cover', borderRadius: 8}} />
      ) : (
        <div style={{width: '100%', height: 200, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>
          Click "Add cover" below
        </div>
      )}
      <div style={{position: 'relative', display: 'inline-block'}}>
        <button type="button" onClick={() => setShowIcons(!showIcons)} style={{fontSize: 64, background: 'none', border: 'none', cursor: 'pointer', marginTop: -32}} aria-label="Change icon">{icon}</button>
        {showIcons && (
          <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
            <p style={{fontSize: 13, fontWeight: 500, marginBottom: 8}}>Choose an icon</p>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4}}>
              {icons.map(e => (
                <button key={e} type="button" onClick={() => { setIcon(e); setShowIcons(false); }} style={{fontSize: 24, padding: 6, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4}} aria-label={`Select ${e}`}>{e}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <h1 style={{fontSize: 36, fontWeight: 700, margin: '8px 0'}}>{title}</h1>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled"
        style={{width: '100%', padding: '6px 0', border: 'none', fontSize: 16, outline: 'none'}} />
      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        <div style={{position: 'relative'}}>
          <button type="button" onClick={() => setShowCovers(!showCovers)}
            style={{padding: '6px 12px', border: 'none', background: '#f3f4f6', borderRadius: 4, cursor: 'pointer', fontSize: 13}}>Add cover</button>
          {showCovers && (
            <div style={{position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
              {covers.map(url => (
                <button key={url} type="button" onClick={() => { setCover(url); setShowCovers(false); }} aria-label="Select cover" style={{border: 'none', padding: 0, cursor: 'pointer'}}>
                  <img src={url} alt="" style={{width: 120, height: 50, objectFit: 'cover', borderRadius: 4}} />
                </button>
              ))}
            </div>
          )}
        </div>
        {cover && <button type="button" onClick={() => setCover('')} style={{padding: '6px 12px', border: 'none', background: '#f3f4f6', borderRadius: 4, cursor: 'pointer', fontSize: 13}}>Remove cover</button>}
      </div>
    </div>
  );
}
