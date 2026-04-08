import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChartBar,
  Users,
  ShoppingCart,
  MapPin,
  Brain,
  UserCircle,
  SignOut,
  SquaresFour,
  TrendUp,
  Target,
} from '@phosphor-icons/react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: SquaresFour },
    { name: 'Sales', path: '/sales', icon: ShoppingCart },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: ChartBar },
    { name: 'Forecast', path: '/forecast', icon: TrendUp, admin: false },
    { name: 'Targets', path: '/targets', icon: Target, admin: false },
    { name: 'Geo Map', path: '/geo', icon: MapPin },
    { name: 'AI Advisor', path: '/ai-advisor', icon: Brain },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 h-screen bg-zinc-900 border-r border-white/10 flex flex-col fixed left-0 top-0" data-testid="sidebar">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          <span className="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            PrismX
          </span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-medium">Business Intelligence</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${
                isActive
                  ? 'bg-zinc-800 text-white border-l-2 border-indigo-500'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
              data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 mb-2 hover:bg-zinc-800 rounded-md transition-colors"
          data-testid="profile-link"
        >
          <UserCircle size={32} weight="fill" className="text-zinc-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{user?.role?.replace('_', ' ')}</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-md transition-all"
          data-testid="logout-button"
        >
          <SignOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;