import React, {useState} from 'react';

const fruits = ['Apple', 'Banana', 'Mango', 'Peach', 'Strawberry'];
const ripenessLevels = ['Unripe', 'Nearly Ripe', 'Ripe', 'Overripe'];

export default function FruitPicker() {
  const [fruit, setFruit] = useState('Apple');
  const [ripeness, setRipeness] = useState('Ripe');
  const [open, setOpen] = useState(false);

  return (
    <div style={{maxWidth: 400, fontFamily: 'system-ui, sans-serif'}}>
      <label style={{display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14}}>Fruit and ripeness</label>
      <div style={{position: 'relative'}}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, background: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 14}}>
          {fruit} — {ripeness}
        </button>
        {open && (
          <div style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ccc', borderRadius: 6, padding: 16, marginTop: 4, zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
            <div>
              <p style={{fontWeight: 600, fontSize: 13, marginBottom: 8}}>Fruit</p>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}} role="radiogroup" aria-label="Fruit">
                {fruits.map(f => (
                  <button key={f} type="button" role="radio" aria-checked={f === fruit}
                    style={{padding: '4px 10px', borderRadius: 4, border: f === fruit ? '2px solid #2563eb' : '1px solid #ccc',
                      background: f === fruit ? '#eff6ff' : 'white', cursor: 'pointer', fontSize: 13}}
                    onClick={() => setFruit(f)}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{marginTop: 16}}>
              <p style={{fontWeight: 600, fontSize: 13, marginBottom: 8}}>Ripeness</p>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}} role="radiogroup" aria-label="Ripeness">
                {ripenessLevels.map(r => (
                  <button key={r} type="button" role="radio" aria-checked={r === ripeness}
                    style={{padding: '6px 10px', borderRadius: 4, textAlign: 'left', border: 'none',
                      background: r === ripeness ? '#2563eb' : 'transparent', color: r === ripeness ? 'white' : '#333', cursor: 'pointer', fontSize: 13}}
                    onClick={() => { setRipeness(r); setOpen(false); }}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
