import {useState} from 'react';

const navItems = [{label: 'Home', href: '/'}, {label: 'Products', href: '/products'}, {label: 'About', href: '/about'}, {label: 'Contact', href: '/contact'}];

export default function ResponsiveNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <nav style={{borderBottom: '1px solid #e5e7eb'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', maxWidth: 1024, margin: '0 auto'}}>
          <a href="/" style={{fontSize: 20, fontWeight: 700, textDecoration: 'none', color: '#111'}}>MyApp</a>
          <div style={{display: 'flex', gap: 24}}>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} style={{fontSize: 14, fontWeight: 500, textDecoration: 'none', color: '#333'}}>
                {item.label}
              </a>
            ))}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open navigation"
            style={{display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4}}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50}} onClick={() => setMenuOpen(false)}>
          <div style={{width: 280, height: '100%', backgroundColor: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 16}} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMenuOpen(false)} style={{alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer'}}>x</button>
            {navItems.map((item) => (
              <a key={item.label} href={item.href} style={{fontSize: 18, fontWeight: 500, textDecoration: 'none', color: '#333'}}>{item.label}</a>
            ))}
          </div>
        </div>
      )}
      <main style={{padding: 24, maxWidth: 1024, margin: '0 auto'}}>
        <h1 style={{fontSize: 28, fontWeight: 700, marginBottom: 16}}>Welcome</h1>
        <p style={{color: '#666'}}>Resize the window to see the navigation collapse to a hamburger menu on mobile.</p>
      </main>
    </div>
  );
}
