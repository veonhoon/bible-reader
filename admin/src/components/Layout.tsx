import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Settings, LogOut, LayoutDashboard, Users, Sparkles, Bell, FileText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/process', icon: Sparkles, label: 'Process Doc' },
    { to: '/content', icon: BookOpen, label: 'Content' },
    { to: '/prompt-settings', icon: FileText, label: 'AI Prompt' },
    { to: '/notification-settings', icon: Bell, label: 'Notifications' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="text-xl font-bold text-primary">Bible Teacher</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Admin Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : ''
                  }`
                }
                style={({ isActive }) => isActive ? {} : { color: 'var(--text-primary)' }}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="mb-3 px-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Signed in as</p>
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors hover:opacity-70"
              style={{ color: 'var(--text-primary)' }}
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
