import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to}
        style={{
          color: isActive ? '#6366f1' : '#cbd5e1',
          textDecoration: 'none',
          fontWeight: isActive ? '600' : '500',
          padding: '8px 16px',
          borderRadius: '6px',
          backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
          border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          display: 'inline-block'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {children}
      </Link>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <Link 
            to="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#f1f5f9',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🎵 AI Music Generator
          </Link>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/generator">Generate</NavLink>
            <NavLink to="/piano">Piano</NavLink>
            <NavLink to="/library">Library</NavLink>
            <NavLink to="/presets">Presets</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </div>
        </nav>
      </header>

      <main style={{
        flex: 1,
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {children}
      </main>

      <footer style={{
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: '16px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#94a3b8'
      }}>
        <p>Ultra-Advanced AI Music Generator © 2024</p>
      </footer>
    </div>
  );
};

export default Layout;