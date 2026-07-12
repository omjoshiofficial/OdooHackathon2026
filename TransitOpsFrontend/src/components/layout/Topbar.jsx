import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header
      className="h-14 flex items-center justify-between px-4 gap-4 sticky top-0 z-20"
      style={{ background: '#121212', borderBottom: '1px solid #a4aab0' }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs" style={{ background: '#121212', border: '1px solid #4c5359', width: 260 }}>
        <Search size={12} style={{ color: '#4c5359' }} />
        <span style={{ color: '#4c5359' }}>Search...</span>
      </div>

      {/* Right: user */}
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: '#a4aab0' }}>{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</span>

        {/* Role pill */}
        <div className="px-2.5 py-1 rounded text-xs" style={{ background: '#1a212a', border: '1px solid #5a89bc', color: '#56a2e8' }}>
          {user?.role}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#5a89bc', color: '#121212' }}>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
