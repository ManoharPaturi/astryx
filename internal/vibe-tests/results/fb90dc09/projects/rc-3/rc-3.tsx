import React from 'react';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {Badge} from '@astryxdesign/core/Badge';

interface ProjectCard {
  title: string;
  description: string;
  status: string;
  variant: 'info' | 'success' | 'warning';
}

const projects: ProjectCard[] = [
  {title: 'Website Redesign', description: 'Modernize the marketing site with the new design system.', status: 'In Progress', variant: 'info'},
  {title: 'Mobile App', description: 'Build a native companion app for iOS and Android.', status: 'Completed', variant: 'success'},
  {title: 'API Migration', description: 'Migrate from REST to GraphQL across all services.', status: 'Planning', variant: 'warning'},
  {title: 'Analytics Dashboard', description: 'Real-time metrics and reporting for the operations team.', status: 'In Progress', variant: 'info'},
  {title: 'Auth Service', description: 'Implement SSO and multi-factor authentication.', status: 'Completed', variant: 'success'},
  {title: 'Design Tokens', description: 'Extract and publish shared design tokens from the Figma library.', status: 'Planning', variant: 'warning'},
];

export default function ProjectCards() {
  return (
    <Grid columns={{minWidth: 280}} gap={3}>
      {projects.map((project) => (
        <Card key={project.title}>
          <VStack gap={2}>
            <Badge variant={project.variant} label={project.status} />
            <Heading level={5}>{project.title}</Heading>
            <Text>{project.description}</Text>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}
