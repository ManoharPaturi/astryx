import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Overview</CardTitle>
        {state === 'success' && <Button variant="ghost" size="sm" onClick={fetchData}>Refresh</Button>}
      </CardHeader>
      <CardContent>
        {state === 'loading' && (
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-24" /></div>
            ))}
          </div>
        )}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-destructive">Failed to load dashboard data.</p>
            <Button variant="outline" onClick={fetchData}>Retry</Button>
          </div>
        )}
        {state === 'success' && data && (
          <div className="grid grid-cols-3 gap-6">
            <div><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold">{data.revenue}</p></div>
            <div><p className="text-sm text-muted-foreground">Orders</p><p className="text-2xl font-bold">{data.orders}</p></div>
            <div><p className="text-sm text-muted-foreground">Conversion</p><p className="text-2xl font-bold">{data.conversion}</p></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
