import React from 'react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

const projects = [
  {title: 'Website Redesign', desc: 'Modernize the marketing site.', status: 'In Progress', color: 'bg-blue-100 text-blue-800'},
  {title: 'Mobile App', desc: 'Build a native companion app.', status: 'Completed', color: 'bg-green-100 text-green-800'},
  {title: 'API Migration', desc: 'Migrate from REST to GraphQL.', status: 'Planning', color: 'bg-yellow-100 text-yellow-800'},
  {title: 'Analytics Dashboard', desc: 'Real-time metrics and reporting.', status: 'In Progress', color: 'bg-blue-100 text-blue-800'},
  {title: 'Auth Service', desc: 'Implement SSO and MFA.', status: 'Completed', color: 'bg-green-100 text-green-800'},
  {title: 'Design Tokens', desc: 'Extract shared design tokens.', status: 'Planning', color: 'bg-yellow-100 text-yellow-800'},
];

export default function ProjectCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {projects.map(p => (
        <Card key={p.title}>
          <CardHeader>
            <Badge className={p.color}>{p.status}</Badge>
            <CardTitle className="mt-2">{p.title}</CardTitle>
            <CardDescription>{p.desc}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
