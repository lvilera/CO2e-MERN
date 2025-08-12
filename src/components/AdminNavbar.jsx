import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoMenuOutline, IoCloseOutline, IoLogOutOutline, IoHomeOutline, IoPersonOutline, IoBookOutline, IoStarOutline, IoNewspaperOutline, IoDocumentTextOutline } from 'react-icons/io5';

const AdminNavbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin', icon: IoHomeOutline },
    { name: 'Add Instructor', path: '/admin/add-instructor', icon: IoPersonOutline },
    { name: 'Upload Courses', path: '/admin/upload-courses', icon: IoBookOutline },
    { name: 'Featured Listing', path: '/admin/featured-listing', icon: IoStarOutline },
    { name: 'Add News', path: '/admin/add-news', icon: IoNewspaperOutline },
    { name: 'Add Blog', path: '/admin/add-blog', icon: IoDocumentTextOutline },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <header style={{
        background: '#2c3e50',
        color: 'white',
        padding: '1rem 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <img 
              src="/Logo.png" 
              alt="CO2e Portal" 
              style={{ height: '40px', width: 'auto' }}
            />
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              color: '#90be55'
            }}>
              CO2e PORTAL - Admin
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'white',
                    background: isActive ? '#90be55' : 'transparent',
                    transition: 'all 0.3s ease',
                    fontWeight: isActive ? '600' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.background = '#34495e';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#c0392b';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#e74c3c';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <IoLogOutOutline size={18} />
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setNavOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'none',
              padding: '0.5rem'
            }}
            className="mobile-menu-btn"
          >
            <IoMenuOutline />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {navOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1001,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            background: '#2c3e50',
            width: '300px',
            height: '100%',
            padding: '2rem',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setNavOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                position: 'absolute',
                top: '1rem',
                right: '1rem'
              }}
            >
              <IoCloseOutline />
            </button>

            {/* Mobile Menu Items */}
            <div style={{ marginTop: '3rem' }}>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setNavOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'white',
                      background: isActive ? '#90be55' : 'transparent',
                      marginBottom: '0.5rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '100%',
                  marginTop: '1rem'
                }}
              >
                <IoLogOutOutline size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: block !important;
            }
            nav {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default AdminNavbar; 