import React, {useState} from 'react';

const mediaItems = [
  {type: 'image' as const, src: 'https://picsum.photos/seed/a/800/600', alt: 'Landscape'},
  {type: 'video' as const, src: 'https://www.w3schools.com/html/mov_bbb.mp4', alt: 'Video', poster: 'https://picsum.photos/seed/v1/800/600'},
  {type: 'image' as const, src: 'https://picsum.photos/seed/b/800/600', alt: 'Nature'},
  {type: 'image' as const, src: 'https://picsum.photos/seed/c/800/600', alt: 'City'},
  {type: 'video' as const, src: 'https://www.w3schools.com/html/movie.mp4', alt: 'Clip', poster: 'https://picsum.photos/seed/v2/800/600'},
  {type: 'image' as const, src: 'https://picsum.photos/seed/d/800/600', alt: 'Abstract'},
];

export default function MediaGallery() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const current = selectedIdx !== null ? mediaItems[selectedIdx] : null;

  return (
    <>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, padding: 16}}>
        {mediaItems.map((item, i) => (
          <button key={i} type="button" onClick={() => { setSelectedIdx(i); setZoomed(false); }}
            style={{border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'white'}}
            aria-label={`View ${item.alt}`}>
            <div style={{aspectRatio: '16/9', position: 'relative'}}>
              <img src={item.type === 'video' ? item.poster : item.src} alt={item.alt} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              {item.type === 'video' && <span style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 36, color: 'white'}} aria-hidden="true">&#9654;</span>}
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          onClick={() => setSelectedIdx(null)} role="dialog" aria-label="Media viewer">
          <button type="button" onClick={() => setSelectedIdx(null)} style={{position: 'absolute', top: 16, right: 16, color: 'white', fontSize: 24, background: 'none', border: 'none', cursor: 'pointer'}} aria-label="Close">&#10005;</button>
          <div onClick={e => e.stopPropagation()} style={{maxWidth: '90vw', maxHeight: '90vh'}}>
            {current.type === 'image' ? (
              <img src={current.src} alt={current.alt}
                style={{maxWidth: '90vw', maxHeight: '80vh', transform: zoomed ? 'scale(2)' : 'scale(1)', transition: 'transform 0.2s', cursor: 'zoom-in'}}
                onDoubleClick={() => setZoomed(z => !z)} />
            ) : (
              <video src={current.src} controls autoPlay style={{maxWidth: '90vw', maxHeight: '80vh'}} />
            )}
          </div>
          <div style={{position: 'absolute', bottom: 24, display: 'flex', gap: 8}}>
            <button type="button" disabled={selectedIdx === 0} onClick={(e) => { e.stopPropagation(); setSelectedIdx(i => i! - 1); setZoomed(false); }}
              style={{padding: '6px 16px', borderRadius: 4, border: 'none', background: 'white', cursor: 'pointer'}}>Prev</button>
            <button type="button" disabled={selectedIdx === mediaItems.length - 1} onClick={(e) => { e.stopPropagation(); setSelectedIdx(i => i! + 1); setZoomed(false); }}
              style={{padding: '6px 16px', borderRadius: 4, border: 'none', background: 'white', cursor: 'pointer'}}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
