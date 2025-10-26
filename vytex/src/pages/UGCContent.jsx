import React, { useState, useEffect, useCallback, useRef } from 'react';
import './UGCContent.css';
import { 
  Search, Upload, Heart, Flag, TrendingUp, Clock, User, Eye, 
  BarChart3, Image, Video, FileText, Plus, Filter, X, MessageCircle,
  Calendar, Tag, MoreVertical, Share2, Bookmark, Sparkles, Settings
} from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// API helper functions with timeout and better error parsing
const apiRequest = async (endpoint, options = {}, timeoutMs = 20000) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    signal: controller.signal,
    ...options
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    if (!response.ok) {
      let details;
      try { details = await response.json(); } catch {}
      const msg = details?.error || details?.message || `API Error: ${response.status}`;
      throw new Error(msg);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API Error:', error);
    throw error.name === 'AbortError' ? new Error('Request timed out') : error;
  }
};

const UGCContent = () => {
  // State management
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [likedContent, setLikedContent] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'image',
    tags: '',
    content_text: ''
  });

  // Refs
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Function to load UGC content
  const fetchContent = useCallback(async (currentActiveTab, currentFilterType) => {
    try {
      setLoading(true);
      let data;
      
      switch (currentActiveTab) {
        case 'trending':
          data = await apiRequest('/ugc/trending?limit=20');
          break;
        case 'recent':
          data = await apiRequest(`/ugc?sort=createdAt&order=desc&type=${currentFilterType}`);
          break;
        case 'liked':
          data = await apiRequest(`/ugc?liked=true&type=${currentFilterType}`);
          break;
        case 'my-content':
          data = await apiRequest(`/ugc?user=me&type=${currentFilterType}`);
          break;
        default:
          data = await apiRequest(`/ugc?type=${currentFilterType}`);
      }
      
      setContent(data);
      setError(null);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to load analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await apiRequest('/ugc/analytics?period=7d');
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalytics(null);
    }
  }, []);

  // Initial data load effect
  useEffect(() => {
    fetchContent(activeTab, filterType);
    fetchAnalytics();
  }, [activeTab, filterType, fetchContent, fetchAnalytics]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      fetchContent(activeTab, filterType);
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiRequest(`/ugc/search?q=${encodeURIComponent(query)}&type=${filterType}`);
      setContent(data);
      setError(null);
    } catch (err) {
      console.error('Error searching content:', err);
      setError('Search failed');
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, activeTab, fetchContent]);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-detect content type
      if (file.type.startsWith('image/')) {
        setUploadForm(prev => ({ ...prev, type: 'image' }));
      } else if (file.type.startsWith('video/')) {
        setUploadForm(prev => ({ ...prev, type: 'video' }));
      }
    }
  }, []);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!uploadForm.title.trim() || !uploadForm.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    if (uploadForm.type !== 'text' && !selectedFile) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      
      let mediaUrl = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // Don't set Content-Type for FormData - let browser set it with boundary
        
        const controller = new AbortController();
        const uploadTimeout = setTimeout(() => controller.abort(), 20000);
        const response = await fetch(`${API_BASE_URL}/ugc/upload`, {
          method: 'POST',
          headers,
          body: formData,
          signal: controller.signal
        });
        clearTimeout(uploadTimeout);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload Error Details:', errorData);
          throw new Error(`Upload Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
        const uploadResult = await response.json();
        mediaUrl = uploadResult.url;
      }

      const contentData = {
        title: uploadForm.title,
        description: uploadForm.description,
        type: uploadForm.type,
        media_url: mediaUrl,
        content_text: uploadForm.content_text,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      // Test the endpoint first
      console.log('Sending UGC data:', contentData);
      
      // Temporarily use test endpoint to debug
      const testResponse = await fetch(`${API_BASE_URL}/ugc/test-real`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contentData)
      });
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error('Test endpoint error:', errorData);
        throw new Error(`Test failed: ${errorData.error || 'Unknown error'}`);
      }
      
      const testResult = await testResponse.json();
      console.log('Test endpoint success:', testResult);
      
      // Now try the real endpoint
      await apiRequest('/ugc', {
        method: 'POST',
        body: JSON.stringify(contentData)
      }, 20000);
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        type: 'image',
        tags: '',
        content_text: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUploadModal(false);
      
      // Refresh content
      fetchContent(activeTab, filterType);
      fetchAnalytics();
    } catch (err) {
      console.error('Error uploading content:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, uploadForm, fetchContent, fetchAnalytics, activeTab, filterType]);

  // Handle like toggle
  const handleLike = useCallback(async (id) => {
    try {
      const result = await apiRequest(`/ugc/${id}/like`, { method: 'POST' });
      
      setContent(prev => prev.map(item => 
        item._id === id ? { ...item, likes: result.likes } : item
      ));
      
      setLikedContent(prev => {
        const newSet = new Set(prev);
        if (result.liked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  }, []);

  // Handle report
  const handleReport = useCallback(async (id, reason) => {
    try {
      await apiRequest(`/ugc/${id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      alert('Content reported successfully');
    } catch (err) {
      console.error('Error reporting content:', err);
      alert('Report failed');
    }
  }, []);

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All', icon: BarChart3 },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'liked', label: 'Liked', icon: Heart },
    { id: 'my-content', label: 'My Content', icon: User }
  ];

  const filterTypes = [
    { value: 'all', label: 'All Types', icon: BarChart3 },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'text', label: 'Text', icon: FileText }
  ];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="ugc-container">
      {/* Fixed Navigation Bar */}
      <div className="ugc-navbar">
        <div className="navbar-left">
          <button 
            className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <BarChart3 size={16} />
            <span>All</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <TrendingUp size={16} />
            <span>Trending</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={16} />
            <span>Recent</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            <Heart size={16} />
            <span>Liked</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'my-content' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-content')}
          >
            <User size={16} />
            <span>My Content</span>
          </button>
        </div>
        <div className="navbar-right">
          <button 
            className="btn-create-content"
            onClick={() => setShowUploadModal(true)}
          >
            <Sparkles size={18} />
            Upload Content
          </button>
        </div>
      </div>


      {/* Controls */}
      <div className="ugc-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => {
                  setSearchQuery('');
                  fetchContent(activeTab, filterType);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="filter-container">
          <Filter size={16} />
          <div className="custom-dropdown">
            <button
              className="dropdown-trigger"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <div className="dropdown-content">
                <span>{filterTypes.find(f => f.value === filterType)?.label || 'All Types'}</span>
              </div>
              <div className={`dropdown-arrow ${showFilterDropdown ? 'rotated' : ''}`}>
                <Plus size={16} />
              </div>
            </button>
            {showFilterDropdown && (
              <div className="dropdown-menu">
                {filterTypes.map(filter => {
                  const IconComponent = filter.icon;
                  return (
                    <div
                      key={filter.value}
                      className={`dropdown-option ${filterType === filter.value ? 'selected' : ''}`}
                      onClick={() => {
                        setFilterType(filter.value);
                        setShowFilterDropdown(false);
                      }}
                    >
                      <IconComponent size={16} />
                      <span>{filter.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="ugc-content">
        <div className="ugc-content-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading content...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => fetchContent(activeTab, filterType)}>
              Try Again
            </button>
          </div>
        ) : content.length === 0 ? (
          <div className="empty-state">
            <BarChart3 size={48} />
            <p>No content found</p>
            <button onClick={() => setShowUploadModal(true)}>
              Create First Content
            </button>
          </div>
        ) : (
          content.map((item, index) => (
            <div key={item._id || index} className="ugc-card">
              {/* Card Header */}
              <div className="card-header">
                <div className="user-info">
                  <img 
                    src={item.user_avatar} 
                    alt={item.user_name}
                    className="user-avatar"
                  />
                  <div className="user-details">
                    <span className="user-name">{item.user_name}</span>
                    <span className="post-date">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleReport(item._id, 'inappropriate')}
                    title="Report"
                  >
                    <Flag size={16} />
                  </button>
                  <button className="action-btn" title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              {item.type !== 'text' && item.media_url && (
                <div className="card-media">
                  {item.type === 'image' ? (
                    <img 
                      src={item.media_url} 
                      alt={item.title}
                      className="media-image"
                    />
                  ) : (
                    <video 
                      src={item.media_url} 
                      className="media-video"
                      controls
                    />
                  )}
                </div>
              )}

              {/* Text Content */}
              {item.type === 'text' && item.content_text && (
                <div className="card-text-content">
                  <p>{item.content_text}</p>
                </div>
              )}

              {/* Card Content */}
              <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="card-tags">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Meta */}
                <div className="card-meta">
                  <div className="meta-stats">
                    <button
                      className={`meta-btn ${likedContent.has(item._id) ? 'liked' : ''}`}
                      onClick={() => handleLike(item._id)}
                    >
                      <Heart size={16} />
                      <span>{formatNumber(item.likes)}</span>
                    </button>
                    <button className="meta-btn">
                      <MessageCircle size={16} />
                      <span>{formatNumber(item.comments)}</span>
                    </button>
                    <button className="meta-btn">
                      <Eye size={16} />
                      <span>{formatNumber(item.views)}</span>
                    </button>
                  </div>
                  <div className="meta-actions">
                    <button className="meta-btn" title="Share">
                      <Share2 size={16} />
                    </button>
                    <button className="meta-btn" title="Save">
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* New Creation Modal */}
      {showUploadModal && (
        <div className="new-creation-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="new-creation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-creation-header">
              <h2>Create New Content</h2>
            </div>

            <div className="new-creation-body">
              {/* Content Type Selection */}
              <div className="content-type-grid">
                <button
                  className={`content-type-card ${uploadForm.type === 'image' ? 'active' : ''}`}
                  onClick={() => setUploadForm(prev => ({ ...prev, type: 'image' }))}
                >
                  <div className="content-type-icon">
                    <Image size={24} />
                  </div>
                  <span>Image</span>
                </button>
                <button
                  className={`content-type-card ${uploadForm.type === 'video' ? 'active' : ''}`}
                  onClick={() => setUploadForm(prev => ({ ...prev, type: 'video' }))}
                >
                  <div className="content-type-icon">
                    <Video size={24} />
                  </div>
                  <span>Video</span>
                </button>
                <button
                  className={`content-type-card ${uploadForm.type === 'text' ? 'active' : ''}`}
                  onClick={() => setUploadForm(prev => ({ ...prev, type: 'text' }))}
                >
                  <div className="content-type-icon">
                    <FileText size={24} />
                  </div>
                  <span>Text</span>
                </button>
              </div>

              {/* Title Input */}
              <div className="form-field">
                <input
                  type="text"
                  className="creation-input"
                  placeholder="Title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Description Textarea */}
              <div className="form-field">
                <textarea
                  className="creation-textarea"
                  placeholder="Description (optional)"
                  rows="4"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Text Content (for text posts) */}
              {uploadForm.type === 'text' && (
                <div className="form-field">
                  <textarea
                    className="creation-textarea"
                    placeholder="Write your content here..."
                    rows="6"
                    value={uploadForm.content_text}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, content_text: e.target.value }))}
                  />
                </div>
              )}

              {/* File Upload Area */}
              {uploadForm.type !== 'text' && (
                <div className="upload-drop-zone" onClick={() => fileInputRef.current?.click()}>
                  {previewUrl ? (
                    <div className="preview-wrapper">
                      {uploadForm.type === 'image' ? (
                        <img src={previewUrl} alt="Preview" className="upload-preview" />
                      ) : (
                        <video src={previewUrl} className="upload-preview" controls />
                      )}
                      <button
                        className="remove-upload"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <div className="upload-icon">
                        <Upload size={24} />
                      </div>
                      <p className="upload-text">Tap to upload</p>
                      <p className="upload-limit">Up to 10MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tags Input */}
              <div className="form-field">
                <input
                  type="text"
                  className="creation-input"
                  placeholder="Add tags, separated by commas"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            </div>

            <div className="new-creation-footer">
              <button
                className="creation-cancel-btn"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="creation-create-btn"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Creating...' : 'Create'}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={uploadForm.type === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UGCContent;