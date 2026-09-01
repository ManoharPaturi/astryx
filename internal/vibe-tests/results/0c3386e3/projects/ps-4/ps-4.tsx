export default function ProductDetailPage() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 24}}>
      <nav aria-label="Breadcrumb">
        <ol style={{display: 'flex', gap: 8, listStyle: 'none', padding: 0, margin: 0, fontSize: 14}}>
          <li><a href="/" style={{color: '#0066cc', textDecoration: 'none'}}>Home</a></li>
          <li>/</li>
          <li><a href="/electronics" style={{color: '#0066cc', textDecoration: 'none'}}>Electronics</a></li>
          <li>/</li>
          <li><a href="/electronics/headphones" style={{color: '#0066cc', textDecoration: 'none'}}>Headphones</a></li>
          <li>/</li>
          <li aria-current="page" style={{color: '#666'}}>ProMax Studio Headphones</li>
        </ol>
      </nav>

      <button onClick={() => window.history.back()} style={{alignSelf: 'flex-start', padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', background: 'transparent', cursor: 'pointer'}}>
        Back
      </button>

      <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}>
            <h1 style={{margin: 0}}>ProMax Studio Headphones</h1>
            <span style={{fontSize: 12, fontWeight: 600, color: '#22c55e', backgroundColor: '#22c55e22', padding: '2px 8px', borderRadius: 12}}>In Stock</span>
          </div>
          <p style={{fontSize: 20, fontWeight: 600, margin: '0 0 8px'}}>$299.99</p>
          <p style={{color: '#666', margin: 0}}>Premium over-ear headphones with active noise cancellation and 40-hour battery life.</p>
        </div>

        <div>
          <h3 style={{margin: '0 0 8px'}}>Product Details</h3>
          <p style={{fontSize: 14, margin: '4px 0'}}>Driver Size: 40mm custom dynamic drivers</p>
          <p style={{fontSize: 14, margin: '4px 0'}}>Frequency Response: 4Hz - 40kHz</p>
          <p style={{fontSize: 14, margin: '4px 0'}}>Battery Life: Up to 40 hours (ANC on)</p>
          <p style={{fontSize: 14, margin: '4px 0'}}>Weight: 250g</p>
          <p style={{fontSize: 14, margin: '4px 0'}}>Connectivity: Bluetooth 5.3, USB-C, 3.5mm</p>
        </div>

        <div style={{display: 'flex', gap: 8}}>
          <button style={{padding: '10px 20px', borderRadius: 6, border: 'none', backgroundColor: '#0066cc', color: '#fff', cursor: 'pointer', fontWeight: 600}}>Add to Cart</button>
          <button style={{padding: '10px 20px', borderRadius: 6, border: '1px solid #ccc', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600}}>Add to Wishlist</button>
        </div>
      </div>
    </div>
  );
}
