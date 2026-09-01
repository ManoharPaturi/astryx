import {useState} from 'react';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
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
    <VStack gap={6} padding={4} hAlign="center">
      <VStack gap={2} hAlign="center">
        <Heading level={1}>Pricing</Heading>
        <Text color="secondary">Choose the plan that fits your needs</Text>
      </VStack>

      <SegmentedControl value={billing} onChange={setBilling} label="Billing period">
        <SegmentedControlItem value="monthly" label="Monthly" />
        <SegmentedControlItem value="annual" label="Annual" />
      </SegmentedControl>

      <HStack gap={4} wrap="wrap" hAlign="center">
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <Card key={plan.name} padding={4} width={280}>
              <VStack gap={4}>
                <HStack gap={2} vAlign="center">
                  <Heading level={3}>{plan.name}</Heading>
                  {plan.popular && <Badge variant="info" label="Popular" />}
                </HStack>
                <HStack gap={0.5} vAlign="end">
                  <Heading level={2}>${price}</Heading>
                  <Text color="secondary">/mo</Text>
                </HStack>
                {billing === 'annual' && (
                  <Text type="supporting" color="secondary">
                    Billed annually (${price * 12}/yr)
                  </Text>
                )}
                <VStack gap={1}>
                  {plan.features.map((feature) => (
                    <Text key={feature}>{feature}</Text>
                  ))}
                </VStack>
                <Button
                  label={`Choose ${plan.name}`}
                  variant={plan.popular ? 'primary' : 'secondary'}
                />
              </VStack>
            </Card>
          );
        })}
      </HStack>
    </VStack>
  );
}
