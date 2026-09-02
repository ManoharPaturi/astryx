import React, {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';

type State = 'loading' | 'error' | 'success';

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<{revenue: string; orders: number; conversion: string} | null>(null);

  const fetchData = () => {
    setState('loading');
    setData(null);
    setTimeout(() => {
      if (Math.random() < 0.3) { setState('error'); }
      else { setData({revenue: '$12,450', orders: 284, conversion: '3.2%'}); setState('success'); }
    }, 1500);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Heading level={4}>Sales Overview</Heading>
          {state === 'success' && <Button label="Refresh" variant="ghost" size="sm" onClick={fetchData} />}
        </div>
        {state === 'loading' && <Spinner label="Loading sales data..." />}
        {state === 'error' && (
          <div className="flex flex-col gap-3">
            <Banner variant="error">Failed to load dashboard data.</Banner>
            <Button label="Retry" variant="secondary" onClick={fetchData} />
          </div>
        )}
        {state === 'success' && data && (
          <div className="grid grid-cols-3 gap-6">
            <div><Text type="supporting">Revenue</Text><Heading level={3}>{data.revenue}</Heading></div>
            <div><Text type="supporting">Orders</Text><Heading level={3}>{data.orders}</Heading></div>
            <div><Text type="supporting">Conversion</Text><Heading level={3}>{data.conversion}</Heading></div>
          </div>
        )}
      </div>
    </Card>
  );
}
