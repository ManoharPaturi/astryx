import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';

const typeBadgeColor: Record<string, string> = {
  Article: 'bg-blue-100 text-blue-800',
  Video: 'bg-purple-100 text-purple-800',
  Podcast: 'bg-orange-100 text-orange-800',
  Newsletter: 'bg-teal-100 text-teal-800',
  Course: 'bg-green-100 text-green-800',
};

const data = [
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
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Content Library</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.title}</TableCell>
              <TableCell><Badge className={typeBadgeColor[row.type]}>{row.type}</Badge></TableCell>
              <TableCell>{row.author}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
