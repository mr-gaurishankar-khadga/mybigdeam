import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  BarChart3, 
  Plus, 
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageSquare,
  Download,
  RefreshCw
} from 'lucide-react';
import './Growth.css';

const Growth = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeFilter, setActiveFilter] = useState('all');

  const metrics = [
    {
      title: 'Follower Growth',
      value: '+12.5K',
      change: '+8.2%',
      trend: 'positive',
      icon: Users,
      iconClass: 'followers'
    },
    {
      title: 'Engagement Rate',
      value: '8.9%',
      change: '+2.1%',
      trend: 'positive',
      icon: Target,
      iconClass: 'engagement'
    },
    {
      title: 'Reach Growth',
      value: '+45.2K',
      change: '+15.3%',
      trend: 'positive',
      icon: TrendingUp,
      iconClass: 'reach'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      trend: 'positive',
      icon: BarChart3,
      iconClass: 'conversion'
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Summer Collection Launch',
      description: 'Promote our new summer fashion line with authentic lifestyle content',
      status: 'active',
      progress: 75,
      budget: '$2,500',
      duration: '2 weeks',
      metrics: {
        reach: '450K',
        engagement: '12.5%',
        conversions: '1,240'
      }
    },
    {
      id: 2,
      name: 'Tech Product Review',
      description: 'Honest reviews of our latest tech products by trusted creators',
      status: 'paused',
      progress: 45,
      budget: '$1,800',
      duration: '3 weeks',
      metrics: {
        reach: '320K',
        engagement: '9.1%',
        conversions: '890'
      }
    },
    {
      id: 3,
      name: 'Wellness Campaign',
      description: 'Promote healthy living and wellness products',
      status: 'completed',
      progress: 100,
      budget: '$3,200',
      duration: '4 weeks',
      metrics: {
        reach: '680K',
        engagement: '15.2%',
        conversions: '2,100'
      }
    }
  ];

  const insights = [
    {
      type: 'trend',
      title: 'Video Content Performance',
      description: 'Video content is performing 45% better than static posts. Consider increasing video content production.',
      iconClass: 'trend'
    },
    {
      type: 'opportunity',
      title: 'Untapped Creator Category',
      description: 'Fitness creators show high engagement rates. Consider expanding into this category.',
      iconClass: 'opportunity'
    },
    {
      type: 'alert',
      title: 'Engagement Rate Decline',
      description: 'Recent posts show 12% decline in engagement. Review content strategy.',
      iconClass: 'alert'
    }
  ];

  const goals = [
    {
      id: 1,
      title: 'Reach 100K Followers',
      description: 'Grow our social media following to 100,000 followers',
      completed: false,
      progress: 65
    },
    {
      id: 2,
      title: 'Launch 10 New Campaigns',
      description: 'Create and launch 10 new influencer campaigns',
      completed: false,
      progress: 40
    },
    {
      id: 3,
      title: 'Achieve 10% Engagement Rate',
      description: 'Maintain an average engagement rate of 10% across all platforms',
      completed: true,
      progress: 100
    }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'active';
      case 'paused': return 'paused';
      case 'completed': return 'completed';
      case 'draft': return 'draft';
      default: return 'draft';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={12} />;
      case 'paused': return <Clock size={12} />;
      case 'completed': return <CheckCircle size={12} />;
      case 'draft': return <AlertCircle size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="growth-container">
      <div className="growth-header">
        <h1 className="growth-title">Growth Tools</h1>
        <p className="growth-subtitle">Scale your brand presence and track growth metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="growth-metrics-grid">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="growth-metric-card">
              <div className="growth-metric-header">
                <div className={`growth-metric-icon ${metric.iconClass}`}>
                  <Icon size={24} />
                </div>
                <div className={`growth-metric-trend ${metric.trend}`}>
                  <TrendingUp size={14} />
                  {metric.change}
                </div>
              </div>
              <div className="growth-metric-value">{metric.value}</div>
              <div className="growth-metric-label">{metric.title}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="growth-charts-section">
        <div className="growth-chart-card">
          <div className="growth-chart-header">
            <h3 className="growth-chart-title">Growth Performance</h3>
            <div className="growth-chart-actions">
              <button 
                className={`growth-chart-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`growth-chart-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
              <button 
                className={`growth-chart-btn ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </button>
            </div>
          </div>
          <div className="growth-chart-placeholder">
            <BarChart3 size={48} />
            <span>Growth Chart - {timeRange} view</span>
          </div>
        </div>

        <div className="growth-chart-card">
          <div className="growth-chart-header">
            <h3 className="growth-chart-title">Campaign Performance</h3>
            <div className="growth-chart-actions">
              <button className="growth-chart-btn">
                <Download size={16} />
                <span className="growth-chart-btn-text">Export</span>
              </button>
            </div>
          </div>
          <div className="growth-chart-placeholder">
            <BarChart3 size={48} />
            <span>Campaign Performance Overview</span>
          </div>
        </div>
      </div>

      {/* Campaigns Section */}
      <div className="growth-campaigns-section">
        <div className="growth-campaigns-header">
          <h3 className="growth-campaigns-title">Active Campaigns</h3>
          <div className="growth-campaigns-actions">
            <button className="growth-campaign-btn">
              <Filter size={16} />
              <span className="growth-campaign-btn-text">Filter</span>
            </button>
            <button className="growth-campaign-btn primary">
              <Plus size={16} />
              <span className="growth-campaign-btn-text">New Campaign</span>
            </button>
          </div>
        </div>

        <div className="growth-campaigns-grid">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="growth-campaign-card">
              <div className="growth-campaign-header">
                <h4 className="growth-campaign-name">{campaign.name}</h4>
                <div className={`growth-campaign-status ${getStatusClass(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </div>
              </div>

              <p className="growth-campaign-description">{campaign.description}</p>

              <div className="growth-campaign-metrics">
                <div className="growth-campaign-metric">
                  <div className="growth-campaign-metric-value">{campaign.metrics.reach}</div>
                  <div className="growth-campaign-metric-label">Reach</div>
                </div>
                <div className="growth-campaign-metric">
                  <div className="growth-campaign-metric-value">{campaign.metrics.engagement}</div>
                  <div className="growth-campaign-metric-label">Engagement</div>
                </div>
                <div className="growth-campaign-metric">
                  <div className="growth-campaign-metric-value">{campaign.metrics.conversions}</div>
                  <div className="growth-campaign-metric-label">Conversions</div>
                </div>
              </div>

              <div className="growth-campaign-progress">
                <div className="growth-campaign-progress-header">
                  <span className="growth-campaign-progress-label">Progress</span>
                  <span className="growth-campaign-progress-value">{campaign.progress}%</span>
                </div>
                <div className="growth-campaign-progress-bar">
                  <div 
                    className="growth-campaign-progress-fill"
                    style={{ width: `${campaign.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="growth-campaign-actions">
                <button className="growth-campaign-action-btn">
                  <Eye size={16} />
                  <span className="growth-campaign-action-btn-text">View</span>
                </button>
                <button className="growth-campaign-action-btn primary">
                  <MessageSquare size={16} />
                  <span className="growth-campaign-action-btn-text">Manage</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="growth-insights-section">
        {insights.map((insight, index) => (
          <div key={index} className="growth-insight-card">
            <div className="growth-insight-header">
              <div className={`growth-insight-icon ${insight.iconClass}`}>
                {insight.type === 'trend' && <TrendingUp size={20} />}
                {insight.type === 'opportunity' && <Target size={20} />}
                {insight.type === 'alert' && <AlertCircle size={20} />}
              </div>
              <div className="growth-insight-content">
                <h4 className="growth-insight-title">{insight.title}</h4>
                <p className="growth-insight-description">{insight.description}</p>
              </div>
            </div>
            <div className="growth-insight-actions">
              <button className="growth-insight-btn">
                <span className="growth-insight-btn-text">Learn More</span>
              </button>
              <button className="growth-insight-btn primary">
                <span className="growth-insight-btn-text">Take Action</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Goals Section */}
      <div className="growth-goals-section">
        <div className="growth-goals-header">
          <h3 className="growth-goals-title">Growth Goals</h3>
        </div>
        <div className="growth-goals-list">
          {goals.map((goal) => (
            <div key={goal.id} className="growth-goal-item">
              <div 
                className={`growth-goal-checkbox ${goal.completed ? 'checked' : ''}`}
                onClick={() => {/* Toggle goal completion */}}
              >
                {goal.completed && <CheckCircle size={16} />}
              </div>
              <div className="growth-goal-content">
                <div className="growth-goal-title">{goal.title}</div>
                <div className="growth-goal-description">{goal.description}</div>
              </div>
              <div className="growth-goal-progress">
                <div 
                  className="growth-goal-progress-fill"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Growth; 