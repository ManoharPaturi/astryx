import {useState, useMemo} from 'react';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Badge} from '@astryxdesign/core/Badge';
import type {TableColumn} from '@astryxdesign/core/Table';

interface User extends Record<string, unknown> {
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

const statusVariant: Record<string, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  inactive: 'neutral',
  pending: 'warning',
};

export default function UserTable() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [search]);

  const columns: TableColumn<User>[] = [
    {key: 'name', header: 'Name', width: proportional(2)},
    {key: 'email', header: 'Email', width: proportional(2)},
    {key: 'role', header: 'Role', width: proportional(1)},
    {
      key: 'status',
      header: 'Status',
      width: pixel(120),
      renderCell: (row: User) => (
        <Badge variant={statusVariant[row.status]} label={row.status} />
      ),
    },
    {key: 'joinDate', header: 'Joined', width: pixel(120)},
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <TextInput
        label="Search users"
        isLabelHidden
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, or role..."
        hasClear
      />
      <Table<User>
        data={filtered}
        columns={columns}
        idKey="id"
      />
    </div>
  );
}
