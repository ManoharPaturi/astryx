import React, {useState, useEffect} from 'react';

export default function DashboardWidget() {
  const [state, setState] = useState<'loading' | 'error' | 'success'>('loading');
  const [data, setData] = useState<{revenue: string; orders: number; conversion: string} | null>(null);

  const fetchData = () => {
    setState('loading'); setData(null);
    setTimeout(() => {
      if (Math.random() < 0.3) setState('error');
      else { setData({revenue: '$12,450', orders: 284, conversion: '3.2%'}); setState('success'); }
    }, 1500);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 500}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <h3 style={{fontSize: 18, fontWeight: 600, margin: 0}}>Sales Overview</h3>
        {state === 'success' && (
          <button type="button" onClick={fetchData} style={{padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 13}}>Refresh</button>
        )}
      </div>
      {state === 'loading' && (
        <div style={{display: 'flex', alignItems: 'center', gap: 8, color: '#666'}}>
          <div style={{width: 20, height: 20, border: '2px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />
          <span>Loading...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {state === 'error' && (
        <div>
          <p style={{color: '#dc2626', marginBottom: 12}}>Failed to load dashboard data.</p>
          <button type="button" onClick={fetchData} style={{padding: '6px 16px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer'}}>Retry</button>
        </div>
      )}
      {state === 'success' && data && (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16}}>
          <div><p style={{fontSize: 12, color: '#888', margin: '0 0 4px'}}>Revenue</p><p style={{fontSize: 24, fontWeight: 700, margin: 0}}>{data.revenue}</p></div>
          <div><p style={{fontSize: 12, color: '#888', margin: '0 0 4px'}}>Orders</p><p style={{fontSize: 24, fontWeight: 700, margin: 0}}>{data.orders}</p></div>
          <div><p style={{fontSize: 12, color: '#888', margin: '0 0 4px'}}>Conversion</p><p style={{fontSize: 24, fontWeight: 700, margin: 0}}>{data.conversion}</p></div>
        </div>
      )}
    </div>
  );
}
