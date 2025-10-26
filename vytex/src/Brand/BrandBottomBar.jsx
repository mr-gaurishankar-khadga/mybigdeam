import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  BarChart3, 
  DollarSign, 
  Mail
} from 'lucide-react';
import './BrandBottomBar.css';

const BrandBottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeHover, setActiveHover] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const SCROLL_THRESHOLD = 20;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < SCROLL_THRESHOLD) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + SCROLL_THRESHOLD) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - SCROLL_THRESHOLD) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isMobile]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/brand' },
    { icon: Users, label: 'Collab', path: '/brand/collaborations' },
    { icon: DollarSign, label: 'Finance', path: '/brand/finance' },
    { icon: BarChart3, label: 'Analytic', path: '/brand/analytics' },
    { icon: Mail, label: 'Inbox', path: '/brand/inbox' }
  ];

  if (!isMobile) return null;

  return (
    <nav 
      className={`brand-bottom-bar ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        '--safe-area-inset-bottom': 'env(safe-area-inset-bottom, 8px)'
      }}
    >
      {navItems.map(({ icon: Icon, label, path }) => (
        <button
          key={path}
          className={`brand-bottom-bar-item ${isActive(path) ? 'active' : ''}`}
          onClick={() => navigate(path)}
          onMouseEnter={() => setActiveHover(path)}
          onMouseLeave={() => setActiveHover(null)}
          aria-label={label}
          aria-current={isActive(path) ? 'page' : undefined}
        >
          <div className="brand-icon-wrapper">
            <Icon 
              size={24} 
              className={activeHover === path ? 'hover' : ''}
              strokeWidth={isActive(path) ? 2 : 1.5}
            />
          </div>
          <span className="brand-bottom-bar-label">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BrandBottomBar; 