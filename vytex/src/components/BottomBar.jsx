import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Store,
  Link2,
  BarChart3,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import './BottomBar.css';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeHover, setActiveHover] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll visibility with improved logic
  useEffect(() => {
    if (!isMobile) return;

    const SCROLL_THRESHOLD = 20; // Pixels to scroll before hiding/showing

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < SCROLL_THRESHOLD) {
        // Always show bar when at the very top of the page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + SCROLL_THRESHOLD) {
        // Hide bar when scrolling down significantly
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - SCROLL_THRESHOLD) {
        // Show bar when scrolling up significantly
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isMobile]);

  const isActive = (path) => location.pathname === path;

  // Aligned to existing routes
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Zap, label: 'Automation', path: '/Automation' },
    { icon: Link2, label: 'BioLink', path: '/biolink' },
    { icon: Calendar, label: 'Events', path: '/Events' },
    { icon: Users, label: 'Collab', path: '/Collab' }
  ];

  // Don't render anything on desktop
  if (!isMobile) return null;

  return (
    <nav 
      className={`bottom-bar ${isVisible ? 'visible' : 'hidden'}`}
      style={{ '--safe-area-inset-bottom': 'env(safe-area-inset-bottom, 8px)' }}
    >
      {navItems.map(({ icon: Icon, label, path }) => (
        <button
          key={path}
          className={`bottom-bar-item ${isActive(path) ? 'active' : ''}`}
          onClick={() => navigate(path)}
          onMouseEnter={() => setActiveHover(path)}
          onMouseLeave={() => setActiveHover(null)}
          aria-label={label}
          aria-current={isActive(path) ? 'page' : undefined}
        >
          <div className="icon-wrapper">
            <Icon 
              size={24} 
              className={activeHover === path ? 'hover' : ''}
              strokeWidth={isActive(path) ? 2 : 1.5}
            />
          </div>
          <span className="bottom-bar-label">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomBar; 