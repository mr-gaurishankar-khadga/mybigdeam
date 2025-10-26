import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare, 
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import './Collaborations.css';

const Collaborations = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { label: 'Active Collaborations', value: '12' },
    { label: 'Pending Requests', value: '5' },
    { label: 'Completed Deals', value: '28' },
    { label: 'Total Revenue', value: '$45,230' }
  ];

  const collaborations = [
    {
      id: 1,
      creator: {
        name: 'Sarah Johnson',
        handle: '@sarahjohnson',
        avatar: '/src/images/avatar.png',
        followers: '125K',
        engagement: '8.9%',
        category: 'Fashion & Lifestyle'
      },
      campaign: {
        title: 'Summer Collection Launch',
        description: 'Promote our new summer fashion line with authentic lifestyle content',
        budget: '$2,500',
        duration: '2 weeks',
        status: 'active'
      },
      metrics: {
        reach: '450K',
        engagement: '12.5%',
        conversions: '1,240'
      }
    },
    {
      id: 2,
      creator: {
        name: 'Mike Chen',
        handle: '@techmike',
        avatar: '/src/images/avatar.png',
        followers: '89K',
        engagement: '6.2%',
        category: 'Technology'
      },
      campaign: {
        title: 'Product Review Series',
        description: 'Honest reviews of our latest tech products',
        budget: '$1,800',
        duration: '3 weeks',
        status: 'pending'
      },
      metrics: {
        reach: '320K',
        engagement: '9.1%',
        conversions: '890'
      }
    },
    {
      id: 3,
      creator: {
        name: 'Emma Davis',
        handle: '@emmalifestyle',
        avatar: '/src/images/avatar.png',
        followers: '210K',
        engagement: '11.3%',
        category: 'Lifestyle'
      },
      campaign: {
        title: 'Wellness Campaign',
        description: 'Promote healthy living and wellness products',
        budget: '$3,200',
        duration: '4 weeks',
        status: 'completed'
      },
      metrics: {
        reach: '680K',
        engagement: '15.2%',
        conversions: '2,100'
      }
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'active';
      case 'pending': return 'pending';
      case 'completed': return 'completed';
      default: return 'draft';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="collaborations-container">
      <div className="collaborations-header">
        <h1 className="collaborations-title">Collaborations</h1>
        <p className="collaborations-subtitle">Manage your creator partnerships and campaigns</p>
      </div>

      {/* Actions Bar */}
      <div className="collaborations-actions">
        <div className="collaborations-search">
          <Search className="collaborations-search-icon" size={18} />
          <input
            type="text"
            className="collaborations-search-input"
            placeholder="Search creators, campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="collaborations-filters">
          <button 
            className={`collaborations-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <Filter size={16} />
            All
          </button>
          <button 
            className={`collaborations-filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            <CheckCircle size={16} />
            Active
          </button>
          <button 
            className={`collaborations-filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            <Clock size={16} />
            Pending
          </button>
        </div>

        <button className="collaborations-create-btn">
          <Plus size={18} />
          New Collaboration
        </button>
      </div>

      {/* Stats Grid */}
      <div className="collaborations-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="collaborations-stat-card">
            <div className="collaborations-stat-value">{stat.value}</div>
            <div className="collaborations-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Collaborations Grid */}
      <div className="collaborations-grid">
        {collaborations.map((collab) => (
          <div key={collab.id} className="collaborations-card">
            <div className="collaborations-card-header">
              <div className="collaborations-creator-info">
                <div className="collaborations-creator-avatar">
                  <img src={collab.creator.avatar} alt={collab.creator.name} />
                </div>
                <div className="collaborations-creator-details">
                  <h3>{collab.creator.name}</h3>
                  <p>{collab.creator.handle}</p>
                  <div className="collaborations-creator-stats">
                    <div className="collaborations-creator-stat">
                      <Users size={12} />
                      {collab.creator.followers}
                    </div>
                    <div className="collaborations-creator-stat">
                      <TrendingUp size={12} />
                      {collab.creator.engagement}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="collaborations-card-content">
              <h4 className="collaborations-campaign-title">{collab.campaign.title}</h4>
              <p className="collaborations-campaign-description">{collab.campaign.description}</p>
              
              <div className="collaborations-campaign-metrics">
                <div className="collaborations-metric">
                  <div className="collaborations-metric-value">{collab.metrics.reach}</div>
                  <div className="collaborations-metric-label">Reach</div>
                </div>
                <div className="collaborations-metric">
                  <div className="collaborations-metric-value">{collab.metrics.engagement}</div>
                  <div className="collaborations-metric-label">Engagement</div>
                </div>
                <div className="collaborations-metric">
                  <div className="collaborations-metric-value">{collab.metrics.conversions}</div>
                  <div className="collaborations-metric-label">Conversions</div>
                </div>
              </div>

              <div className="collaborations-status">
                {getStatusIcon(collab.campaign.status)}
                <span className={`collaborations-status ${getStatusClass(collab.campaign.status)}`}>
                  {collab.campaign.status}
                </span>
              </div>
            </div>

            <div className="collaborations-card-actions">
              <button className="collaborations-action-btn">
                <Eye size={16} />
                View Details
              </button>
              <button className="collaborations-action-btn primary">
                <MessageSquare size={16} />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {collaborations.length === 0 && (
        <div className="collaborations-empty-state">
          <div className="collaborations-empty-icon">
            <Users size={40} />
          </div>
          <h3 className="collaborations-empty-title">No Collaborations Yet</h3>
          <p className="collaborations-empty-description">
            Start building relationships with creators to grow your brand presence
          </p>
          <button className="collaborations-create-btn">
            <Plus size={18} />
            Create Your First Collaboration
          </button>
        </div>
      )}
    </div>
  );
};

export default Collaborations; 