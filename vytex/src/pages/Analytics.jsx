import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Heart, 
  Share2, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('line');

  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,580',
      change: '+12.5%',
      trend: 'positive',
      icon: DollarSign,
      iconClass: 'revenue'
    },
    {
      title: 'Engagement Rate',
      value: '8.2%',
      change: '+2.1%',
      trend: 'positive',
      icon: Heart,
      iconClass: 'engagement'
    },
    {
      title: 'Total Reach',
      value: '2.4M',
      change: '+18.3%',
      trend: 'positive',
      icon: Eye,
      iconClass: 'reach'
    },
    {
      title: 'ROI',
      value: '247%',
      change: '+5.2%',
      trend: 'positive',
      icon: TrendingUp,
      iconClass: 'roi'
    }
  ];

  const recentActivity = [
    {
      type: 'campaign',
      title: 'Summer Collection Campaign',
      description: 'Campaign launched with 5 creators',
      time: '2 hours ago',
      iconClass: 'campaign'
    },
    {
      type: 'creator',
      title: 'New Creator Partnership',
      description: 'Sarah Johnson joined your network',
      time: '4 hours ago',
      iconClass: 'creator'
    },
    {
      type: 'payment',
      title: 'Payment Processed',
      description: '$2,450 paid to @techinfluencer',
      time: '6 hours ago',
      iconClass: 'payment'
    }
  ];

  const performanceData = [
    {
      title: 'Top Performing Campaign',
      value: 'Summer Collection',
      metrics: [
        { label: 'Reach', value: '450K' },
        { label: 'Engagement', value: '12.5%' },
        { label: 'Conversions', value: '1,240' }
      ]
    },
    {
      title: 'Best Creator',
      value: '@techinfluencer',
      metrics: [
        { label: 'Followers', value: '125K' },
        { label: 'Engagement', value: '8.9%' },
        { label: 'ROI', value: '312%' }
      ]
    }
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle">Track your brand performance and creator collaborations</p>
      </div>

      {/* Stats Grid */}
      <div className="analytics-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="analytics-stat-card">
              <div className="analytics-stat-header">
                <div className={`analytics-stat-icon ${stat.iconClass}`}>
                  <Icon size={24} />
                </div>
                <div className={`analytics-stat-trend ${stat.trend}`}>
                  <TrendingUp size={14} />
                  {stat.change}
                </div>
              </div>
              <div className="analytics-stat-value">{stat.value}</div>
              <div className="analytics-stat-label">{stat.title}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="analytics-charts-section">
        <div className="analytics-chart-card">
          <div className="analytics-chart-header">
            <h3 className="analytics-chart-title">Performance Overview</h3>
            <div className="analytics-chart-actions">
              <button 
                className={`analytics-chart-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`analytics-chart-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
              <button 
                className={`analytics-chart-btn ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </button>
            </div>
          </div>
          <div className="analytics-chart-placeholder">
            <BarChart3 size={48} />
            <span>Performance Chart - {timeRange} view</span>
          </div>
        </div>

        <div className="analytics-recent-activity">
          <div className="analytics-activity-header">
            <h3 className="analytics-activity-title">Recent Activity</h3>
            <button className="analytics-chart-btn">
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="analytics-activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="analytics-activity-item">
                <div className={`analytics-activity-icon ${activity.iconClass}`}>
                  {activity.type === 'campaign' && <BarChart3 size={20} />}
                  {activity.type === 'creator' && <Users size={20} />}
                  {activity.type === 'payment' && <DollarSign size={20} />}
                </div>
                <div className="analytics-activity-content">
                  <div className="analytics-activity-title-text">{activity.title}</div>
                  <div className="analytics-activity-description">{activity.description}</div>
                </div>
                <div className="analytics-activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Grid */}
      <div className="analytics-performance-grid">
        {performanceData.map((item, index) => (
          <div key={index} className="analytics-performance-card">
            <div className="analytics-performance-header">
              <h4 className="analytics-performance-title">{item.title}</h4>
              <div className="analytics-performance-value">{item.value}</div>
            </div>
            {item.metrics.map((metric, metricIndex) => (
              <div key={metricIndex} className="analytics-performance-metric">
                <span className="analytics-performance-label">{metric.label}</span>
                <span className="analytics-performance-number">{metric.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;