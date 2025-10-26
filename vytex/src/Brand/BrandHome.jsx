
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandHome.css';

const AVATAR_URL = "https://randomuser.me/api/portraits/men/32.jpg";
const BG_URL = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

const BrandHome = () => {
  const socialScrollRef = useRef(null);
  const [arrow, setArrow] = useState('>');
  const [isScrolling, setIsScrolling] = useState(true);
  const frameIdRef = useRef(null);
  const navigate = useNavigate();
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: true });

  useEffect(() => {
    const el = socialScrollRef.current;
    if (!el) return;

    const autoScroll = () => {
      if (!el) return;
      el.scrollLeft += 0.5;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
      frameIdRef.current = requestAnimationFrame(autoScroll);
    };

    const startScrolling = () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      frameIdRef.current = requestAnimationFrame(autoScroll);
    };

    const stopScrolling = () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };

    // Add smooth scroll behavior
    el.style.scrollBehavior = 'smooth';

    if (isScrolling) {
      const timeoutId = setTimeout(startScrolling, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      stopScrolling();
    }

    return stopScrolling; // Cleanup on unmount
  }, [isScrolling]);

  // Add scroll event listeners for better UX
  useEffect(() => {
    const el = socialScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      // Pause auto-scroll when user manually scrolls
      setIsScrolling(false);
      
      // Update scroll indicators
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
      
      setScrollState({ canScrollLeft, canScrollRight });
      
      // Update scroll container classes for visual indicators
      el.classList.toggle('scrolled-left', canScrollLeft);
      el.classList.toggle('scrolled-right', !canScrollRight);
    };

    const handleScrollEnd = () => {
      // Resume auto-scroll after a delay
      setTimeout(() => setIsScrolling(true), 3000);
    };

    el.addEventListener('scroll', handleScroll);
    el.addEventListener('scrollend', handleScrollEnd);

    // Initial scroll state check
    handleScroll();

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('scrollend', handleScrollEnd);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setArrow((prev) => (prev === '>' ? '>>' : '>'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const cards = Array.from({ length: 1 });

  return (
    <div className="brandhome-profile-grid-container">
      {cards.map((_, idx) => (
        <div className="brandhome-profile-card" key={idx}>
          {/* Background thumbnail - full width at top */}
          <div className="brandhome-background-thumbnail">
            <img src={BG_URL} alt="Background" className="brandhome-background-img" />
          </div>

          {/* Main content area with padding */}
          <div className="brandhome-main-content">
            {/* Avatar and Rating Row - positioned to overlap background */}
            <div className="brandhome-avatar-rating-row">
              {/* Avatar - rounded square, overlapping background */}
              <div className="brandhome-avatar-container">
                <img src={AVATAR_URL} alt="Avatar" className="brandhome-avatar-img" />
                <div className="brandhome-online-indicator"></div>
              </div>
              {/* Rating - pill shaped */}
              <div className="brandhome-rating-badge">
                <span className="brandhome-rating-text">
                  <svg className="brandhome-rating-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  4.8
                </span>
              </div>
            </div>
            {/* Name and Follower Count - full width rounded rectangle */}
            <div className="brandhome-name-section">
              <div className="brandhome-name-container">
                <span className="brandhome-name-text">Name</span>
                <span className="brandhome-follower-count">110K</span>
              </div>
              <div className="brandhome-niche-tags">
                <span className="brandhome-niche-tag">Fashion</span>
                <span className="brandhome-niche-tag">Tech</span>
                <span className="brandhome-niche-tag">Fitness</span>
              </div>
            </div>
            {/* Social Media Stats - horizontal scrollable pills, only 3 visible at a time */}
            <div
              className="brandhome-social-stats-scroll"
              ref={socialScrollRef}
              onMouseEnter={() => setIsScrolling(false)}
              onMouseLeave={() => setIsScrolling(true)}
            >
              <div className="brandhome-social-stats brandhome-social-stats-loop">
                {/* TikTok */}
                <button className="brandhome-social-button brandhome-tiktok-button">
                  <svg className="brandhome-social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  <span className="brandhome-social-text">60K</span>
                </button>
                {/* YouTube */}
                <button className="brandhome-social-button brandhome-youtube-button">
                  <svg className="brandhome-social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.847 2.847 0 00-2.006-2.017C19.587 3.7 12 3.7 12 3.7s-7.587 0-9.492.469A2.847 2.847 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.847 2.847 0 002.006 2.017C4.413 20.3 12 20.3 12 20.3s7.587 0 9.492-.469a2.847 2.847 0 002.006-2.017C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  <span className="brandhome-social-text">10K</span>
                </button>
                {/* Instagram */}
                <button className="brandhome-social-button brandhome-instagram-button">
                  <svg className="brandhome-social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span className="brandhome-social-text">40K</span>
                </button>
                {/* X (Twitter) */}
                <button className="brandhome-social-button brandhome-x-button">
                  <svg className="brandhome-social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.53 2.47a2.5 2.5 0 013.54 3.53l-5.47 5.47 5.47 5.47a2.5 2.5 0 01-3.54 3.53L12 14.53l-5.47 5.47a2.5 2.5 0 01-3.53-3.53L8.47 12 3 6.53A2.5 2.5 0 016.53 3L12 8.47 17.53 2.47z"/></svg>
                  <span className="brandhome-social-text">25K</span>
                </button>
                {/* Facebook */}
                <button className="brandhome-social-button brandhome-facebook-button">
                  <svg className="brandhome-social-icon" style={{width: '1.6rem', height: '1.6rem'}} viewBox="0 0 24 24" fill="none"><path d="M17.525 8.998H14.998V7.498c0-.6.4-.748.68-.748h1.797V4.102L14.998 4.1c-2.1 0-2.998 1.6-2.998 3.3v1.598H9.5v2.7h2.5v7.7h3v-7.7h2.1l.425-2.7z" fill="#fff"/></svg>
                  <span className="brandhome-social-text">32K</span>
                </button>
                {/* LinkedIn */}
                <button className="brandhome-social-button brandhome-linkedin-button">
                  <svg className="brandhome-social-icon" style={{width: '1.6rem', height: '1.6rem'}} viewBox="0 0 32 32" fill="none"><path d="M12 12h3.555v2.197h.051c.495-.936 1.703-1.922 3.51-1.922 3.755 0 4.45 2.47 4.45 5.678V24h-3.72v-5.333c0-1.272-.023-2.91-1.775-2.91-1.777 0-2.049 1.388-2.049 2.819V24H12V12zM8.667 10.667a1.667 1.667 0 110-3.334 1.667 1.667 0 010 3.334zM10.528 24H6.805V12h3.723v12z" fill="#fff"/></svg>
                  <span className="brandhome-social-text">18K</span>
                </button>
              </div>
            </div>
            {/* Collaborate Button - clean, modern, attractive, no icon */}
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button className="brandhome-collaborate-button brandhome-amount-button" style={{ width: '30%' }}>
                $100
              </button>
              <button 
                className="brandhome-collaborate-button brandhome-collaborate-modern" 
                style={{ width: '70%' }} 
                onClick={() => navigate('/brand/creator-profile')}
              >
                <span className="brandhome-collaborate-text">
                  VIEW PROFILE
                  <span className="brandhome-arrow-animate" aria-hidden="true">&gt;&gt;</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandHome;