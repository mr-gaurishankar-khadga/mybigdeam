import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  ExternalLink, 
  Copy, 
  Edit, 
  Trash2, 
  Eye,
  X,
  Check,
  ChevronDown,
  Zap
} from 'lucide-react';
import './AffiliateContent.css'

// New Platform Dropdown Component
const PlatformDropdown = ({ value, onChange, platforms, getPlatformIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const connectedPlatforms = platforms.filter(p => p.connected);
  const selectedPlatform = connectedPlatforms.find(p => p.id === value);

  const handleSelect = (platformId) => {
    onChange(platformId);
    setIsOpen(false);
  };

  return (
    <div className="new-platform-dropdown">
      <div 
        className="new-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedPlatform ? (
          <div className="selected-platform">
            {React.createElement(getPlatformIcon(selectedPlatform.id), { size: 16 })}
            <span>{selectedPlatform.name}</span>
          </div>
        ) : (
          <span className="dropdown-placeholder">Choose Platform</span>
        )}
        <ChevronDown className={`dropdown-chevron ${isOpen ? 'open' : ''}`} size={16} />
      </div>
      
      {isOpen && (
        <div className="new-dropdown-options">
          {connectedPlatforms.length > 0 ? (
            connectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                className={`new-dropdown-option ${value === platform.id ? 'selected' : ''}`}
                onClick={() => handleSelect(platform.id)}
              >
                {React.createElement(getPlatformIcon(platform.id), { size: 16 })}
                <span>{platform.name}</span>
                {value === platform.id && <Check size={14} />}
              </div>
            ))
          ) : (
            <div className="no-platforms">
              No connected platforms. Connect platforms first.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function AffiliateContent({
  activeTab,
  setActiveTab,
  affiliateLinks,
  earnings,
  connectedPlatforms,
  linkGenerator,
  setLinkGenerator,
  analytics,
  searchQuery,
  setSearchQuery,
  showLinkModal,
  setShowLinkModal,
  affiliatePlatforms,
  linkInputRef,
  getPlatformIcon,
  connectPlatform,
  generateAffiliateLink,
  deleteLink,
  copyToClipboard
}) {

  const filteredPlatforms = (affiliatePlatforms || []).filter(platform =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    platform.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="affiliate-dashboard">
      <div className="stats-grid">
        <div className="stat-card earnings">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value">${earnings?.total || 0}</div>
            <div className="stat-change positive">+{earnings?.lastMonth > 0 ? ((earnings?.thisMonth - earnings?.lastMonth) / earnings?.lastMonth * 100).toFixed(1) : '0.0'}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-label">This Month</div>
            <div className="stat-value">${earnings?.thisMonth || 0}</div>
            <div className="stat-change positive">+12.5%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <div className="stat-label">Conversions</div>
            <div className="stat-value">{analytics?.conversions || 0}</div>
            <div className="stat-change positive">+8.3%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 />
          </div>
          <div className="stat-content">
            <div className="stat-label">Click Rate</div>
            <div className="stat-value">{analytics?.ctr || 0}%</div>
            <div className="stat-change neutral">-2.1%</div>
          </div>
        </div>
      </div>


    </div>
  );

  const renderPlatforms = () => (
    <div className="platforms-section">
      <div className="section-header">
        <h2>Affiliate Platforms</h2>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search platforms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
      </div>

      <div className="platforms-grid">
        {filteredPlatforms.map((platform) => {
          const IconComponent = getPlatformIcon(platform.id);
          return (
            <div key={platform.id} className="platform-card">
              <div className="platform-header">
                <div className="platform-icon" style={{ backgroundColor: platform.color }}>
                  <IconComponent />
                </div>
                <div className="platform-info">
                  <h3>{platform.name}</h3>
                  <p>{platform.description}</p>
                </div>
                <div className="platform-popularity">
                  <div className="popularity-bar">
                    <div 
                      className="popularity-fill" 
                      style={{ width: `${platform.popularity}%` }}
                    ></div>
                  </div>
                  <span>{platform.popularity}%</span>
                </div>
              </div>

              <div className="platform-details">
                <div className="commission-rate">
                  <span className="label">Commission</span>
                  <span className="value">{platform.commission}</span>
                </div>
                <div className="platform-features">
                  {platform.features?.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>

              <div className="platform-actions">
                {connectedPlatforms.some(cp => cp.id === platform.id) ? (
                  <button className="btn connected" disabled>
                    <Check />
                    Connected
                  </button>
                ) : (
                  <button 
                    className="btn connect" 
                    onClick={() => connectPlatform(platform.id)}
                  >
                    <Plus />
                    Connect
                  </button>
                )}
                <button className="btn secondary" onClick={() => window.open(platform.signupUrl, '_blank')}>
                  <ExternalLink />
                  Learn More
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLinks = () => (
    <div className="links-section">
      <div className="section-header">
        <h2>My Affiliate Links</h2>
        <button className="action-btn primary" onClick={() => setShowLinkModal(true)}>
          <Plus />
          Generate New Link
        </button>
      </div>

      <div className="links-table">
        <div className="table-header">
          <div>Product</div>
          <div>Platform</div>
          <div>URL</div>
          <div>Clicks</div>
          <div>Conversions</div>
          <div>Earnings</div>
          <div>Actions</div>
        </div>
        {Array.isArray(affiliateLinks) && affiliateLinks.map((link) => (
          <div key={link.id} className="table-row">
            <div className="col product">
              <div className="product-info">
                <div className="product-name">{link.title}</div>
                <div className="product-date">{new Date(link.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="col platform">
              <span className="platform-badge">{link.platform}</span>
            </div>
            <div className="col url">
              <div className="url-container">
                <span className="url-text">{link.url}</span>
              </div>
            </div>
            <div className="col clicks">{link.clicks}</div>
            <div className="col conversions">{link.conversions}</div>
            <div className="col earnings">${link.earnings}</div>
            <div className="col actions">
              <button className="action-btn edit">
                <Edit />
              </button>
              <button className="action-btn delete" onClick={() => deleteLink(link.id)}>
                <Trash2 />
              </button>
              <button className="action-btn stats">
                <Eye />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-section">
      <div className="section-header">
        <h2>Analytics Dashboard</h2>
        <div className="date-filter">
          <select className="filter-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Earnings Trend</h3>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[40, 65, 45, 80, 60, 75, 90].map((height, index) => (
                <div 
                  key={index} 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Click Performance</h3>
          <div className="chart-placeholder">
            <div className="chart-line">
              <div className="line-chart">Performance chart placeholder</div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Performing Links</h3>
          <div className="top-links">
            {Array.isArray(affiliateLinks) && affiliateLinks.slice(0, 5).map((link, index) => (
              <div key={link.id} className="top-link-item">
                <div className="rank">#{index + 1}</div>
                <div className="link-details">
                  <div className="link-name">{link.title}</div>
                  <div className="link-earnings">${link.earnings}</div>
                </div>
                <div className="performance-bar">
                  <div 
                    className="performance-fill" 
                    style={{ width: `${Array.isArray(affiliateLinks) && affiliateLinks.length > 0 ? (link.earnings / Math.max(...affiliateLinks.map(l => l.earnings || 0))) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => (
    showLinkModal && (
      <div className="new-modal-overlay" onClick={() => setShowLinkModal(false)}>
        <div className="new-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="new-modal-header">
            <div className="modal-title-section">
              <Zap className="modal-icon" size={20} />
              <h2>Generate Affiliate Link</h2>
            </div>
            <button className="modal-close-btn" onClick={() => setShowLinkModal(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="new-modal-body">
            <div className="new-form-group">
              <label className="new-form-label">Product URL</label>
              <input
                type="url"
                className="new-form-input"
                placeholder="https://example.com/product"
                value={linkGenerator?.url || ''}
                onChange={(e) => setLinkGenerator(prev => ({ ...prev, url: e.target.value }))}
                ref={linkInputRef}
              />
            </div>

            <div className="new-form-group">
              <label className="new-form-label">Platform</label>
              <PlatformDropdown
                value={linkGenerator?.platform || ''}
                onChange={(value) => setLinkGenerator(prev => ({ ...prev, platform: value }))}
                platforms={affiliatePlatforms || []}
                getPlatformIcon={getPlatformIcon}
              />
            </div>

            <div className="new-form-group">
              <label className="new-form-label">Custom Alias (Optional)</label>
              <input
                type="text"
                className="new-form-input"
                placeholder="my-custom-link"
                value={linkGenerator?.customAlias || ''}
                onChange={(e) => setLinkGenerator(prev => ({ ...prev, customAlias: e.target.value }))}
              />
            </div>
          </div>

          <div className="new-modal-footer">
            <button className="new-cancel-btn" onClick={() => setShowLinkModal(false)}>
              Cancel
            </button>
            <button 
              className="new-generate-btn" 
              onClick={() => {
                const selected = (affiliatePlatforms || []).find(p => p.id === linkGenerator?.platform);
                if (!selected || !selected.connected) {
                  alert('Please connect this platform first from the Platforms tab.');
                  return;
                }
                generateAffiliateLink({
                  originalUrl: linkGenerator?.url || '',
                  platform: selected ? selected.name : linkGenerator?.platform || '',
                  customAlias: linkGenerator?.customAlias || '',
                  product: `Link for ${selected ? selected.name : (linkGenerator?.platform || 'Unknown')}`
                })
              }}
              disabled={!linkGenerator?.url || !linkGenerator?.platform}
            >
              <Zap size={16} />
              Generate Link
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="affiliate-content">
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'platforms' && renderPlatforms()}
      {activeTab === 'links' && renderLinks()}
      {activeTab === 'analytics' && renderAnalytics()}
      {renderModal()}
    </div>
  );
}

export default AffiliateContent;