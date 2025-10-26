import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Events.css';
import { 
  Search, Plus, Calendar, MapPin, Users, Clock, Star, Filter, X,
  Globe, Video, User, Eye, Heart, Share2, Bookmark, MoreVertical,
  TrendingUp, BarChart3, Tag, DollarSign, CheckCircle, AlertCircle,
  ChevronDown, Check, Presentation, Briefcase, GraduationCap, Coffee,
  Laptop, Building, Palette, BookOpen, Network, MoreHorizontal, Ticket
} from 'lucide-react';

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

// Custom Dropdown Components
const EventTypeDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  
  const eventTypes = [
    { value: 'webinar', label: 'Webinar', icon: Presentation },
    { value: 'workshop', label: 'Workshop', icon: Users },
    { value: 'conference', label: 'Conference', icon: Briefcase },
    { value: 'meetup', label: 'Meetup', icon: Coffee },
    { value: 'online', label: 'Online Event', icon: Laptop },
    { value: 'offline', label: 'Offline Event', icon: Building }
  ];
  
  const selectedOption = eventTypes.find(opt => opt.value === value);
  
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setHoveredIndex(-1);
  };
  
  return (
    <div className="custom-dropdown">
      <div className={`dropdown-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="dropdown-content">
          {selectedOption ? (
            <div className="selected-option">
              <selectedOption.icon className="option-icon" size={16} />
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="placeholder">Select event type</span>
          )}
        </div>
        <ChevronDown className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} size={16} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {eventTypes.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.value}
                className={`dropdown-option ${hoveredIndex === index ? 'hovered' : ''} ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                <IconComponent className="option-icon" size={16} />
                <span>{option.label}</span>
                {value === option.value && <Check className="check-icon" size={14} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CategoryDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  
  const categories = [
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'technology', label: 'Technology', icon: Laptop },
    { value: 'marketing', label: 'Marketing', icon: TrendingUp },
    { value: 'design', label: 'Design', icon: Palette },
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'networking', label: 'Networking', icon: Network },
    { value: 'other', label: 'Other', icon: MoreHorizontal }
  ];
  
  const selectedOption = categories.find(opt => opt.value === value);
  
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setHoveredIndex(-1);
  };
  
  return (
    <div className="custom-dropdown">
      <div className={`dropdown-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="dropdown-content">
          {selectedOption ? (
            <div className="selected-option">
              <selectedOption.icon className="option-icon" size={16} />
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            <span className="placeholder">Select category</span>
          )}
        </div>
        <ChevronDown className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} size={16} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {categories.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.value}
                className={`dropdown-option ${hoveredIndex === index ? 'hovered' : ''} ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                <IconComponent className="option-icon" size={16} />
                <span>{option.label}</span>
                {value === option.value && <Check className="check-icon" size={14} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CurrencyDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  
  const currencies = [
    { value: 'USD', label: 'USD', icon: DollarSign },
    { value: 'EUR', label: 'EUR', icon: DollarSign },
    { value: 'GBP', label: 'GBP', icon: DollarSign },
    { value: 'INR', label: 'INR', icon: DollarSign }
  ];
  
  const selectedOption = currencies.find(opt => opt.value === value) || currencies[0];
  
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setHoveredIndex(-1);
  };
  
  return (
    <div className="custom-dropdown currency-dropdown">
      <div className={`dropdown-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="dropdown-content">
          <div className="selected-option">
            <selectedOption.icon className="option-icon" size={16} />
            <span>{selectedOption.label}</span>
          </div>
        </div>
        <ChevronDown className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} size={16} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {currencies.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.value}
                className={`dropdown-option ${hoveredIndex === index ? 'hovered' : ''} ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                <IconComponent className="option-icon" size={16} />
                <span>{option.label}</span>
                {value === option.value && <Check className="check-icon" size={14} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Events = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'webinar',
    category: 'business',
    start_date: '',
    end_date: '',
    timezone: 'UTC',
    location: '',
    online_link: '',
    max_attendees: 100,
    price: 0,
    currency: 'USD',
    tags: '',
    requirements: '',
    agenda: '',
    speakers: ''
  });

  // Refs
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Function to load tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/biolinks/tickets');
      setTickets(data.tickets || []);
      setError(null);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to load events
  const fetchEvents = useCallback(async (currentActiveTab, currentFilterType, currentFilterCategory) => {
    try {
      setLoading(true);
      let data;
      
      switch (currentActiveTab) {
        case 'featured':
          data = await apiRequest('/events?featured=true&limit=20');
          break;
        case 'upcoming':
          data = await apiRequest('/events/upcoming?limit=20');
          break;
        case 'my-events':
          data = await apiRequest('/events?organizer=me');
          break;
        case 'registered':
          data = await apiRequest('/events/my-registrations');
          break;
        case 'tickets':
          await fetchTickets();
          return;
        default:
          data = await apiRequest(`/events?type=${currentFilterType}&category=${currentFilterCategory}&status=published`);
      }
      
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [fetchTickets]);

  // Function to load analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await apiRequest('/events/analytics?period=30d');
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalytics({ totalEvents: 0, totalRegistrations: 0, averageAttendees: 0 });
    }
  }, []);

  // Initial data load effect
  useEffect(() => {
    fetchEvents(activeTab, filterType, filterCategory);
    fetchAnalytics();
  }, [activeTab, filterType, filterCategory, fetchEvents, fetchAnalytics]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      fetchEvents(activeTab, filterType, filterCategory);
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiRequest(`/events/search?q=${encodeURIComponent(query)}&type=${filterType}&category=${filterCategory}`);
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error searching events:', err);
      setError('Search failed');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory, activeTab, fetchEvents]);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  // Handle event creation
  const handleCreateEvent = useCallback(async () => {
    if (!eventForm.title.trim() || !eventForm.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    if (!eventForm.start_date || !eventForm.end_date) {
      alert('Please select start and end dates');
      return;
    }

    try {
      setCreating(true);
      
      let coverImageUrl = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_BASE_URL}/events/upload`, {
          method: 'POST',
          headers,
          body: formData
        });
        
        if (!response.ok) throw new Error(`Upload Error: ${response.status}`);
        const uploadResult = await response.json();
        coverImageUrl = uploadResult.url;
      }

      const eventData = {
        ...eventForm,
        cover_image: coverImageUrl,
        tags: eventForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        requirements: eventForm.requirements.split(',').map(req => req.trim()).filter(req => req),
        agenda: eventForm.agenda.split('\n').map(item => ({
          time: item.split(' - ')[0] || '',
          title: item.split(' - ')[1] || item,
          description: '',
          speaker: ''
        })).filter(item => item.title),
        speakers: eventForm.speakers.split('\n').map(speaker => ({
          name: speaker,
          title: '',
          company: '',
          bio: '',
          avatar: ''
        })).filter(speaker => speaker.name)
      };

      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });
      
      // Reset form
      setEventForm({
        title: '',
        description: '',
        event_type: 'webinar',
        category: 'business',
        start_date: '',
        end_date: '',
        timezone: 'UTC',
        location: '',
        online_link: '',
        max_attendees: 100,
        price: 0,
        currency: 'USD',
        tags: '',
        requirements: '',
        agenda: '',
        speakers: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowCreateModal(false);
      
      // Refresh events
      fetchEvents(activeTab, filterType, filterCategory);
      fetchAnalytics();
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Event creation failed');
    } finally {
      setCreating(false);
    }
  }, [selectedFile, eventForm, fetchEvents, fetchAnalytics, activeTab, filterType, filterCategory]);

  // Handle event registration
  const handleRegister = useCallback(async (eventId) => {
    try {
      await apiRequest(`/events/${eventId}/register`, { method: 'POST' });
      
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      alert('Successfully registered for the event!');
      
      // Refresh events to update attendee count
      fetchEvents(activeTab, filterType, filterCategory);
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Registration failed');
    }
  }, [fetchEvents, activeTab, filterType, filterCategory]);

  // Tab configuration
  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
    { id: 'featured', label: 'Featured', icon: Star },
    { id: 'my-events', label: 'My Events', icon: User },
    { id: 'registered', label: 'Registered', icon: CheckCircle },
    { id: 'tickets', label: 'My Tickets', icon: Ticket }
  ];

  const eventTypes = [
    { value: 'all', label: 'All Types', icon: BarChart3 },
    { value: 'webinar', label: 'Webinar', icon: Video },
    { value: 'workshop', label: 'Workshop', icon: Users },
    { value: 'conference', label: 'Conference', icon: Globe },
    { value: 'meetup', label: 'Meetup', icon: MapPin },
    { value: 'online', label: 'Online', icon: Globe },
    { value: 'offline', label: 'Offline', icon: MapPin }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: BarChart3 },
    { value: 'business', label: 'Business', icon: TrendingUp },
    { value: 'technology', label: 'Technology', icon: Globe },
    { value: 'marketing', label: 'Marketing', icon: TrendingUp },
    { value: 'design', label: 'Design', icon: Star },
    { value: 'education', label: 'Education', icon: Users },
    { value: 'networking', label: 'Networking', icon: Users },
    { value: 'other', label: 'Other', icon: Tag }
  ];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Check if event is full
  const isEventFull = (event) => {
    return event.current_attendees >= event.max_attendees;
  };

  // Check if registration is closed
  const isRegistrationClosed = (event) => {
    return new Date() > new Date(event.start_date);
  };

  return (
    <div className="events-container">
      {/* Fixed Navigation Bar */}
      <div className="events-navbar">
        <div className="navbar-left">
          <button 
            className={`nav-item ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Calendar size={16} />
            <span>Upcoming</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            <Star size={16} />
            <span>Featured</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'my-events' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-events')}
          >
            <User size={16} />
            <span>My Events</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            <CheckCircle size={16} />
            <span>Registered</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <Ticket size={16} />
            <span>My Tickets</span>
          </button>
        </div>
        <div className="navbar-right">
          <button 
            className="btn-create-event"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="events-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search events..."
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
                  fetchEvents(activeTab, filterType, filterCategory);
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
                <span>{eventTypes.find(f => f.value === filterType)?.label || 'All Types'}</span>
              </div>
              <div className={`dropdown-arrow ${showFilterDropdown ? 'rotated' : ''}`}>
                <Plus size={16} />
              </div>
            </button>
            {showFilterDropdown && (
              <div className="dropdown-menu">
                {eventTypes.map(filter => {
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

        <div className="filter-container">
          <Tag size={16} />
          <div className="custom-dropdown">
            <button
              className="dropdown-trigger"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <div className="dropdown-content">
                <span>{categories.find(f => f.value === filterCategory)?.label || 'All Categories'}</span>
              </div>
              <div className={`dropdown-arrow ${showCategoryDropdown ? 'rotated' : ''}`}>
                <Plus size={16} />
              </div>
            </button>
            {showCategoryDropdown && (
              <div className="dropdown-menu">
                {categories.map(filter => {
                  const IconComponent = filter.icon;
                  return (
                    <div
                      key={filter.value}
                      className={`dropdown-option ${filterCategory === filter.value ? 'selected' : ''}`}
                      onClick={() => {
                        setFilterCategory(filter.value);
                        setShowCategoryDropdown(false);
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

      {/* Events Grid */}
      <div className="events-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => fetchEvents(activeTab, filterType, filterCategory)}>
              Try Again
            </button>
          </div>
        ) : activeTab === 'tickets' ? (
          tickets.length === 0 ? (
            <div className="empty-state">
              <Ticket size={48} />
              <p>No tickets created yet</p>
              <button onClick={() => window.location.href = '/biolink'}>
                Create Your First Ticket
              </button>
            </div>
          ) : (
            tickets.map((ticket, index) => (
              <div key={ticket._id || index} className="event-card">
                {/* Ticket Header */}
                <div className="event-header">
                  <div className="event-type-badge">
                    {ticket.event_type}
                  </div>
                  <div className="event-actions">
                    <button className="action-btn" title="Share">
                      <Share2 size={16} />
                    </button>
                    <button className="action-btn" title="More">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Ticket Cover */}
                {ticket.cover_image && (
                  <div className="event-cover">
                    <img 
                      src={ticket.cover_image} 
                      alt={ticket.title}
                      className="cover-image"
                    />
                  </div>
                )}

                {/* Ticket Content */}
                <div className="event-content">
                  <h3 className="event-title">{ticket.title}</h3>
                  <p className="event-description">{ticket.description}</p>
                  
                  {/* Ticket Meta */}
                  <div className="event-meta">
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>{formatDate(ticket.event_date)}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{ticket.event_time}</span>
                    </div>
                    {ticket.location && (
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>{ticket.location}</span>
                      </div>
                    )}
                    {ticket.venue && (
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>{ticket.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Ticket Stats */}
                  <div className="event-stats">
                    <div className="stat">
                      <Users size={16} />
                      <span>{ticket.sold_tickets}/{ticket.total_tickets}</span>
                    </div>
                    <div className="stat">
                      <DollarSign size={16} />
                      <span>{formatCurrency(ticket.price, ticket.currency)}</span>
                    </div>
                    <div className="stat">
                      <TrendingUp size={16} />
                      <span>₹{ticket.analytics?.revenue || 0}</span>
                    </div>
                  </div>

                  {/* Ticket Status */}
                  <div className="event-footer">
                    <div className="ticket-status">
                      <span className={`status-badge ${ticket.is_active ? 'active' : 'inactive'}`}>
                        {ticket.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <button className="register-btn">
                      <Ticket size={16} />
                      Manage Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : events.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No events found</p>
            <button onClick={() => setShowCreateModal(true)}>
              Create First Event
            </button>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event._id || index} className="event-card">
              {/* Event Header */}
              <div className="event-header">
                <div className="event-type-badge">
                  {event.event_type}
                </div>
                <div className="event-actions">
                  <button className="action-btn" title="Share">
                    <Share2 size={16} />
                  </button>
                  <button className="action-btn" title="Save">
                    <Bookmark size={16} />
                  </button>
                  <button className="action-btn" title="More">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Event Cover */}
              {event.cover_image && (
                <div className="event-cover">
                  <img 
                    src={event.cover_image} 
                    alt={event.title}
                    className="cover-image"
                  />
                </div>
              )}

              {/* Event Content */}
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>
                
                {/* Event Meta */}
                <div className="event-meta">
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{formatTime(event.start_date)}</span>
                  </div>
                  {event.location && (
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.online_link && (
                    <div className="meta-item">
                      <Globe size={16} />
                      <span>Online</span>
                    </div>
                  )}
                </div>

                {/* Event Stats */}
                <div className="event-stats">
                  <div className="stat">
                    <Users size={16} />
                    <span>{event.current_attendees}/{event.max_attendees}</span>
                  </div>
                  <div className="stat">
                    <DollarSign size={16} />
                    <span>{formatCurrency(event.price, event.currency)}</span>
                  </div>
                  <div className="stat">
                    <Tag size={16} />
                    <span>{event.category}</span>
                  </div>
                </div>

                {/* Event Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="event-tags">
                    {event.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Event Actions */}
                <div className="event-actions-footer">
                  <div className="organizer-info">
                    <img 
                      src={event.organizer_avatar} 
                      alt={event.organizer_name}
                      className="organizer-avatar"
                    />
                    <span className="organizer-name">{event.organizer_name}</span>
                  </div>
                  
                  <button
                    className={`register-btn ${
                      registeredEvents.has(event._id) ? 'registered' : ''
                    } ${
                      isEventFull(event) || isRegistrationClosed(event) ? 'disabled' : ''
                    }`}
                    onClick={() => handleRegister(event._id)}
                    disabled={registeredEvents.has(event._id) || isEventFull(event) || isRegistrationClosed(event)}
                  >
                    {registeredEvents.has(event._id) ? (
                      <>
                        <CheckCircle size={16} />
                        Registered
                      </>
                    ) : isEventFull(event) ? (
                      <>
                        <AlertCircle size={16} />
                        Full
                      </>
                    ) : isRegistrationClosed(event) ? (
                      <>
                        <AlertCircle size={16} />
                        Closed
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Register
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="event-creation-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="event-creation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-creation-header">
              <div className="header-content">
                <div className="header-icon">
                  <Calendar className="icon" size={24} />
                </div>
                <div className="header-text">
                  <h2>Create New Event</h2>
                  <p>Set up your event and start connecting with your audience</p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="event-creation-body">
              <div className="event-form-fields">
                <div className="form-field">
                  <label>Event Title</label>
                  <input
                    type="text"
                    className="event-input"
                    placeholder="Enter your event title..."
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    className="event-textarea"
                    placeholder="Describe what your event is about..."
                    rows="3"
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Event Type</label>
                    <EventTypeDropdown 
                      value={eventForm.event_type}
                      onChange={(value) => setEventForm(prev => ({ ...prev, event_type: value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <CategoryDropdown 
                      value={eventForm.category}
                      onChange={(value) => setEventForm(prev => ({ ...prev, category: value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Start Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="event-input" 
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>End Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="event-input" 
                      value={eventForm.end_date}
                      onChange={(e) => setEventForm(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Location</label>
                  <input
                    type="text"
                    className="event-input"
                    placeholder="Enter event location or 'Online'..."
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Max Attendees</label>
                    <input
                      type="number"
                      className="event-input"
                      placeholder="Unlimited"
                      min="1"
                      value={eventForm.max_attendees}
                      onChange={(e) => setEventForm(prev => ({ ...prev, max_attendees: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>Price</label>
                    <div className="price-input-wrapper">
                      <input
                        type="number"
                        className="event-input price-input"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={eventForm.price}
                        onChange={(e) => setEventForm(prev => ({ ...prev, price: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                      />
                      <CurrencyDropdown 
                        value={eventForm.currency}
                        onChange={(value) => setEventForm(prev => ({ ...prev, currency: value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-field">
                  <label>Tags</label>
                  <input
                    type="text"
                    className="event-input"
                    placeholder="Add tags separated by commas..."
                    value={eventForm.tags}
                    onChange={(e) => setEventForm(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="event-creation-footer">
              <button className="event-cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                className="event-create-btn" 
                onClick={handleCreateEvent}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
