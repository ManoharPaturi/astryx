import {useState} from 'react';

const plans = [
  {name: 'Starter', monthlyPrice: 12, annualPrice: 10, features: ['5 projects', '10 GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 24, annualPrice: 20, features: ['Unlimited projects', '100 GB storage', 'Priority support', 'Custom domains'], popular: true},
  {name: 'Enterprise', monthlyPrice: 48, annualPrice: 40, features: ['Everything in Pro', '1 TB storage', 'Dedicated support', 'SSO', 'Audit logs']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 24}}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{margin: '0 0 8px'}}>Pricing</h1>
        <p style={{color: '#666', margin: 0}}>Choose the plan that fits your needs</p>
      </div>

      <div style={{display: 'flex', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden'}}>
        {(['monthly', 'annual'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setBilling(period)}
            style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              backgroundColor: billing === period ? '#0066cc' : 'transparent',
              color: billing === period ? '#fff' : '#333',
            }}
          >
            {period === 'monthly' ? 'Monthly' : 'Annual'}
          </button>
        ))}
      </div>

      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center'}}>
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <div key={plan.name} style={{width: 260, border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <h3 style={{margin: 0}}>{plan.name}</h3>
                {plan.popular && (
                  <span style={{fontSize: 12, fontWeight: 600, color: '#0066cc', backgroundColor: '#e0f0ff', padding: '2px 8px', borderRadius: 12}}>Popular</span>
                )}
              </div>
              <div>
                <span style={{fontSize: 32, fontWeight: 700}}>${price}</span>
                <span style={{color: '#666'}}>/mo</span>
              </div>
              {billing === 'annual' && (
                <p style={{fontSize: 13, color: '#666', margin: 0}}>Billed annually (${price * 12}/yr)</p>
              )}
              <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6}}>
                {plan.features.map((f) => (
                  <li key={f} style={{fontSize: 14}}>{f}</li>
                ))}
              </ul>
              <button style={{
                padding: '10px 16px', borderRadius: 6, border: plan.popular ? 'none' : '1px solid #ccc',
                backgroundColor: plan.popular ? '#0066cc' : 'transparent',
                color: plan.popular ? '#fff' : '#333', cursor: 'pointer', fontWeight: 600,
              }}>
                Choose {plan.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
