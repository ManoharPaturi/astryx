import {useState} from 'react';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

const plans = [
  {name: 'Starter', monthlyPrice: 12, annualPrice: 10, features: ['5 projects', '10 GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 24, annualPrice: 20, features: ['Unlimited projects', '100 GB storage', 'Priority support', 'Custom domains'], popular: true},
  {name: 'Enterprise', monthlyPrice: 48, annualPrice: 40, features: ['Everything in Pro', '1 TB storage', 'Dedicated support', 'SSO', 'Audit logs']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <Heading level={1}>Pricing</Heading>
        <Text color="secondary">Choose the plan that fits your needs</Text>
      </div>

      <SegmentedControl value={billing} onChange={setBilling} label="Billing period">
        <SegmentedControlItem value="monthly" label="Monthly" />
        <SegmentedControlItem value="annual" label="Annual" />
      </SegmentedControl>

      <div className="flex flex-wrap justify-center gap-4">
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <Card key={plan.name} padding={4} width={280}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Heading level={3}>{plan.name}</Heading>
                  {plan.popular && <Badge variant="info" label="Popular" />}
                </div>
                <div className="flex items-end gap-1">
                  <Heading level={2}>${price}</Heading>
                  <Text color="secondary">/mo</Text>
                </div>
                {billing === 'annual' && (
                  <Text type="supporting" color="secondary">
                    Billed annually (${price * 12}/yr)
                  </Text>
                )}
                <div className="flex flex-col gap-1">
                  {plan.features.map((feature) => (
                    <Text key={feature}>{feature}</Text>
                  ))}
                </div>
                <Button
                  label={`Choose ${plan.name}`}
                  variant={plan.popular ? 'primary' : 'secondary'}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
