import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';

const plans = [
  {name: 'Starter', monthlyPrice: 12, annualPrice: 10, features: ['5 projects', '10 GB storage', 'Email support']},
  {name: 'Pro', monthlyPrice: 24, annualPrice: 20, features: ['Unlimited projects', '100 GB storage', 'Priority support', 'Custom domains'], popular: true},
  {name: 'Enterprise', monthlyPrice: 48, annualPrice: 40, features: ['Everything in Pro', '1 TB storage', 'Dedicated support', 'SSO', 'Audit logs']},
];

export default function PricingTable() {
  const [billing, setBilling] = useState('monthly');

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">Choose the plan that fits your needs</p>
      </div>

      <Tabs value={billing} onValueChange={setBilling}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap justify-center gap-4">
        {plans.map((plan) => {
          const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          return (
            <Card key={plan.name} className="w-[280px]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.popular && <Badge>Popular</Badge>}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                {billing === 'annual' && (
                  <p className="text-sm text-muted-foreground">Billed annually (${price * 12}/yr)</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm">{feature}</li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
