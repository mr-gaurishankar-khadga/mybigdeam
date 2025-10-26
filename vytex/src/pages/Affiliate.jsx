import React, { useState, useEffect, useRef } from 'react';
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
  ShoppingCart,
  Store,
  CreditCard,
  Zap,
  Globe,
  Target,
  Award,
  Link2,
  Calendar,
  Filter,
  X,
  Check
} from 'lucide-react';
import AffiliateContent from './AffiliateContent';
import './Affiliate.css';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

function Affiliate() {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [affiliateLinks, setAffiliateLinks] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, thisMonth: 0, lastMonth: 0 });
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [linkGenerator, setLinkGenerator] = useState({ url: '', platform: '', customAlias: '' });
  const [analytics, setAnalytics] = useState({ clicks: 0, conversions: 0, ctr: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [affiliatePlatforms, setAffiliatePlatforms] = useState([
    {
      id: 'amazon',
      name: 'Amazon Associates',
      description: 'World\'s largest e-commerce affiliate program with millions of products',
      commission: '1-10%',
      popularity: 95,
      color: '#FF9900',
      features: ['Global reach', 'High conversion', 'Trusted brand', '24/7 support'],
      connected: false,
      signupUrl: 'https://affiliate-program.amazon.com/',
      minPayout: '$10',
      category: 'E-commerce'
    },
    {
      id: 'shopify',
      name: 'Shopify Partners',
      description: 'E-commerce platform affiliate program with recurring commissions',
      commission: '$58-2000',
      popularity: 88,
      color: '#7AB55C',
      features: ['Recurring revenue', 'High payouts', 'Growing market', 'Premium support'],
      connected: true,
      signupUrl: 'https://partners.shopify.com/',
      minPayout: '$25',
      category: 'SaaS'
    },
    {
      id: 'clickbank',
      name: 'ClickBank',
      description: 'Digital products marketplace with high commission rates',
      commission: '10-75%',
      popularity: 82,
      color: '#0066CC',
      features: ['High commissions', 'Digital products', 'Global payments', 'Analytics'],
      connected: false,
      signupUrl: 'https://www.clickbank.com/affiliate-network/',
      minPayout: '$10',
      category: 'Digital Products'
    },
    {
      id: 'cj',
      name: 'Commission Junction',
      description: 'Leading affiliate network with premium brands and advertisers',
      commission: '2-20%',
      popularity: 90,
      color: '#E31837',
      features: ['Premium brands', 'Advanced tracking', 'Global network', 'Real-time reporting'],
      connected: false,
      signupUrl: 'https://www.cj.com/affiliates',
      minPayout: '$50',
      category: 'Network'
    },
    {
      id: 'impact',
      name: 'Impact Radius',
      description: 'Enterprise affiliate platform with advanced attribution technology',
      commission: '3-25%',
      popularity: 85,
      color: '#6B46C1',
      features: ['Enterprise brands', 'Advanced attribution', 'Cross-device tracking', 'API access'],
      connected: true,
      signupUrl: 'https://impact.com/affiliates/',
      minPayout: '$25',
      category: 'Enterprise'
    }
  ]);
  
  const linkInputRef = useRef(null);

  // Backend API functions
  const fetchAffiliateData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch earnings
      const earningsRes = await fetch(`${API_BASE_URL}/affiliate/earnings`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const earningsData = await earningsRes.json();
      if (earningsData.success) {
        setEarnings(earningsData.data);
      }
      
      // Fetch links
      const linksRes = await fetch(`${API_BASE_URL}/affiliate/links`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const linksData = await linksRes.json();
      if (linksData.success && Array.isArray(linksData.data?.links)) {
        setAffiliateLinks(linksData.data.links);
      } else if (linksData.success && Array.isArray(linksData.data)) {
        // Fallback for older shape
        setAffiliateLinks(linksData.data);
      } else {
        setAffiliateLinks([]);
      }
      
      // Fetch connected platforms
      const platformsRes = await fetch(`${API_BASE_URL}/affiliate/platforms`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const platformsData = await platformsRes.json();
      if (platformsData.success) {
        setConnectedPlatforms(platformsData.data);
      }
      
      // Fetch analytics
      const analyticsRes = await fetch(`${API_BASE_URL}/affiliate/analytics`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      // Set default values on error
      setAffiliateLinks([]);
      setEarnings({ total: 0, thisMonth: 0, lastMonth: 0 });
      setConnectedPlatforms([]);
      setAnalytics({ clicks: 0, conversions: 0, ctr: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/affiliate/platforms`, {
        headers: {
          ...getAuthHeaders()
        }
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching platforms:', error);
      return [];
    }
  };

  // Platform icons mapping
  const getPlatformIcon = (platformId) => {
    const iconMap = {
      'amazon': ShoppingCart,
      'shopify': Store,
      'clickbank': CreditCard,
      'cj': Globe,
      'impact': Target,
      'rakuten': Award
    };
    return iconMap[platformId] || Link2;
  };

  // Load data on component mount
  useEffect(() => {
    fetchAffiliateData();
    fetchPlatforms().then(setAffiliatePlatforms);
  }, []);

  // API functions for CRUD operations
  const connectPlatform = async (platformId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/affiliate/platforms/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ platformId })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchAffiliateData();
        fetchPlatforms().then(setAffiliatePlatforms);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
    }
  };

  const generateAffiliateLink = async (linkData) => {
    try {
      // Normalize payload for backend compatibility
      const payload = { ...linkData };
      if (!payload.originalUrl && payload.url) {
        payload.originalUrl = payload.url;
        delete payload.url;
      }
      if (payload.originalUrl && !/^https?:\/\//i.test(payload.originalUrl)) {
        payload.originalUrl = `https://${payload.originalUrl}`;
      }

      const response = await fetch(`${API_BASE_URL}/affiliate/links/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setAffiliateLinks(prev => Array.isArray(prev) ? [data.data, ...prev] : [data.data]);
        setShowLinkModal(false);
        setLinkGenerator({ url: '', platform: '', customAlias: '' });
      } else {
        console.error('Generate link failed:', data?.error || 'Unknown error');
        alert(`Failed to generate link: ${data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating link:', error);
      alert(`Error generating link: ${error.message}`);
    }
  };

  const deleteLink = async (linkId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/affiliate/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAffiliateLinks(prev => Array.isArray(prev) ? prev.filter(link => link.id !== linkId) : []);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Prepare props for child component
  const contentProps = {
    activeTab,
    setActiveTab,
    affiliateLinks,
    setAffiliateLinks,
    earnings,
    connectedPlatforms,
    linkGenerator,
    setLinkGenerator,
    analytics,
    searchQuery,
    setSearchQuery,
    showLinkModal,
    setShowLinkModal,
    selectedPlatform,
    setSelectedPlatform,
    affiliatePlatforms,
    linkInputRef,
    getPlatformIcon,
    connectPlatform,
    generateAffiliateLink,
    deleteLink,
    copyToClipboard,
    isLoading
  };

  return (
    <div className="affiliate-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading affiliate data...</p>
        </div>
      )}

      {/* Fixed Navigation Bar - Same as UGC */}
      <div className="affiliate-navbar">
        <div className="navbar-left">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveTab('platforms')}
          >
            <Globe size={16} />
            <span>Platforms</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => setActiveTab('links')}
          >
            <Link2 size={16} />
            <span>My Links</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={16} />
            <span>Analytics</span>
          </button>
        </div>
        <div className="navbar-right">
          <button 
            className="btn-create-content"
            onClick={() => setShowLinkModal(true)}
          >
            <Plus size={18} />
            Generate Link
          </button>
        </div>
      </div>

      <AffiliateContent {...contentProps} />
    </div>
  );
}

export default Affiliate;