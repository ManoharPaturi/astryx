import {useState, useMemo} from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
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

const statusColors: Record<string, string> = {active: '#22c55e', inactive: '#9ca3af', pending: '#f59e0b'};

export default function UserTable() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q))
      .sort((a, b) => {
        const aVal = String(a[sortKey]);
        const bVal = String(b[sortKey]);
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  }, [search, sortKey, sortDir]);

  const thStyle = {padding: '8px 12px', textAlign: 'left' as const, borderBottom: '2px solid #e5e7eb', cursor: 'pointer', fontWeight: 600, fontSize: 14};
  const tdStyle = {padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 14};

  const columns: {key: SortKey; label: string}[] = [
    {key: 'name', label: 'Name'},
    {key: 'email', label: 'Email'},
    {key: 'role', label: 'Role'},
    {key: 'status', label: 'Status'},
    {key: 'joinDate', label: 'Joined'},
  ];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, padding: 16}}>
      <input
        placeholder="Search by name, email, or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14}}
      />
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={thStyle} onClick={() => toggleSort(col.key)}>
                {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td style={tdStyle}>{user.name}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>{user.role}</td>
              <td style={tdStyle}>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                  backgroundColor: statusColors[user.status] + '22',
                  color: statusColors[user.status],
                }}>
                  {user.status}
                </span>
              </td>
              <td style={tdStyle}>{user.joinDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
