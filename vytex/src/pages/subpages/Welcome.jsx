import React, { useState, useEffect, useRef } from 'react';
import './Welcome.css';

const features = [
  {
    key: 'biolink',
    color: 'var(--primary-color)',
    title: 'BioLink Manager',
    desc: 'Smart links for your brand and partnerships.',
    preview: (
      <div className="feature-preview-biolink">
        <div className="biolink-avatar" />
        <div className="biolink-link biolink-link-1" />
        <div className="biolink-link biolink-link-2" />
        <div className="biolink-link biolink-link-3" />
      </div>
    )
  },
  {
    key: 'schedule',
    color: 'var(--secondary-color)',
    title: 'Social Scheduler',
    desc: 'Automate and optimize your posts.',  
    preview: (
      <div className="feature-preview-schedule">
        <div className="schedule-calendar">
          <div className="schedule-row">
            <div className="schedule-cell active" />
            <div className="schedule-cell" />
            <div className="schedule-cell" />
          </div>
          <div className="schedule-row">
            <div className="schedule-cell" />
            <div className="schedule-cell active" />
            <div className="schedule-cell" />
          </div>
          <div className="schedule-row">
            <div className="schedule-cell" />
            <div className="schedule-cell" />
            <div className="schedule-cell active" />
          </div>
        </div>
        <div className="schedule-bar" />
      </div>
    )
  },
  {
    key: 'affiliate',
    color: 'var(--accent-color)',
    title: 'Affiliate Links',
    desc: 'Track and boost your affiliate revenue.',
    preview: (
      <div className="feature-preview-affiliate">
        <div className="affiliate-link" />
        <div className="affiliate-link highlight" />
        <div className="affiliate-link" />
      </div>
    )
  },
  {
    key: 'ugc',
    color: 'var(--accent-yellow)',
    title: 'UGC Creation',
    desc: 'Create and manage user content easily.',
    preview: (
      <div className="feature-preview-ugc">
        <div className="ugc-image" />
        <div className="ugc-text" />
        <div className="ugc-btn" />
      </div>
    )
  },
  {
    key: 'portfolio',
    color: 'var(--accent-orange)',
    title: 'Portfolio Builder',
    desc: 'Auto-generate a stunning portfolio.',
    preview: (
      <div className="feature-preview-portfolio">
        <div className="portfolio-header" />
        <div className="portfolio-thumb thumb-1" />
        <div className="portfolio-thumb thumb-2" />
        <div className="portfolio-thumb thumb-3" />
      </div>
    )
  },
  {
    key: 'storefront',
    color: 'var(--accent-cyan)',
    title: 'Storefront',
    desc: 'Sell products with ease and style.',
    preview: (
      <div className="feature-preview-storefront">
        <div className="storefront-item item-1" />
        <div className="storefront-item item-2" />
        <div className="storefront-item item-3" />
      </div>
    )
  },
  {
    key: 'collab',
    color: 'var(--accent-blue)',
    title: 'Collaboration',
    desc: 'Connect brands and creators instantly.',
    preview: (
      <div className="feature-preview-collab">
        <div className="collab-user user-1" />
        <div className="collab-user user-2" />
        <div className="collab-link" />
      </div>
    )
  },
  {
    key: 'automation',
    color: 'var(--info-color)',
    title: 'Automation',
    desc: 'Automate your workflows with AI.',
    preview: (
      <div className="feature-preview-automation">
        <div className="automation-gear" />
        <div className="automation-arrow" />
        <div className="automation-flash" />
      </div>
    )
  }
];

function DashboardPreview() {
  return (
    <div className="dashboard-preview-hero">
      <div className="dashboard-header-bar" />
      <div className="dashboard-main-row">
        <div className="dashboard-side-nav" />
        <div className="dashboard-main-content">
          <div className="dashboard-chart" />
          <div className="dashboard-cards-row">
            <div className="dashboard-card dashboard-card-1" />
            <div className="dashboard-card dashboard-card-2" />
            <div className="dashboard-card dashboard-card-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  // Typing animation for feature titles
  const featureTitles = features.map(f => f.title);
  const [current, setCurrent] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);
  const typingTimeout = useRef();

  useEffect(() => {
    let timeout;
    if (typing) {
      if (displayed.length < featureTitles[current].length) {
        timeout = setTimeout(() => {
          setDisplayed(featureTitles[current].slice(0, displayed.length + 1));
        }, 70);
      } else {
        timeout = setTimeout(() => setTyping(false), 1200);
      }
    } else {
      timeout = setTimeout(() => {
        setTyping(true);
        setDisplayed('');
        setCurrent((current + 1) % featureTitles.length);
      }, 600);
    }
    typingTimeout.current = timeout;
    return () => clearTimeout(timeout);
  }, [displayed, typing, current, featureTitles]);

  // For preview animation
  const [prevIndex, setPrevIndex] = useState(0);
  useEffect(() => {
    if (!typing && displayed === '') setPrevIndex(current);
  }, [current, typing, displayed]);

  return (
    <div className="welcome-meaningful-root">
      <section className="meaningful-hero responsive-hero">
        <div className="meaningful-hero-content responsive-hero-content">
          <div className="meaningful-hero-left micro-animated-text">
            <h1 className="meaningful-hero-title">
              Empower Your Brand with
              <span className="typing-animated">{displayed}<span className="typing-cursor">|</span></span> Solutions
            </h1>
            <p className="meaningful-hero-subtitle">Seamlessly manage your online presence, partnerships, and workflows—all in one place.</p>
            <div className="meaningful-hero-actions">
              <button className="meaningful-btn meaningful-btn-primary">Get Started</button>
              <button className="meaningful-btn meaningful-btn-secondary">Learn More</button>
            </div>

          </div>
          <div className="meaningful-hero-right responsive-hero-right">
            <div className="feature-preview-animated-wrapper">
              {features.map((f, i) => (
                <div
                  key={f.key}
                  className={`feature-preview-animated${i === current ? ' active' : ''}${i === prevIndex && i !== current ? ' prev' : ''}`}
                  style={{ display: i === current || i === prevIndex ? 'block' : 'none' }}
                >
                  {f.preview}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="meaningful-features">
        <div className="meaningful-features-grid">
          {features.map((f) => (
            <div className="meaningful-feature-card" key={f.key}>
              <div className="meaningful-feature-accent" style={{ background: f.color }} />
              <div className="meaningful-feature-preview">{f.preview}</div>
              <div className="meaningful-feature-title">{f.title}</div>
              <div className="meaningful-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}