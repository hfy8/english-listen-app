import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/levels', icon: '📝', label: '练习' },
  { path: '/test', icon: '🎮', label: '测试' },
  { path: '/rewards', icon: '🎁', label: '奖励' },
  { path: '/profile', icon: '👤', label: '我的' },
  { path: '/settings', icon: '⚙️', label: '设置' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  // Hide nav on practice page
  if (location.pathname === '/practice') return null;

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end={item.path === '/'}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
