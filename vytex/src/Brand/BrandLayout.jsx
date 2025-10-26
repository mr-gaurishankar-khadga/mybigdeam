import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Search, 
  Bell, 
  ChevronDown, 
  Menu,
  X,
  User,
  LogOut,
  CreditCard,
  HelpCircle,
  Shield,
  Plus,
  Sun,
  Moon,
  Home
} from 'lucide-react';
import './BrandLayout.css';
import BrandBottomBar from './BrandBottomBar';

const BrandLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return true;
  });
  const profileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const navigationItems = [
    {
      title: 'Home',
      path: '/brand',
      icon: Home,
      description: 'Brand Home page'
    },
    {
      title: 'Analytics',
      path: '/brand/analytics',
      icon: BarChart3,
      description: 'Performance metrics and insights'
    },
    {
      title: 'Collab',
      path: '/brand/collaborations',
      icon: Users,
      description: 'Manage creator partnerships'
    },
    {
      title: 'Finance',
      path: '/brand/finance',
      icon: DollarSign,
      description: 'Financial overview and transactions'
    },
    {
      title: 'Growth',
      path: '/brand/growth',
      icon: TrendingUp,
      description: 'Campaign performance and scaling'
    },
    {
      title: 'Settings',
      path: '/brand/settings',
      icon: Settings,
      description: 'Account and platform settings'
    }
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfileDrawer(!showProfileDrawer);
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate('/brand/login');
  };

  const toggleTheme = () => setDarkMode(v => !v);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Close profile drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDrawer(false);
      }
    }

    if (showProfileDrawer) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDrawer]);

  return (
    <div className={`brand-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="brand-mobile-overlay active" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside className={`brand-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand-sidebar-header">
          <div className="brand-logo">Vytex</div>
          <button className="brand-menu-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="brand-nav-section">
          <div className="brand-section-title">Dashboard</div>
          <ul className="brand-nav-items">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="brand-nav-item">
                  <a
                    href={item.path}
                    className={`brand-nav-link ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    title={sidebarCollapsed ? item.title : ''}
                  >
                    <div className="brand-nav-icon">
                      <Icon size={20} />
                    </div>
                    <span className="brand-nav-label">{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`brand-main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <header className="brand-top-bar">
          <div className="brand-top-bar-left">
            <button className="brand-mobile-menu-toggle" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>
            <div className="brand-top-bar-logo">Vytex</div>
            
            <div className="brand-search-container">
              <Search className="brand-search-icon" size={18} />
              <input
                type="text"
                className="brand-search-input"
                placeholder="Search creators, campaigns..."
              />
            </div>
          </div>

          <div className="brand-top-bar-actions">
            <button className="brand-create-btn">
              <Plus size={20} />
              <span style={{marginLeft: '0.5rem'}}>Create</span>
            </button>

            <div className="brand-notifications">
              <button className="brand-notification-btn">
                <Bell size={20} />
                <span className="brand-notification-badge">3</span>
              </button>
            </div>

            <div className="brand-user-profile" ref={profileRef}>
              <div className="brand-avatar" onClick={handleProfileClick}>
                <img src="/src/images/avatar.png" alt="User" />
              </div>
              
              {showProfileDrawer && (
                <div className="brand-profile-drawer brand-fade-in">
                  <div className="brand-profile-drawer-header">
                    <div className="brand-profile-info">
                      <img src="/src/images/avatar.png" alt="User" className="brand-profile-avatar" />
                      <div className="brand-profile-details">
                        <h4>Brand Manager</h4>
                        <p>brand@company.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="brand-financial-summary">
                    <h4>Account Balance</h4>
                    <div className="brand-financial-data">
                      <div className="brand-financial-value">
                        <DollarSign size={16} />
                        $24,580
                      </div>
                      <div className="brand-financial-trend-info">
                        <TrendingUp size={12} />
                        +12.5%
                      </div>
                    </div>
                  </div>
                  
                  <div className="brand-profile-drawer-content">
                    <button className="brand-profile-option" onClick={toggleTheme}>
                      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button className="brand-profile-option">
                      <User size={16} />
                      Profile Settings
                    </button>
                    <button className="brand-profile-option">
                      <CreditCard size={16} />
                      Billing & Plans
                    </button>
                    <button className="brand-profile-option">
                      <Shield size={16} />
                      Security
                    </button>
                    <button className="brand-profile-option">
                      <HelpCircle size={16} />
                      Help & Support
                    </button>
                    
                    <div className="brand-profile-divider" />
                    
                    <button className="brand-profile-option logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="brand-content-container">
          <Outlet />
        </div>
        <BrandBottomBar />
      </main>
    </div>
  );
};

export default BrandLayout;