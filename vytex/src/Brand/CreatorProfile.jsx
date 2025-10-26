import React, { useState, useRef, useEffect } from 'react';
import './CreatorProfile.css';
import ReactDOM from 'react-dom';

const SOCIALS = [
  {
    key: 'tiktok',
    label: 'TikTok',
    count: '60K',
    price: '$120 per post',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
    className: 'creator-social-tiktok',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    count: '10K',
    price: '$200 per video',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    className: 'creator-social-youtube',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    count: '40K',
    price: '$90 per story',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    className: 'creator-social-instagram',
  },
  {
    key: 'twitter',
    label: 'Twitter',
    count: '25K',
    price: '$80 per tweet',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    className: 'creator-social-twitter',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    count: '32K',
    price: '$70 per post',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    className: 'creator-social-facebook',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    count: '18K',
    price: '$110 per post',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    className: 'creator-social-linkedin',
  },
  {
    key: 'custom-offer',
    label: 'Custom Offer',
    count: 'Custom Offer',
    price: 'Negotiable',
    icon: (
      <svg className="creator-social-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        <path d="M12 11l8-5H4l8 5z"/>
      </svg>
    ),
    className: 'creator-social-custom-offer',
  },
];

const SocialDropdownPortal = ({ children }) => {
  if (typeof window === 'undefined') return null;
  return ReactDOM.createPortal(children, document.body);
};

const collabTypes = {
  instagram: [
    { type: 'Post', label: 'Instagram Post' },
    { type: 'Story', label: 'Instagram Story' },
    { type: 'Reel', label: 'Instagram Reel' },
    { type: 'DM Promotion', label: 'Instagram DM Promotion' }
  ],
  tiktok: [
    { type: 'Video', label: 'TikTok Video' },
    { type: 'Live', label: 'TikTok Live' }
  ],
  facebook: [
    { type: 'Post', label: 'Facebook Post' },
    { type: 'Story', label: 'Facebook Story' }
  ],
  youtube: [
    { type: 'Video', label: 'YouTube Video' },
    { type: 'Short', label: 'YouTube Short' },
    { type: 'Community Post', label: 'YouTube Community Post' }
  ],
  twitter: [
    { type: 'Tweet', label: 'Twitter Tweet' },
    { type: 'Thread', label: 'Twitter Thread' }
  ],
  linkedin: [
    { type: 'Post', label: 'LinkedIn Post' },
    { type: 'Article', label: 'LinkedIn Article' }
  ]
};

const offerOptions = SOCIALS.filter(s => s.key !== 'custom-offer').flatMap(social => {
  const types = collabTypes[social.key] || [{ type: 'Collab', label: social.label + ' Collab' }];
  return types.map(t => ({
    label: t.label,
    icon: social.icon
  }));
});

const CreatorProfile = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownLocked, setDropdownLocked] = useState(false);
  const [showCustomOfferModal, setShowCustomOfferModal] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState("");
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: true });
  const socialScrollRef = useRef(null);
  const contentTypeOptions = [
    {
      value: "post",
      label: "Instagram Post",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      value: "story",
      label: "Instagram Story",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      value: "reel",
      label: "Instagram Reel",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      value: "video",
      label: "YouTube Video",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      value: "tweet",
      label: "Twitter Post",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      value: "tiktok",
      label: "TikTok Video",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      ),
    },
    {
      value: "custom",
      label: "Custom Content",
      icon: (
        <svg className="creator-content-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
        </svg>
      ),
    },
  ];
  const dropdownRefs = useRef({});
  const hoverTimeout = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(offerOptions[0]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown].contains(event.target)
      ) {
        setOpenDropdown(null);
        setDropdownLocked(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Handle scroll indicators
  useEffect(() => {
    const scrollElement = socialScrollRef.current;
    if (!scrollElement) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
      
      setScrollState({ canScrollLeft, canScrollRight });
      
      // Update wrapper classes for visual indicators
      const wrapper = scrollElement.closest('.creator-social-stats-scroll-wrapper');
      if (wrapper) {
        wrapper.classList.toggle('scrolled-left', canScrollLeft);
        wrapper.classList.toggle('scrolled-right', !canScrollRight);
      }
    };

    // Initial check
    updateScrollState();

    // Add scroll listener
    scrollElement.addEventListener('scroll', updateScrollState);
    
    // Add resize listener to handle window size changes
    window.addEventListener('resize', updateScrollState);

    return () => {
      scrollElement.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const handleMouseEnter = (key) => {
    if (dropdownLocked) return;
    clearTimeout(hoverTimeout.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    if (dropdownLocked) return;
    hoverTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 120);
  };

  const handleClick = (key) => {
    if (key === 'custom-offer') {
      setShowCustomOfferModal(true);
      return;
    }
    
    if (openDropdown === key && dropdownLocked) {
      setOpenDropdown(null);
      setDropdownLocked(false);
    } else {
      setOpenDropdown(key);
      setDropdownLocked(true);
    }
  };

  return (
    <div className="creator-profile-container">
      {/* Creator Banner */}
      <div className="creator-banner-grid">
        <img 
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" 
          className="creator-banner-image" 
          alt="Creator 1" 
        />
        <img 
          src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=300&h=200&fit=crop" 
          className="creator-banner-image" 
          alt="Creator 2" 
        />
        <img 
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=200&fit=crop" 
          className="creator-banner-image" 
          alt="Creator 3" 
        />
      </div>

      {/* Profile Card */}
      <div className="creator-profile-main-columns" style={{ display: 'flex', gap: '0',marginTop:'1.5rem'}}>
        {/* Left Side (65%) */}
        <div className='creator-profile-left' style={{width: '65%',}}>
          <div className="creator-profile-card">
            <div className="creator-profile-header">
              <div className="creator-profile-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                  alt="Michael" 
                  className="creator-avatar-image"
                />
              </div>
              <div className="creator-profile-info">
                <div className="creator-profile-badges">
                  <div className="creator-name-badge">Michael</div>
                  <div className="creator-rating-badge flex items-center">
                    <svg className="creator-achievement-icon creator-achievement-icon-star-lucid mr-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/>
                    </svg>
                    <span className="text-xl font-semibold">4.8</span> <span className="creator-rating-count ml-1">(20)</span>
                  </div>
                </div>
                <p className="creator-profile-category">Lifestyle | Health | Fitness</p>
                <div className="creator-location">
                  <svg className="creator-location-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>New York, USA</span>
                </div>
              </div>
            </div>

           

            {/* Social Stats */}
            <div
              className="creator-social-stats-scroll-wrapper"
              style={{ overflow: 'visible', position: 'relative', zIndex: 20 }}
            >
              <div
                ref={socialScrollRef}
                className="creator-social-stats creator-social-stats-scroll"
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  whiteSpace: 'nowrap',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE 10+
                  gap: '1.5rem',
                  paddingBottom: '0.5rem',
                  marginBottom: '1.5rem',
                  scrollBehavior: 'smooth',
                  // Add smooth scrolling and better UX
                  scrollSnapType: 'x mandatory',
                  scrollPadding: '1rem',
                }}
              >
                {SOCIALS.map((social) => (
                  <div
                    key={social.key}
                    className={`creator-social-stat ${social.className}`}
                    onMouseEnter={social.key !== 'custom-offer' ? () => handleMouseEnter(social.key) : undefined}
                    onMouseLeave={social.key !== 'custom-offer' ? handleMouseLeave : undefined}
                    onClick={() => handleClick(social.key)}
                    ref={social.key !== 'custom-offer' ? (el => (dropdownRefs.current[social.key] = el)) : undefined}
                    style={{ position: 'relative' }}
                  >
                    {social.icon}
                    <span>{social.count}</span>
                    {social.key !== 'custom-offer' && (
                      <svg className="creator-dropdown-icon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.293l3.71-3.06a.75.75 0 111.02 1.1l-4.25 3.5a.75.75 0 01-.98 0l-4.25-3.5a.75.75 0 01.02-1.06z"/></svg>
                    )}
                    {social.key !== 'custom-offer' && openDropdown === social.key && (
                      <SocialDropdownPortal>
                        <div
                          className={`creator-social-dropdown-box show`}
                          style={{
                            pointerEvents: 'auto',
                            position: 'absolute',
                            top: dropdownRefs.current[social.key]?.getBoundingClientRect().bottom + window.scrollY + 8 || 0,
                            left: dropdownRefs.current[social.key]?.getBoundingClientRect().left + window.scrollX + (dropdownRefs.current[social.key]?.offsetWidth || 0) / 2,
                            transform: 'translateX(-50%)',
                            zIndex: 99999,
                          }}
                        >
                          <div className="creator-social-collab-list">
                            <div className="creator-social-collab-item">
                              <span>Post</span>
                              <span className="creator-social-dropdown-price">$120 per post</span>
                              <button className="creator-social-dropdown-btn">Collaborate</button>
                            </div>
                            <div className="creator-social-collab-item">
                              <span>Story</span>
                              <span className="creator-social-dropdown-price">$90 per story</span>
                              <button className="creator-social-dropdown-btn">Collaborate</button>
                            </div>
                            <div className="creator-social-collab-item">
                              <span>Reel</span>
                              <span className="creator-social-dropdown-price">$150 per reel</span>
                              <button className="creator-social-dropdown-btn">Collaborate</button>
                            </div>
                            <div className="creator-social-collab-item">
                              <span>DM Promotion</span>
                              <span className="creator-social-dropdown-price">$60 per campaign</span>
                              <button className="creator-social-dropdown-btn">Collaborate</button>
                            </div>
                          </div>
                        </div>
                      </SocialDropdownPortal>
                    )}
                  </div>
                ))}
              </div>
            </div>






             {/* Badges */}
             {/* Removed badges from here */}

            {/* Bio Section */}
            <div className="creator-bio-section">
              <h3 className="creator-section-title">About Me</h3>
              {/* Tight badges row below title */}
              <div className="creator-achievements-container" style={{padding: 0, marginBottom: '0.75rem'}}>
                <div className="creator-achievement-inline-row" style={{gap: '0.5rem'}}>
                  <span className="creator-achievement-inline-item" style={{padding: '0.25rem 0.7rem', fontSize: '0.98rem'}}>
                    <svg className="creator-achievement-icon creator-achievement-icon-star" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/>
                    </svg>
                    Michael is a Top Creator
                  </span>
                  <span className="creator-achievement-inline-item" style={{padding: '0.25rem 0.7rem', fontSize: '0.98rem'}}>
                    <svg className="creator-achievement-icon creator-achievement-icon-lightning" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9v8l10-12h-9z"/>
                    </svg>
                    Michael Responds Fast
                  </span>
                </div>
              </div>
              <div className="creator-bio-content">
                <p>👋 Hi there! I'm Michael, a passionate content creator specializing in lifestyle, health, and fitness. With over 5 years of experience in the digital space, I create engaging content that inspires and educates my audience.</p>
                <p>💪 My mission is to help people live healthier, happier lives through sustainable fitness routines and balanced nutrition. I believe in making wellness accessible to everyone, regardless of their fitness level.</p>
                {/* Badges (moved here as requested) */}
                <div className="creator-bio-highlights">
                  <div className="bio-highlight">
                    <svg className="bio-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <span>5+ years of content creation experience</span>
                  </div>
                  <div className="bio-highlight">
                    <svg className="bio-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <span>100K+ followers across all platforms</span>
                  </div>
                  <div className="bio-highlight">
                    <svg className="bio-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    <span>Certified Personal Trainer & Nutritionist</span>
                  </div>
                </div>
                <div className="creator-tags">
                  <span className="creator-tag">#Fitness</span>
                  <span className="creator-tag">#HealthyLifestyle</span>
                  <span className="creator-tag">#Wellness</span>
                  <span className="creator-tag">#Nutrition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Offer Modal */}
          {showCustomOfferModal && (
            <div
              className={`creator-custom-offer-modal show`}
              onClick={e => {
                if (e.target.classList.contains('creator-custom-offer-modal')) setShowCustomOfferModal(false);
              }}
            >
              <div className="creator-custom-offer-modal-content" style={{maxWidth: 420, width: '100%', padding: 0}}>
                <div className="creator-custom-offer-modal-header" style={{padding: '1.5rem 2rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '20px 20px 0 0', background: 'var(--card-bg)'}}>
                  <div className="creator-custom-offer-modal-title" style={{fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)'}}>Create a Custom Offer for Michael</div>
                  <button
                    className="creator-custom-offer-modal-close"
                    onClick={() => setShowCustomOfferModal(false)}
                    style={{background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 22, cursor: 'pointer', borderRadius: '50%', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                <div className="creator-custom-offer-modal-body" style={{padding: '2rem', background: 'var(--card-bg)'}}>
                  <div className="creator-custom-offer-form">
                    <div className={`creator-popup-animate delay1 creator-custom-offer-field creator-content-type-dropdown-container${contentDropdownOpen ? ' open' : ''}`}>
                      <label>What kind of content do you need?</label>
                      <div className="creator-content-type-dropdown" tabIndex={0} onBlur={() => setContentDropdownOpen(false)}>
                        <div
                          className={`creator-content-type-selected${contentDropdownOpen ? ' open' : ''}`}
                          onClick={() => setContentDropdownOpen(open => !open)}
                        >
                          {selectedContentType ? (
                            <>
                              {contentTypeOptions.find(opt => opt.value === selectedContentType)?.icon}
                              <span>{contentTypeOptions.find(opt => opt.value === selectedContentType)?.label}</span>
                            </>
                          ) : (
                            <span className="creator-content-type-placeholder">Choose Content Type</span>
                          )}
                          <svg className="creator-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                          </svg>
                        </div>
                        {contentDropdownOpen && (
                          <div className="creator-content-type-options-list">
                            {contentTypeOptions.map(opt => (
                              <div
                                key={opt.value}
                                className={`creator-content-type-option${selectedContentType === opt.value ? ' selected' : ''}`}
                                onClick={() => { setSelectedContentType(opt.value); setContentDropdownOpen(false); }}
                              >
                                {opt.icon}
                                <span>{opt.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="creator-popup-animate delay2 creator-custom-offer-field">
                      <label>How many pieces of content do you need?</label>
                      <input type="number" placeholder="Quantity" min="1" />
                    </div>
                    <div className="creator-popup-animate delay3 creator-custom-offer-field">
                      <label>Set a price for your offer</label>
                      <input type="number" placeholder="Offer Price (USD)" min="1" />
                    </div>
                    <div className="creator-popup-animate delay4 creator-custom-offer-note" style={{marginBottom: '1.5rem'}}>
                      On average, Michael charges $138. Keep this in mind when pricing your offer.
                    </div>
                    <button className="creator-popup-animate delay5 creator-custom-offer-submit">Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Side (35%) - Offer Card */}
        <div className="creator-profile-right">
          <div className="creator-offer-card">
            <div className="creator-offer-price">$700</div>
            <div className={`creator-offer-dropdown custom-dropdown${dropdownOpen ? ' open' : ''}`} tabIndex={0} onBlur={() => setDropdownOpen(false)}>
              <div className="dropdown-selected" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span className="dropdown-icon">{selectedOffer.icon}</span>
                <span>{selectedOffer.label}</span>
                <svg className="dropdown-arrow" width="20" height="20" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {offerOptions.map((opt, idx) => (
                    <div className="dropdown-option" key={opt.label} onClick={() => { setSelectedOffer(opt); setDropdownOpen(false); }}>
                      <span className="dropdown-icon">{opt.icon}</span>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="creator-offer-desc">
              I will be talking about the product in a 60 second video to my viewers <span className="creator-offer-muted">(average audience views: 100k)</span>
            </div>
            <div className="creator-offer-bottom">
              <button className="creator-offer-btn">Add to Cart</button>
              <div className="creator-offer-custom">
                Can't find what you need?{" "}
                <span
                  className="creator-offer-link"
                  onClick={() => setShowCustomOfferModal(true)}
                  style={{ cursor: "pointer" }}
                >
                  Custom Offer
                </span>
              </div>
            </div>
            {/* Custom Offer Modal */}
            {showCustomOfferModal && (
              <div className="creator-custom-offer-modal-overlay">
                <div className="creator-custom-offer-modal">
                  <button
                    className="creator-custom-offer-modal-close"
                    onClick={() => setShowCustomOfferModal(false)}
                  >
                    &times;
                  </button>
                  <div className="creator-custom-offer-modal-content">
                    <h2>Request a Custom Offer</h2>
                    <div className="creator-custom-offer-field">
                      <label>How many pieces of content do you need?</label>
                      <input type="number" placeholder="Quantity" min="1" />
                    </div>
                    <div className="creator-custom-offer-field">
                      <label>Set a price for your offer</label>
                      <input type="number" placeholder="Offer Price (USD)" min="1" />
                    </div>
                    <div className="creator-custom-offer-note" style={{marginBottom: '1.5rem'}}>
                      On average, Michael charges $138. Keep this in mind when pricing your offer.
                    </div>
                    <button className="creator-custom-offer-submit">Add to Cart</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CreatorProfile;