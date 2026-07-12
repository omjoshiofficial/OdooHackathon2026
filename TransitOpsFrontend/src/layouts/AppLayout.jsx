import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

const AppLayout = () => (
  <div className="min-h-screen flex" style={{ background: '#121212' }}>
    <Sidebar />
    <div className="flex flex-col min-h-screen flex-1 pl-48">
      <Topbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
