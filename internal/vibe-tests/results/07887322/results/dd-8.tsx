import React from 'react';
import {Table} from '@astryxdesign/core/Table';
import {Badge} from '@astryxdesign/core/Badge';
import {Heading} from '@astryxdesign/core/Heading';

interface ContentItem extends Record<string, unknown> {
  id: number; title: string; type: string; author: string; date: string; status: string;
}

const typeBadgeVariant: Record<string, 'blue' | 'purple' | 'orange' | 'teal' | 'green'> = {
  Article: 'blue', Video: 'purple', Podcast: 'orange', Newsletter: 'teal', Course: 'green',
};

const data: ContentItem[] = [
  {id: 1, title: 'Getting Started with React', type: 'Article', author: 'Jane Smith', date: '2024-01-15', status: 'Published'},
  {id: 2, title: 'Advanced TypeScript', type: 'Video', author: 'John Doe', date: '2024-01-20', status: 'Draft'},
  {id: 3, title: 'Design System Deep Dive', type: 'Podcast', author: 'Alice Wong', date: '2024-02-01', status: 'Published'},
  {id: 4, title: 'Weekly UI Digest', type: 'Newsletter', author: 'Bob Lee', date: '2024-02-05', status: 'Published'},
  {id: 5, title: 'Accessibility Fundamentals', type: 'Course', author: 'Carol Park', date: '2024-02-10', status: 'In Review'},
  {id: 6, title: 'CSS Grid Guide', type: 'Article', author: 'Dan Kim', date: '2024-02-12', status: 'Published'},
  {id: 7, title: 'Component Architecture', type: 'Video', author: 'Eve Chen', date: '2024-02-15', status: 'Draft'},
  {id: 8, title: 'UX Research Methods', type: 'Podcast', author: 'Frank Liu', date: '2024-02-18', status: 'Published'},
];

export default function ContentLibrary() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Heading level={3}>Content Library</Heading>
      <Table<ContentItem>
        data={data}
        idKey="id"
        hasHover
        columns={[
          {key: 'title', header: 'Title'},
          {key: 'type', header: 'Type', renderCell: (row) => <Badge variant={typeBadgeVariant[row.type] ?? 'neutral'} label={row.type} />},
          {key: 'author', header: 'Author'},
          {key: 'date', header: 'Date'},
          {key: 'status', header: 'Status'},
        ]}
      />
    </div>
  );
}
