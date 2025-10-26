import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Check,
  Sparkles,
  Wand2,
  Settings,
  Rocket,
  Users,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Star,
  Crown,
  Flame,
  Lightbulb,
  Gem,
  Video,
  Image,
  FileText,
  MessageCircle,
  Send,
  GitBranch,
  Clock
} from 'lucide-react';
import './Automation.css';

const Automation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // API config
  const API_BASE = import.meta.env.VITE_BACKEND_URL;
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // State management
  const [flows, setFlows] = useState([]);
  const [socialConnections, setSocialConnections] = useState({
    instagram: false,
    facebook: false,
    twitter: false,
    youtube: false,
    linkedin: false
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeNavTab, setActiveNavTab] = useState('template');

  // Fetch data functions
  const fetchFlows = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/automation/flows`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const data = await response.json();
      console.log('Fetched flows response:', data);
      if (data.success) {
        setFlows(data.flows);
      } else {
        console.error('Failed to fetch flows:', data.error);
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/automation/analytics`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [API_BASE]);

  // Fetch social connections
  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/automation/connections`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const data = await response.json();
      if (data.success) {
        setSocialConnections(data.connections);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  }, [API_BASE]);

  // Load flows and connections on component mount
  useEffect(() => {
    fetchFlows();
    fetchAnalytics();
    fetchConnections();
  }, [fetchFlows, fetchAnalytics, fetchConnections]);

  // Check for saved flow from FlowBuilder and refresh flows
  useEffect(() => {
    if (location.state?.savedFlow) {
      // Refresh flows from backend after saving
      fetchFlows();
    }
  }, [location.state, fetchFlows]);

  // Social media platforms
  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'var(--error-color)', connected: socialConnections.instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'var(--accent-blue)', connected: socialConnections.facebook },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'var(--info-color)', connected: socialConnections.twitter },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'var(--error-color)', connected: socialConnections.youtube },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'var(--accent-blue)', connected: socialConnections.linkedin }
  ];

  // Platform icons mapping
  const platformIcons = {
    instagram: <Instagram className="platform-icon-svg" />,
    facebook: <Facebook className="platform-icon-svg" />,
    twitter: <Twitter className="platform-icon-svg" />,
    youtube: <Youtube className="platform-icon-svg" />,
    linkedin: <Linkedin className="platform-icon-svg" />
  };

  // Content types
  const contentTypes = [
    { id: 'reels', name: 'Reels', icon: Video },
    { id: 'stories', name: 'Stories', icon: Image },
    { id: 'posts', name: 'Posts', icon: FileText }
  ];

  // Node types for automation workflow
  const nodeTypes = [
    { type: 'social_trigger', label: 'Social Trigger', icon: Zap, color: 'var(--accent-color)', description: 'Trigger on social media activity' },
    { type: 'comment_trigger', label: 'Comment Trigger', icon: MessageCircle, color: 'var(--accent-blue)', description: 'Trigger on user comment' },
    { type: 'follower_check', label: 'Follower Check', icon: Users, color: 'var(--primary-color)', description: 'Check if user follows creator' },
    { type: 'send_message', label: 'Send Message', icon: Send, color: 'var(--error-color)', description: 'Send automated DM' },
    { type: 'delay', label: 'Wait', icon: Clock, color: 'var(--warning-color)', description: 'Add time delay' },
    { type: 'condition', label: 'Condition', icon: GitBranch, color: 'var(--accent-blue)', description: 'Add conditional logic' }
  ];

  // Refs
  const nodeIdCounter = useRef(1);

  // Flow management functions
  const createNewFlow = () => {
    navigate('/FlowBuilder');
  };

  const openFlowBuilder = (flow = null) => {
    navigate('/FlowBuilder', { 
      state: { flow } 
    });
  };

  const toggleConnection = async (platformId) => {
    try {
      const newStatus = !socialConnections[platformId];
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/automation/connections/${platformId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          connect: newStatus,
          // userId inferred from token
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSocialConnections(prev => ({
          ...prev,
          [platformId]: newStatus
        }));
      } else {
        console.error('Failed to update connection:', result.error);
      }
    } catch (error) {
      console.error('Error updating connection:', error);
    }
  };

  const deleteFlow = async (flowId) => {
    try {
      const response = await fetch(`${API_BASE}/api/automation/flows/${flowId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFlows(prev => prev.filter(f => f.id !== flowId));
      } else {
        console.error('Failed to delete flow:', result.error);
      }
    } catch (error) {
      console.error('Error deleting flow:', error);
    }
  };

  const toggleFlow = async (flowId) => {
    try {
      const response = await fetch(`${API_BASE}/api/automation/flows/${flowId}/toggle`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFlows(prev => prev.map(f => 
          f.id === flowId ? result.flow : f
        ));
      } else {
        console.error('Failed to toggle flow:', result.error);
      }
    } catch (error) {
      console.error('Error toggling flow:', error);
    }
  };


  // Filter flows
  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && flow.settings?.isActive) ||
                         (filterStatus === 'inactive' && !flow.settings?.isActive);
    return matchesSearch && matchesFilter;
  });

  // Modern simplified flow card
  const renderFlowCard = (flow) => (
    <div className="modern-flow-card floating-card" key={flow.id} onClick={() => openFlowBuilder(flow)}>
      <div className="card-glow"></div>
      <div className="floating-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
      </div>
      <div className="card-header">
        <div className="flow-icon animated-icon">
          <Rocket size={28} className="icon-bounce" />
          <div className="icon-glow"></div>
        </div>
        <div className="flow-info">
          <h3 className="gradient-text">{flow.name}</h3>
          <p className="shimmer-text">{flow.description}</p>
        </div>
        <div className="status-indicator">
          <Activity size={16} className="pulse-icon" />
        </div>
      </div>
      <div className="flow-stats">
        <div className="stat animated-stat">
          <Flame size={18} className="stat-icon" />
          <span className="stat-value counter-animation">{flow.triggers}</span>
          <span className="stat-label">Triggers</span>
        </div>
        <div className="stat animated-stat">
          <TrendingUp size={18} className="stat-icon" />
          <span className="stat-value counter-animation">{flow.success_rate}%</span>
          <span className="stat-label">Success</span>
        </div>
        <div className="stat animated-stat">
          <Users size={18} className="stat-icon" />
          <span className="stat-value counter-animation">{flow.active_users || 0}</span>
          <span className="stat-label">Users</span>
        </div>
      </div>
      <div className="flow-actions">
        <button className="btn-secondary btn-sm magic-button">
          <Wand2 size={16} className="rotating-icon" />
          <span>Edit</span>
          <div className="button-sparkle"></div>
        </button>
        <button className="btn-ghost btn-sm magic-button">
          <Eye size={16} className="blinking-icon" />
          <span>Analytics</span>
          <div className="button-sparkle"></div>
        </button>
      </div>
    </div>
  );


  return (
    <div className="automation-container">
      {/* Fixed Navigation Bar */}
      <div className="automation-navbar">
        <div className="navbar-left">
          <button 
            className={`nav-item ${activeNavTab === 'connect-social' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('connect-social')}
          >
            <Zap size={16} />
            <span>Connect Social</span>
          </button>
          <button 
            className={`nav-item ${activeNavTab === 'template' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('template')}
          >
            <Wand2 size={16} />
            <span>Template</span>
          </button>
          <button 
            className={`nav-item ${activeNavTab === 'automation-flows' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('automation-flows')}
          >
            <Settings size={16} />
            <span>Automation Flows</span>
          </button>
        </div>
        <div className="navbar-right">
          <button 
            className="btn-create-automation"
            onClick={(e) => {
              e.preventDefault();
              console.log('Create New Automation button clicked');
              navigate('/FlowBuilder');
            }}
          >
            <Sparkles size={18} />
            Create New Automation
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="automation-header">
        <div className="header-left">
          <h1 className="page-title">Social Media Automation</h1>
          <p className="page-subtitle">Automate DMs based on follower status and social activity</p>
        </div>
      </div>

      {/* Content based on active nav tab */}
      {activeNavTab === 'template' && (
        <div className="template-section">
          <h3>Automation Templates</h3>
          <div className="templates-grid">
            <div className="template-card">
              <div className="template-icon">
                <Heart size={24} />
              </div>
              <h4>Welcome New Followers</h4>
              <p>Automatically send a welcome message to new followers</p>
              <button className="btn-secondary">Use Template</button>
            </div>
            <div className="template-card">
              <div className="template-icon">
                <MessageCircle size={24} />
              </div>
              <h4>Comment Responder</h4>
              <p>Auto-reply to comments with personalized messages</p>
              <button className="btn-secondary">Use Template</button>
            </div>
            <div className="template-card">
              <div className="template-icon">
                <Users size={24} />
              </div>
              <h4>Engagement Booster</h4>
              <p>Increase engagement with automated interactions</p>
              <button className="btn-secondary">Use Template</button>
            </div>
          </div>
        </div>
      )}

      {activeNavTab === 'connect-social' && (
        <div className="social-connections">
          <h3>Connect Social Media Platforms</h3>
          <div className="platforms-list">
            {socialPlatforms.map(platform => {
              const IconComponent = platform.icon;
              return (
                <div className="platform-row" key={platform.id}>
                  <div className="platform-left">
                    <div className="platform-icon-wrapper">
                      {platformIcons[platform.id]}
                    </div>
                  </div>
                  <div className="platform-middle">
                    <h4 className="platform-name">{platform.name}</h4>
                  </div>
                  <div className="platform-right">
                    <button 
                      className={`platform-connect-btn ${socialConnections[platform.id] ? 'connected' : 'disconnected'}`}
                      onClick={() => toggleConnection(platform.id)}
                    >
                      {socialConnections[platform.id] ? (
                        <>
                          <Check size={16} />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeNavTab === 'automation-flows' && (
        <div className="automation-content">
          <div className="flows-section">
            <div className="section-header">
              <h3>Your Automation Flows</h3>
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search automations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="flows-grid">
              {filteredFlows.length > 0 ? (
                filteredFlows.map(renderFlowCard)
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Zap size={64} />
                  </div>
                  <h3>No automations yet</h3>
                  <p>Create your first social media automation to get started</p>
                  <button 
                    className="btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Create First Automation button clicked');
                      navigate('/FlowBuilder');
                    }}
                  >
                    <Sparkles size={18} />
                    Create First Automation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}








    </div>
  );
};

export default Automation;