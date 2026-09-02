import React, {useState, useEffect} from 'react';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {Stack} from '@astryxdesign/core/Stack';
import {Banner} from '@astryxdesign/core/Banner';

type State = 'loading' | 'error' | 'success';

interface DashboardData {
  revenue: string;
  orders: number;
  conversion: string;
}

export default function DashboardWidget() {
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchData = () => {
    setState('loading');
    setData(null);
    setTimeout(() => {
      const shouldError = Math.random() < 0.3;
      if (shouldError) {
        setState('error');
      } else {
        setData({
          revenue: '$12,450',
          orders: 284,
          conversion: '3.2%',
        });
        setState('success');
      }
    }, 1500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <VStack gap={3}>
        <Stack justify="space-between" align="center">
          <Heading level={4}>Sales Overview</Heading>
          {state === 'success' && (
            <Button label="Refresh" variant="ghost" size="sm" onClick={fetchData} />
          )}
        </Stack>

        {state === 'loading' && (
          <Spinner label="Loading sales data..." />
        )}

        {state === 'error' && (
          <VStack gap={2}>
            <Banner variant="error">
              Failed to load dashboard data. Please try again.
            </Banner>
            <Button label="Retry" variant="secondary" onClick={fetchData} />
          </VStack>
        )}

        {state === 'success' && data && (
          <Stack gap={4}>
            <VStack gap={1}>
              <Text type="supporting">Revenue</Text>
              <Heading level={3}>{data.revenue}</Heading>
            </VStack>
            <VStack gap={1}>
              <Text type="supporting">Orders</Text>
              <Heading level={3}>{data.orders}</Heading>
            </VStack>
            <VStack gap={1}>
              <Text type="supporting">Conversion</Text>
              <Heading level={3}>{data.conversion}</Heading>
            </VStack>
          </Stack>
        )}
      </VStack>
    </Card>
  );
}
