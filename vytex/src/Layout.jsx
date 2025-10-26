import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';


const Layout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeNavItem, setActiveNavItem] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('layoutTheme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return true; // default to dark
  });

  // Refs
  const mainContentInnerRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Profile dropdown toggle
  const toggleProfileDropdown = useCallback((e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(prev => !prev);
  }, []);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target) &&
      profileButtonRef.current &&
      !profileButtonRef.current.contains(event.target)
    ) {
      setIsProfileDropdownOpen(false);
    }
  }, []);

  // Mobile Navigation Functions
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleSearchMode = useCallback(() => {
    setIsSearchMode(prev => {
      const newSearchMode = !prev;
      if (newSearchMode) {
        setTimeout(() => {
          document.getElementById('mobileSearchInput')?.focus();
        }, 100);
      } else {
        setSearchValue('');
      }
      return newSearchMode;
    });
  }, []);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      console.log('Search:', searchValue);
      // Add search logic here
    }
    if (e.key === 'Escape') {
      setIsSearchMode(false);
      setSearchValue('');
    }
  }, [searchValue]);

  // Navigation handlers
  const handleNavClick = useCallback((index, route) => {
    setActiveNavItem(index);

    // Navigate to the route
    navigate(route);

    // Close mobile sidebar if open
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, navigate]);

  // Window resize handler
  const handleResize = useCallback(() => {
    const newIsMobile = window.innerWidth <= 768;
    setIsMobile(newIsMobile);
    
    if (!newIsMobile) {
      setIsMobileMenuOpen(false);
      setIsSearchMode(false);
    }
  }, []);

  // Keyboard handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsMobileMenuOpen(false);
      setIsSearchMode(false);
      setSearchValue('');
      setIsProfileDropdownOpen(false);
    }
  }, []);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('layoutTheme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  // Profile dropdown menu items
  const profileMenuItems = [
    {
      icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
      label: "YOU",
      onClick: () => { setIsProfileDropdownOpen(false); navigate('/profile'); }
    },
    {
      icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
      label: "Profile Settings",
      onClick: () => console.log('Profile Settings clicked')
    },
    {
      icon: "M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
      label: "Billing & Plans",
      onClick: () => console.log('Billing & Plans clicked')
    },
    {
      icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
      label: "Security",
      onClick: () => console.log('Security clicked')
    },
    {
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z",
      label: "Help & Support",
      onClick: () => console.log('Help & Support clicked')
    },
    {
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      label: isDarkMode ? "Light Mode" : "Dark Mode",
      onClick: toggleTheme,
      hasToggle: true
    }
  ];

  // Effects
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  // Content renderer
  const renderMainContent = useCallback(() => {
    return (
      <div className="layout-page-content-container">
        <div className="layout-page-content">
          {children}
        </div>
      </div>
    );
  }, [children]);

  // Navigation data with routes
  const navItems = [
    { icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z", label: "Home", route: "/" },
    { icon: "M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V18h2v-4h3v4h4v2H4v-2z", label: "Collab", route: "/Collab" },
    { icon: "M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97-.25 2.8-.7l-1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z", label: "Automate", route: "/Automation" },
    { icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "Affiliate", route: "/Affiliate" },
    { icon: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z", label: "Store", route: "/StoreFront" },
    { icon: "M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v6l4-2 4 2v-6h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H4V4h16v10z", label: "UGC", route: "/UGC" },
    { icon: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.99C5.88 7 5 7.88 5 9c0 .56.22 1.07.59 1.41L5.41 10.59C4.56 9.74 4 8.42 4 7c0-2.21 1.79-4 4-4s4 1.79 4 4h2c0-3.31-2.69-6-6-6S2 3.69 2 7c0 1.66.67 3.16 1.76 4.24l1.42 1.42C6.84 11.33 7.34 10.17 8 9.24V12c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1z", label: "BioLink", route: "/biolink" },
    { icon: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z", label: "Events", route: "/Events" },
    { icon: "M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H3V5h18v10z", label: "Campaigns", route: "/Campaigns" }
  ];

  return (
    <div className={`layout-theme-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Mobile Navigation */}
      <nav className={`layout-mobile-navbar ${isSearchMode ? 'layout-search-mode' : ''}`}>
        <div className="layout-mobile-nav-content">
          <div className="layout-mobile-nav-left">
            <button 
              className={`layout-mobile-menu-btn ${isMobileMenuOpen ? 'layout-active' : ''}`} 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <div className="layout-mobile-menu-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
          <div className="layout-mobile-nav-center">
            <div className="layout-mobile-logo">Canva AI</div>
          </div>
          <div className="layout-mobile-nav-right">
            <button 
              className="layout-mobile-search-btn" 
              onClick={toggleSearchMode} 
              aria-label="Toggle search" 
            >
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
            <button 
              className="layout-mobile-profile-btn" 
              onClick={toggleProfileDropdown}
              ref={profileButtonRef}
              aria-label="User profile"
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search Mode */}
        <div className="layout-mobile-search-container">
          <input 
            type="text" 
            className="layout-mobile-search-input" 
            placeholder="Search designs, templates..." 
            id="mobileSearchInput"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button 
            className="layout-mobile-search-close" 
            onClick={toggleSearchMode}
            aria-label="Close search"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Mobile Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div className="layout-profile-dropdown layout-mobile-profile-dropdown" ref={profileDropdownRef} role="menu">
            <div className="layout-profile-header">
              <div className="layout-profile-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face&auto=format&q=80" 
                  alt="Brand Manager" 
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="layout-profile-avatar-fallback" style={{display: 'none'}}>B</div>
              </div>
              <div className="layout-profile-info">
                <h3 className="layout-profile-name">Brand Manager</h3>
                <p className="layout-profile-email">brand@company.com</p>
              </div>
            </div>

            <div className="layout-account-balance">
              <h4 className="layout-balance-label">Account Balance</h4>
              <div className="layout-balance-amount">
                <span className="layout-currency">$</span>
                <span className="layout-amount">$24,580</span>
                <span className="layout-balance-change layout-positive">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                  +12.5%
                </span>
              </div>
            </div>

            <div className="layout-profile-menu-items">
              {profileMenuItems.map((item, index) => (
                <button
                  key={index}
                  className="layout-profile-menu-item"
                  onClick={item.onClick}
                  role="menuitem"
                >
                  <div className="layout-menu-item-icon">
                    <svg viewBox="0 0 24 24">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className="layout-menu-item-label">{item.label}</span>
                  {item.hasToggle && (
                    <div className="layout-menu-item-toggle" onClick={item.onClick}>
                      <div className={`layout-toggle-switch ${isDarkMode ? 'layout-active' : ''}`}>
                        <div className="layout-toggle-slider"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="layout-profile-menu-divider"></div>

            <button className="layout-profile-menu-item layout-sign-out" role="menuitem" onClick={onLogout}>
              <div className="layout-menu-item-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </div>
              <span className="layout-menu-item-label">Sign Out</span>
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Overlay */}
      <div 
        className={`layout-mobile-overlay ${isMobileMenuOpen ? 'layout-show' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      ></div>

      <div className="layout-app-container">
        {/* Sidebar */}
        <aside className={`layout-sidebar ${isMobileMenuOpen ? 'layout-open' : ''}`}>
          <div className="layout-menu-toggle">
            <div className="layout-menu-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <nav className="layout-nav-items" role="navigation" aria-label="Main navigation">
            {navItems.map((item, index) => (
              <button 
                key={index}
                className={`layout-nav-item ${location.pathname === item.route ? 'layout-active' : ''}`}
                onClick={() => handleNavClick(index, item.route)}
                aria-current={location.pathname === item.route ? 'page' : undefined}
                title={item.label}
              >
                <svg className="layout-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={item.icon} />
                </svg>
                <span className="layout-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="layout-profile-container">
            <button 
              className="layout-user-avatar" 
              onClick={toggleProfileDropdown}
              ref={profileButtonRef}
              aria-label="User profile menu"
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="menu"
            >
              B
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="layout-profile-dropdown" ref={profileDropdownRef} role="menu">
                <div className="layout-profile-header">
                  <div className="layout-profile-avatar">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face&auto=format&q=80" 
                      alt="Brand Manager" 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="layout-profile-avatar-fallback" style={{display: 'none'}}>B</div>
                  </div>
                  <div className="layout-profile-info">
                    <h3 className="layout-profile-name">Brand Manager</h3>
                    <p className="layout-profile-email">brand@company.com</p>
                  </div>
                </div>

                <div className="layout-account-balance">
                  <h4 className="layout-balance-label">Account Balance</h4>
                  <div className="layout-balance-amount">
                    <span className="layout-currency">$</span>
                    <span className="layout-amount">$24,580</span>
                    <span className="layout-balance-change layout-positive">
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                      </svg>
                      +12.5%
                    </span>
                  </div>
                </div>

                <div className="layout-profile-menu-items">
                  {profileMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className="layout-profile-menu-item"
                      onClick={item.onClick}
                      role="menuitem"
                    >
                      <div className="layout-menu-item-icon">
                        <svg viewBox="0 0 24 24">
                          <path d={item.icon} />
                        </svg>
                      </div>
                      <span className="layout-menu-item-label">{item.label}</span>
                      {item.hasToggle && (
                        <div className="layout-menu-item-toggle" onClick={item.onClick}>
                          <div className={`layout-toggle-switch ${isDarkMode ? 'layout-active' : ''}`}>
                            <div className="layout-toggle-slider"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="layout-profile-menu-divider"></div>

                <button className="layout-profile-menu-item layout-sign-out" role="menuitem" onClick={onLogout}>
                  <div className="layout-menu-item-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                  </div>
                  <span className="layout-menu-item-label">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="layout-main-content" role="main">
          <div className="layout-main-content-inner" ref={mainContentInnerRef}>
            {/* Content Area with Fixed Overflow Protection */}
            <div className="layout-content-wrapper">
              {renderMainContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


export default Layout;