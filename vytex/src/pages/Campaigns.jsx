import React, { useState, useEffect } from 'react';
import './Campaigns.css';
import { Search, Plus, TrendingUp, BarChart3, DollarSign, Eye, Target, Filter, X, Star, User, Play } from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// API helper functions
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [analytics, setAnalytics] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    campaign_type: 'social_media',
    primary_goal: 'awareness',
    budget: 0,
    start_date: '',
    end_date: '',
    target_audience: '',
    platforms: '',
    tags: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [campaignsData, analyticsData] = await Promise.all([
          apiRequest('/campaigns?status=active&limit=20'),
          apiRequest('/campaigns/analytics?period=30d')
        ]);
        setCampaigns(campaignsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: 'active', label: 'Active', icon: Play },
    { id: 'featured', label: 'Featured', icon: Star },
    { id: 'my-campaigns', label: 'My Campaigns', icon: User }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!campaignForm.title.trim() || !campaignForm.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    if (!campaignForm.start_date || !campaignForm.end_date) {
      alert('Please select start and end dates');
      return;
    }

    try {
      setCreating(true);
      
      const campaignData = {
        ...campaignForm,
        budget: parseFloat(campaignForm.budget) || 0,
        tags: campaignForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        platforms: campaignForm.platforms.split(',').map(platform => platform.trim()).filter(platform => platform)
      };

      await apiRequest('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData)
      });
      
      // Reset form
      setCampaignForm({
        title: '',
        description: '',
        campaign_type: 'social_media',
        primary_goal: 'awareness',
        budget: 0,
        start_date: '',
        end_date: '',
        target_audience: '',
        platforms: '',
        tags: ''
      });
      setShowCreateModal(false);
      
      // Refresh campaigns
      const campaignsData = await apiRequest('/campaigns?status=active&limit=20');
      setCampaigns(campaignsData);
      
      alert('Campaign created successfully!');
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Campaign creation failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="campaigns-container">
      {/* Fixed Navigation Bar */}
      <div className="campaigns-navbar">
        <div className="navbar-left">
          <button 
            className={`nav-item ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <Play size={16} />
            <span>Active</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            <Star size={16} />
            <span>Featured</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'my-campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-campaigns')}
          >
            <User size={16} />
            <span>My Campaigns</span>
          </button>
        </div>
        <div className="navbar-right">
          <button 
            className="btn-create-campaign"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="campaigns-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search campaigns..."
            />
          </div>
        </div>
      </div>

      <div className="campaigns-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading campaigns...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <p>No campaigns found</p>
          </div>
        ) : (
          campaigns.map((campaign, index) => (
            <div key={campaign._id || index} className="campaign-card">
              <div className="campaign-header">
                <div className="campaign-status">
                  <div className="status-indicator" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                  <span className="status-text">{campaign.status}</span>
                </div>
              </div>

              <div className="campaign-content">
                <div className="campaign-type-badge">
                  {campaign.campaign_type?.replace('_', ' ') || 'Campaign'}
                </div>
                
                <h3 className="campaign-title">{campaign.title}</h3>
                <p className="campaign-description">{campaign.description}</p>
                
                <div className="campaign-meta">
                  <div className="meta-item">
                    <DollarSign size={16} />
                    <span>{formatCurrency(campaign.budget || 0)}</span>
                  </div>
                  <div className="meta-item">
                    <Target size={16} />
                    <span>{campaign.primary_goal || 'Awareness'}</span>
                  </div>
                </div>

                <div className="campaign-metrics">
                  <div className="metric">
                    <Eye size={16} />
                    <span>{formatNumber(campaign.metrics?.impressions || 0)}</span>
                    <small>Impressions</small>
                  </div>
                  <div className="metric">
                    <Target size={16} />
                    <span>{formatNumber(campaign.metrics?.conversions || 0)}</span>
                    <small>Conversions</small>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="campaign-creation-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="campaign-creation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="campaign-creation-header">
              <div className="header-content">
                <div className="header-icon">
                  <Target className="icon" size={24} />
                </div>
                <div className="header-text">
                  <h2>Create New Campaign</h2>
                  <p>Set up your marketing campaign and start reaching your audience</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="campaign-creation-body">
              <div className="campaign-form-fields">
                <div className="form-field">
                  <label>Campaign Title</label>
                  <input
                    type="text"
                    className="campaign-input"
                    placeholder="Enter your campaign title..."
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    className="campaign-textarea"
                    placeholder="Describe your campaign goals and strategy..."
                    rows="3"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Campaign Type</label>
                    <select
                      className="campaign-input"
                      value={campaignForm.campaign_type}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, campaign_type: e.target.value }))}
                    >
                      <option value="social_media">Social Media</option>
                      <option value="email_marketing">Email Marketing</option>
                      <option value="content_marketing">Content Marketing</option>
                      <option value="paid_advertising">Paid Advertising</option>
                      <option value="influencer">Influencer Marketing</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Primary Goal</label>
                    <select
                      className="campaign-input"
                      value={campaignForm.primary_goal}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, primary_goal: e.target.value }))}
                    >
                      <option value="awareness">Brand Awareness</option>
                      <option value="conversion">Conversion</option>
                      <option value="engagement">Engagement</option>
                      <option value="traffic">Traffic</option>
                      <option value="sales">Sales</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Start Date</label>
                    <input 
                      type="date" 
                      className="campaign-input" 
                      value={campaignForm.start_date}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>End Date</label>
                    <input 
                      type="date" 
                      className="campaign-input" 
                      value={campaignForm.end_date}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Budget ($)</label>
                  <input
                    type="number"
                    className="campaign-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, budget: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                  />
                </div>
                <div className="form-field">
                  <label>Target Audience</label>
                  <input
                    type="text"
                    className="campaign-input"
                    placeholder="Describe your target audience..."
                    value={campaignForm.target_audience}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, target_audience: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Platforms</label>
                  <input
                    type="text"
                    className="campaign-input"
                    placeholder="Facebook, Instagram, Twitter (separated by commas)..."
                    value={campaignForm.platforms}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, platforms: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Tags</label>
                  <input
                    type="text"
                    className="campaign-input"
                    placeholder="Add tags separated by commas..."
                    value={campaignForm.tags}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="campaign-creation-footer">
              <button className="campaign-cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                className="campaign-create-btn" 
                onClick={handleCreateCampaign}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;