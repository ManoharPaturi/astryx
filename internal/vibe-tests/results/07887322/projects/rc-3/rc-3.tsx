import React from 'react';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

const projects = [
  {title: 'Website Redesign', description: 'Modernize the marketing site.', status: 'In Progress', variant: 'info' as const},
  {title: 'Mobile App', description: 'Build a native companion app.', status: 'Completed', variant: 'success' as const},
  {title: 'API Migration', description: 'Migrate from REST to GraphQL.', status: 'Planning', variant: 'warning' as const},
  {title: 'Analytics Dashboard', description: 'Real-time metrics and reporting.', status: 'In Progress', variant: 'info' as const},
  {title: 'Auth Service', description: 'Implement SSO and MFA.', status: 'Completed', variant: 'success' as const},
  {title: 'Design Tokens', description: 'Extract shared design tokens.', status: 'Planning', variant: 'warning' as const},
];

export default function ProjectCards() {
  return (
    <div className="p-4">
      <Grid columns={{minWidth: 280}} gap={3}>
        {projects.map(p => (
          <Card key={p.title}>
            <div className="flex flex-col gap-2">
              <Badge variant={p.variant} label={p.status} />
              <Heading level={5}>{p.title}</Heading>
              <Text>{p.description}</Text>
            </div>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
