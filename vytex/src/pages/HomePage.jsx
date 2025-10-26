import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Users, 
  Zap, 
  Heart,
  Eye, 
  DollarSign, 
  BarChart3,
  User,
  CheckCircle,
  Plus,
  Settings,
  Link2, 
  Calendar,
  Image,
  MessageCircle,
  Youtube,
  Instagram,
  Facebook,
  Rocket,
  Scissors,
  Camera,
  Video,
  Smartphone,
  Sparkles,
  CalendarDays,
  ImageIcon,
  BarChart,
  Target,
  Mail,
  Phone,
  MapPin,
  Bot,
  TrendingUp,
} from 'lucide-react';
import './HomePage.css';

// Frame content blocks (single screens)
const BioLinkContent = () => {
  return (
    <div className="homepage-biolink-preview">
      <div className="homepage-profile-section">
        <div className="homepage-profile-avatar-large"></div>
        <div className="homepage-profile-name-large">gshankar</div>
        <div className="homepage-profile-tagline">I Am A Content Creator</div>
      </div>
      <div className="homepage-biolink-buttons">
        <div className="homepage-biolink-btn">
          <User className="homepage-btn-icon" size={18} />
          <span>About Me</span>
        </div>
        <div className="homepage-biolink-btn">
          <Image className="homepage-btn-icon" size={18} />
          <span>Portfolio</span>
        </div>
        <div className="homepage-biolink-btn">
          <MessageCircle className="homepage-btn-icon" size={18} />
          <span>Contact</span>
        </div>
      </div>
      <div className="homepage-social-links-bottom">
        <div className="homepage-social-icon-bottom youtube">
          <Youtube size={16} />
        </div>
        <div className="homepage-social-icon-bottom instagram">
          <Instagram size={16} />
        </div>
        <div className="homepage-social-icon-bottom facebook">
          <Facebook size={16} />
        </div>
      </div>
    </div>
  );
};

const AutomationContent = () => {
  return (
    <div className="homepage-automation-preview">
      <div className="homepage-automation-header">
        <h3 className="homepage-automation-title">Social Media Automation</h3>
      </div>
      <div className="homepage-bots-grid">
        <div className="homepage-bot-card">
          <div className="homepage-bot-image">
            <div className="homepage-bot-avatar bot-1">
              <img 
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop&crop=face" 
                alt="Robot 1" 
                className="homepage-bot-image"
              />
            </div>
          </div>
          <div className="homepage-bot-info">
            <div className="homepage-bot-name">Bot 1</div>
            <div className="homepage-bot-status active">Active</div>
          </div>
        </div>
        <div className="homepage-bot-card">
          <div className="homepage-bot-image">
            <div className="homepage-bot-avatar bot-2">
              <img 
                src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=100&h=100&fit=crop&crop=face" 
                alt="Robot 2" 
                className="homepage-bot-image"
              />
            </div>
          </div>
          <div className="homepage-bot-info">
            <div className="homepage-bot-name">Bot 2</div>
            <div className="homepage-bot-status inactive">Inactive</div>
          </div>
        </div>
        <div className="homepage-bot-card">
          <div className="homepage-bot-image">
            <div className="homepage-bot-avatar bot-3">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face" 
                alt="Robot 3" 
                className="homepage-bot-image"
              />
            </div>
          </div>
          <div className="homepage-bot-info">
            <div className="homepage-bot-name">Bot 3</div>
            <div className="homepage-bot-status active">Active</div>
          </div>
        </div>
      </div>
      <div className="homepage-metrics-section">
        <h3 className="homepage-metrics-title">Key Metrics</h3>
        <div className="homepage-metrics-grid">
          <div className="homepage-metric-item">
            <div className="homepage-metric-value">+15%</div>
            <div className="homepage-metric-change">+15%</div>
          </div>
          <div className="homepage-metric-item">
            <div className="homepage-metric-value">234</div>
            <div className="homepage-metric-change">+20%</div>
          </div>
          <div className="homepage-metric-item">
            <div className="homepage-metric-value">+1,204</div>
            <div className="homepage-metric-change">+15%</div>
            <div className="homepage-metric-period">Last 30 Days</div>
          </div>
        </div>
        <div className="homepage-chart-container">
          <div className="homepage-chart-line">
            <div className="homepage-chart-point" style={{left: '10%', bottom: '30%'}}></div>
            <div className="homepage-chart-point" style={{left: '25%', bottom: '60%'}}></div>
            <div className="homepage-chart-point" style={{left: '40%', bottom: '20%'}}></div>
            <div className="homepage-chart-point" style={{left: '55%', bottom: '70%'}}></div>
            <div className="homepage-chart-point" style={{left: '70%', bottom: '25%'}}></div>
            <div className="homepage-chart-point" style={{left: '85%', bottom: '80%'}}></div>
          </div>
          <div className="homepage-chart-labels">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UGCContent = () => {
  return (
    <div className="ugc-feed-container">
      <div className="homepage-automation-header">
        <h3 className="homepage-automation-title">User Generated Content</h3>
      </div>
      <div className="ugc-post-card">
        <div className="post-header">
          <div className="user-avatar"></div>
          <div className="user-info">
            <div className="username">@maya_beauty</div>
            <div className="post-time">2h</div>
          </div>
          <Heart size={10} className="like-icon" />
        </div>
        <div className="post-content">
          <div className="post-image">
            <div className="image-placeholder">
              <Camera size={16} />
            </div>
            <div className="post-overlay">
              <div className="engagement-count">
                <Heart size={8} />
                <span>1.2K</span>
              </div>
            </div>
          </div>
        </div>
        <div className="post-caption">
          <span className="caption-text">Amazing results with this product! ✨</span>
        </div>
      </div>
      <div className="ugc-post-card">
        <div className="post-header">
          <div className="user-avatar video-avatar"></div>
          <div className="user-info">
            <div className="username">@fitness_alex</div>
            <div className="post-time">5h</div>
          </div>
          <Eye size={10} className="view-icon" />
        </div>
        <div className="post-content">
          <div className="post-video">
            <div className="video-placeholder">
              <Video size={16} />
            </div>
            <div className="play-button">
              <div className="play-icon"></div>
            </div>
            <div className="video-duration">0:15</div>
          </div>
        </div>
      </div>
      <div className="ugc-stats-bar">
        <div className="stat-item">
          <span className="stat-number">2.4K</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">89%</span>
          <span className="stat-label">Authentic</span>
        </div>
      </div>
    </div>
  );
};

// Reusable cyclic slider per frame (controlled by parent index)
const FrameSlider = ({ slides, index }) => {
  return (
    <div className="frame-slider">
      <div key={index} className="frame-slide">
        {slides[index % slides.length]}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [sliderIndex, setSliderIndex] = useState(0)
  const heroRef = React.createRef(null)
  const featuresRef = React.createRef(null)

  // Intersection Observer for animations
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (heroRef.current) observer.observe(heroRef.current)
    if (featuresRef.current) observer.observe(featuresRef.current)

    return () => observer.disconnect()
  }, [])

  // Auto-rotate features
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Shared slider index for all three frames (sync)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSliderIndex((prev) => prev + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [])


  
  
  
  
  const coreFeatures = [
    {
      title: 'BioLink Creator',
      description: 'Build stunning link pages that convert visitors into followers',
      icon: Link2,
      color: 'var(--primary-color)',
      action: () => window.location.href = '/biolink',
      stats: '12.4K views'
    },
    {
      title: 'Campaign Manager',
      description: 'Launch & track marketing campaigns with advanced automation',
      icon: Target,
      color: 'var(--accent-color)',
      action: () => window.location.href = '/Campaigns',
      stats: '8 active'
    },
    {
      title: 'UGC Hub',
      description: 'Collect & showcase user-generated content to build trust',
      icon: Heart,
      color: 'var(--secondary-color)',
      action: () => window.location.href = '/UGC',
      stats: '156 pieces'
    },
    {
      title: 'Automation Studio',
      description: 'Streamline workflows with powerful automation tools',
      icon: Zap,
      color: 'var(--warning-color)',
      action: () => window.location.href = '/Automation',
      stats: '5 flows'
    }
  ]

  const quickActions = [
    { icon: Plus, label: 'Create', action: () => window.location.href = '/Create', color: 'var(--primary-color)' },
    { icon: BarChart3, label: 'Analytics', action: () => window.location.href = '/Analytics', color: 'var(--accent-color)' },
    { icon: Users, label: 'Collaborate', action: () => window.location.href = '/Collab', color: 'var(--secondary-color)' },
    { icon: Calendar, label: 'Events', action: () => window.location.href = '/Events', color: 'var(--accent-cyan)' }
  ]

  const stats = [
    { value: '$24.5K', label: 'Total Earnings', change: '+12.5%', icon: DollarSign },
    { value: '12.4K', label: 'BioLink Views', change: '+8.2%', icon: Eye },
    { value: '156', label: 'Content Pieces', change: '+23', icon: Heart },
    { value: '8', label: 'Active Campaigns', change: '+2', icon: Target }
  ]

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section ref={heroRef} className="homepage-hero-section">
        <div className="homepage-hero-background">
          <div className="homepage-hero-gradient-1"></div>
          <div className="homepage-hero-gradient-2"></div>
          <div className="homepage-hero-gradient-3"></div>
        </div>
        
        <div className="homepage-hero-content">
          <div className="homepage-hero-main">
            <h1 className="homepage-hero-title">
              WELCOME CREATORS
            </h1>
            
            <p className="homepage-hero-subtitle">
              The most advanced platform for creators to manage links, campaigns, 
              collaborations, and grow their audience with AI-powered tools.
            </p>
            
            <div className="homepage-hero-actions">
              <button 
                className="homepage-btn-primary"
                onClick={() => window.location.href = '/Create'}
              >
                <Rocket size={20} />
                Start Creating
              </button>
              <button 
                className="homepage-btn-secondary"
                onClick={() => window.location.href = '/biolink'}
              >
                <Link2 size={20} />
                Build BioLink
              </button>
            </div>
            
            <div className="homepage-hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="homepage-stat-item">
                  <div className="homepage-stat-icon">
                    <stat.icon size={20} />
                  </div>
                  <div className="homepage-stat-content">
                    <span className="homepage-stat-number">{stat.value}</span>
                    <span className="homepage-stat-label">{stat.label}</span>
                    <span className="homepage-stat-change">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          





          <div className="homepage-hero-visual homepage-hero-visual-positioned">
            <div className="homepage-mobile-frames-container">
              {/* Left Mobile Frame - BioLink → Automation → UGC */}
              <div className="homepage-mobile-frame homepage-mobile-frame-left">
                <div className="homepage-mobile-screen">
                  <div className="homepage-mobile-content">
                    <div className="slide-track">
                      <FrameSlider 
                        index={sliderIndex}
                        slides={[
                          <BioLinkContent key="bio" />,
                          <AutomationContent key="auto" />,
                          <UGCContent key="ugc" />
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Mobile Frame - Automation → UGC → BioLink */}
              <div className="homepage-mobile-frame homepage-mobile-frame-center">
                <div className="homepage-mobile-screen">
                  <div className="homepage-mobile-content">
                    <div className="slide-track">
                      <FrameSlider 
                        index={sliderIndex}
                        slides={[
                          <AutomationContent key="auto" />,
                          <UGCContent key="ugc" />,
                          <BioLinkContent key="bio" />
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Mobile Frame - UGC → BioLink → Automation */}
              <div className="homepage-mobile-frame homepage-mobile-frame-right">
                <div className="homepage-mobile-screen">
                  <div className="homepage-mobile-content">
                    <div className="slide-track">
                      <FrameSlider 
                        index={sliderIndex}
                        slides={[
                          <UGCContent key="ugc" />,
                          <BioLinkContent key="bio" />,
                          <AutomationContent key="auto" />
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>









      {/* Core Features */}
      <section ref={featuresRef} className="homepage-features-section">
        <div className="homepage-section-header">
          <h2 className="homepage-section-title">Everything You Need</h2>
          <p className="homepage-section-subtitle">Powerful tools to grow your creator business</p>
        </div>
        
        <div className="homepage-features-grid">
          {coreFeatures.map((feature, index) => (
            <div 
              key={index}
              className={`homepage-feature-card ${isVisible ? 'homepage-animate-in' : ''}`}
              onClick={feature.action}
              style={{ 
                '--feature-color': feature.color,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="homepage-feature-header">
                <div className="homepage-feature-icon">
                  <feature.icon size={32} />
                </div>
                <span className="homepage-feature-stats">{feature.stats}</span>
              </div>
              <div className="homepage-feature-content">
                <h3 className="homepage-feature-title">{feature.title}</h3>
                <p className="homepage-feature-description">{feature.description}</p>
              </div>
              <div className="homepage-feature-arrow">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="homepage-quick-actions-section">
        <div className="homepage-section-header">
          <h2 className="homepage-section-title">Quick Actions</h2>
        </div>
        
        <div className="homepage-quick-actions-grid">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="homepage-quick-action-card"
              onClick={action.action}
              style={{ '--action-color': action.color }}
            >
              <div className="homepage-action-icon">
                <action.icon size={24} />
              </div>
              <span className="homepage-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage