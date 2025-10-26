import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Download, 
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react';
import './Finance.css';

const Finance = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('revenue');

  const overviewData = [
    {
      title: 'Total Revenue',
      value: '$124,580',
      change: '+12.5%',
      trend: 'positive',
      icon: DollarSign,
      iconClass: 'revenue'
    },
    {
      title: 'Total Expenses',
      value: '$45,230',
      change: '+8.2%',
      trend: 'negative',
      icon: TrendingDown,
      iconClass: 'expenses'
    },
    {
      title: 'Net Profit',
      value: '$79,350',
      change: '+15.3%',
      trend: 'positive',
      icon: TrendingUp,
      iconClass: 'profit'
    },
    {
      title: 'Account Balance',
      value: '$24,580',
      change: '+5.1%',
      trend: 'positive',
      icon: CreditCard,
      iconClass: 'balance'
    }
  ];

  const transactions = [
    {
      id: 1,
      type: 'payment',
      description: 'Creator Payment - @sarahjohnson',
      amount: -2500,
      status: 'completed',
      date: '2024-01-15',
      category: 'Creator Payments'
    },
    {
      id: 2,
      type: 'revenue',
      description: 'Campaign Revenue - Summer Collection',
      amount: 15230,
      status: 'completed',
      date: '2024-01-14',
      category: 'Campaign Revenue'
    },
    {
      id: 3,
      type: 'payment',
      description: 'Creator Payment - @techmike',
      amount: -1800,
      status: 'pending',
      date: '2024-01-13',
      category: 'Creator Payments'
    },
    {
      id: 4,
      type: 'revenue',
      description: 'Campaign Revenue - Tech Review',
      amount: 8450,
      status: 'completed',
      date: '2024-01-12',
      category: 'Campaign Revenue'
    },
    {
      id: 5,
      type: 'payment',
      description: 'Platform Fee',
      amount: -450,
      status: 'completed',
      date: '2024-01-11',
      category: 'Platform Fees'
    }
  ];

  const billingData = [
    {
      title: 'Current Plan',
      amount: '$299/month',
      details: [
        { label: 'Plan Type', value: 'Professional' },
        { label: 'Billing Cycle', value: 'Monthly' },
        { label: 'Next Payment', value: 'Feb 15, 2024' }
      ]
    },
    {
      title: 'Usage This Month',
      amount: '$450',
      details: [
        { label: 'Creator Payments', value: '$8,200' },
        { label: 'Platform Fees', value: '$820' },
        { label: 'Additional Services', value: '$150' }
      ]
    }
  ];

  const summaryData = [
    { label: 'Total Campaigns', value: '24' },
    { label: 'Active Creators', value: '15' },
    { label: 'Avg. ROI', value: '247%' },
    { label: 'Success Rate', value: '92%' }
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      case 'processing': return 'processing';
      default: return 'pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <TrendingUp size={12} />;
      case 'pending': return <Calendar size={12} />;
      case 'failed': return <TrendingDown size={12} />;
      case 'processing': return <RefreshCw size={12} />;
      default: return <Calendar size={12} />;
    }
  };

  return (
    <div className="finance-container">
      <div className="finance-header">
        <h1 className="finance-title">Financial Suite</h1>
        <p className="finance-subtitle">Track your revenue, expenses, and financial performance</p>
      </div>

      {/* Overview Grid */}
      <div className="finance-overview-grid">
        {overviewData.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="finance-overview-card">
              <div className="finance-overview-header">
                <div className={`finance-overview-icon ${item.iconClass}`}>
                  <Icon size={24} />
                </div>
                <div className={`finance-overview-trend ${item.trend}`}>
                  <TrendingUp size={14} />
                  {item.change}
                </div>
              </div>
              <div className="finance-overview-value">{item.value}</div>
              <div className="finance-overview-label">{item.title}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="finance-charts-section">
        <div className="finance-chart-card">
          <div className="finance-chart-header">
            <h3 className="finance-chart-title">Financial Overview</h3>
            <div className="finance-chart-actions">
              <button 
                className={`finance-chart-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`finance-chart-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
              <button 
                className={`finance-chart-btn ${timeRange === '90d' ? 'active' : ''}`}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </button>
            </div>
          </div>
          <div className="finance-chart-placeholder">
            <BarChart3 size={48} />
            <span>Financial Chart - {timeRange} view</span>
          </div>
        </div>

        <div className="finance-chart-card">
          <div className="finance-chart-header">
            <h3 className="finance-chart-title">Revenue Breakdown</h3>
            <div className="finance-chart-actions">
              <button 
                className={`finance-chart-btn ${chartType === 'revenue' ? 'active' : ''}`}
                onClick={() => setChartType('revenue')}
              >
                Revenue
              </button>
              <button 
                className={`finance-chart-btn ${chartType === 'expenses' ? 'active' : ''}`}
                onClick={() => setChartType('expenses')}
              >
                Expenses
              </button>
            </div>
          </div>
          <div className="finance-chart-placeholder">
            <PieChart size={48} />
            <span>{chartType === 'revenue' ? 'Revenue' : 'Expenses'} Breakdown</span>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="finance-transactions-section">
        <div className="finance-transactions-header">
          <h3 className="finance-transactions-title">Recent Transactions</h3>
          <div className="finance-transactions-actions">
            <button className="finance-transaction-btn">
              <Filter size={16} />
              <span className="finance-transaction-btn-text">Filter</span>
            </button>
            <button className="finance-transaction-btn">
              <Download size={16} />
              <span className="finance-transaction-btn-text">Export</span>
            </button>
            <button className="finance-transaction-btn primary">
              <Eye size={16} />
              <span className="finance-transaction-btn-text">View All</span>
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="finance-transactions-table-container">
          <table className="finance-transactions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.description}</td>
                  <td>{transaction.category}</td>
                  <td className={`finance-transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </td>
                  <td>
                    <div className={`finance-transaction-status ${getStatusClass(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status}
                    </div>
                  </td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="finance-transactions-mobile">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="finance-transaction-card">
              <div className="finance-transaction-card-header">
                <div className="finance-transaction-card-description">
                  {transaction.description}
                </div>
                <div className={`finance-transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
              <div className="finance-transaction-card-details">
                <div className="finance-transaction-card-category">
                  {transaction.category}
                </div>
                <div className="finance-transaction-card-date">
                  {transaction.date}
                </div>
                <div className={`finance-transaction-status ${getStatusClass(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  {transaction.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Section */}
      <div className="finance-billing-section">
        {billingData.map((item, index) => (
          <div key={index} className="finance-billing-card">
            <div className="finance-billing-header">
              <h4 className="finance-billing-title">{item.title}</h4>
              <div className="finance-billing-amount">{item.amount}</div>
            </div>
            
            <div className="finance-billing-details">
              {item.details.map((detail, detailIndex) => (
                <div key={detailIndex} className="finance-billing-detail">
                  <span className="finance-billing-label">{detail.label}</span>
                  <span className="finance-billing-value">{detail.value}</span>
                </div>
              ))}
            </div>

            <div className="finance-billing-actions">
              <button className="finance-billing-btn">
                <FileText size={16} />
                <span className="finance-billing-btn-text">View Details</span>
              </button>
              <button className="finance-billing-btn primary">
                <CreditCard size={16} />
                <span className="finance-billing-btn-text">Manage</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="finance-summary-section">
        <div className="finance-summary-header">
          <h3 className="finance-summary-title">Financial Summary</h3>
        </div>
        <div className="finance-summary-grid">
          {summaryData.map((item, index) => (
            <div key={index} className="finance-summary-item">
              <div className="finance-summary-value">{item.value}</div>
              <div className="finance-summary-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finance; 