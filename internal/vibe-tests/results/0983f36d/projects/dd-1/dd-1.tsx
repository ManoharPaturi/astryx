import {useState, useMemo} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

const users: User[] = [
  {id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'active', joinDate: '2024-01-15'},
  {id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active', joinDate: '2024-02-20'},
  {id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'inactive', joinDate: '2024-03-10'},
  {id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor', status: 'pending', joinDate: '2024-04-05'},
  {id: 5, name: 'Eva Martinez', email: 'eva@example.com', role: 'Admin', status: 'active', joinDate: '2024-05-12'},
  {id: 6, name: 'Frank Lee', email: 'frank@example.com', role: 'Viewer', status: 'active', joinDate: '2024-06-08'},
];

type SortKey = keyof User;
type SortDir = 'asc' | 'desc';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  pending: 'outline',
};

export default function UserTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aVal = String(a[sortKey]);
        const bVal = String(b[sortKey]);
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  }, [search, sortKey, sortDir]);

  const SortButton = ({colKey, label}: {colKey: SortKey; label: string}) => (
    <Button variant="ghost" size="sm" onClick={() => toggleSort(colKey)} className="font-medium">
      {label} {sortKey === colKey ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </Button>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <Input
        placeholder="Search by name, email, or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortButton colKey="name" label="Name" /></TableHead>
            <TableHead><SortButton colKey="email" label="Email" /></TableHead>
            <TableHead><SortButton colKey="role" label="Role" /></TableHead>
            <TableHead><SortButton colKey="status" label="Status" /></TableHead>
            <TableHead><SortButton colKey="joinDate" label="Joined" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell><Badge variant={statusVariant[user.status]}>{user.status}</Badge></TableCell>
              <TableCell>{user.joinDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
