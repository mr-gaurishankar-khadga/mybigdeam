import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus, User, Briefcase, BookOpen, MessageCircle, Info, Folder, Edit, Mail, Globe, Youtube, Twitter, Instagram, Linkedin } from 'lucide-react';
import BioLinkEditPanel from '../subpages/BioLinkEditPanel';
import './BioLink.css';

const BioLink = () => {
  const { subPageId = 'home' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [biolink, setBiolink] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/biolinks/data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setBiolink(data.biolink);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/biolink/editor', { state: { reset: true, new: true } });
  };

  const handleTemplateSelect = (templateId) => {
    // Map picker template IDs to editor theme IDs
    const templateMap = {
      '3d-perspective': 'creative',
      'timeline-story': 'modern',
      'glass-morphism': 'glass'
    };
    const themeId = templateMap[templateId] || templateId;
    // Persist for hard refresh fallback
    localStorage.setItem('selectedTemplate', templateId);
    // Also pass via navigation state to avoid race conditions
    navigate('/biolink/editor', {
      state: {
        template: themeId,
        reset: true,
        new: true
      }
    });
  };

  if (isLoading) {
    return (
      <div className="biolink-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (subPageId === 'editor') {
    const isCreateNew = !!(location?.state?.new || location?.state?.reset);
    const editId = location?.state?.id;
    // If creating new or editing a specific id, let the editor fetch the exact doc
    const biolinkProp = (isCreateNew || editId) ? null : biolink;
    return <BioLinkEditPanel user={user} biolink={biolinkProp} onUpdate={setBiolink} />;
  }

  return (
    <div className="biolink-container">
      <div className="biolink-home">
        {/* Templates */}
        <div className="templates-section">
          <h3>Choose a Template</h3>
          <div className="templates-grid">
            {/* Create New Card */}
            <div className="template-card-create" onClick={handleCreateNew}>
              <div className="template-preview-create">
                <div className="create-plus-circle">
                  <Plus size={48} />
                </div>
                <div className="create-title">Create New</div>
                <div className="create-subtitle">Start from scratch</div>
              </div>
            </div>
            {/* 3D Perspective */}
            <div className="template-card-3d" onClick={() => handleTemplateSelect('3d-perspective')}>
              <div className="template-preview-3d">
                <div className="preview-avatar-3d">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" alt="Profile" />
                </div>
                <div className="preview-name-3d">3D Perspective</div>
                <div className="preview-tagline-3d">Stand out with depth & dimension</div>
                <div className="preview-links-3d">
                  <div className="preview-link-3d">
                    <Briefcase size={20} />
                    <span>My Work</span>
                  </div>
                  <div className="preview-link-3d">
                    <BookOpen size={20} />
                    <span>My Story</span>
                  </div>
                  <div className="preview-link-3d">
                    <MessageCircle size={20} />
                    <span>Get in Touch</span>
                  </div>
                </div>
                <div className="preview-socials-3d">
                  <div className="social-icon-3d">
                    <Linkedin size={16} />
                  </div>
                  <div className="social-icon-3d">
                    <Twitter size={16} />
                  </div>
                  <div className="social-icon-3d">
                    <Mail size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Story */}
            <div className="template-card-timeline" onClick={() => handleTemplateSelect('timeline-story')}>
              <div className="template-preview-timeline">
                <div className="preview-avatar-timeline">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="Profile" />
                </div>
                <div className="preview-name-timeline">Timeline Story</div>
                <div className="preview-tagline-timeline">Tell your story chronologically</div>
                <div className="preview-links-timeline">
                  <div className="preview-link-timeline">
                    <BookOpen size={20} />
                    <span>Full Story</span>
                  </div>
                  <div className="preview-link-timeline">
                    <Mail size={20} />
                    <span>Connect</span>
                  </div>
                </div>
                <div className="preview-socials-timeline">
                  <div className="social-icon-timeline">
                    <Globe size={16} />
                  </div>
                  <div className="social-icon-timeline">
                    <Youtube size={16} />
                  </div>
                  <div className="social-icon-timeline">
                    <Twitter size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Glass Morphism */}
            <div className="template-card-glass" onClick={() => handleTemplateSelect('glass-morphism')}>
              <div className="template-preview-glass">
                <div className="preview-avatar-glass">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" alt="Profile" />
                </div>
                <div className="preview-name-glass">Glass Morphism</div>
                <div className="preview-tagline-glass">Modern transparency with depth</div>
                <div className="preview-links-glass">
                  <div className="preview-link-glass">
                    <Info size={20} />
                    <span>About</span>
                  </div>
                  <div className="preview-link-glass">
                    <Folder size={20} />
                    <span>Projects</span>
                  </div>
                  <div className="preview-link-glass">
                    <Edit size={20} />
                    <span>Blog</span>
                  </div>

                </div>
                <div className="preview-socials-glass">
                  <div className="social-icon-glass">
                    <Twitter size={16} />
                  </div>
                  <div className="social-icon-glass">
                    <Instagram size={16} />
                  </div>
                  <div className="social-icon-glass">
                    <Linkedin size={16} />
                  </div>
                  <div className="social-icon-glass">
                    <Youtube size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mobile-preview-section">
          <h3>Quick Preview</h3>
          <div className="mobile-preview-container">
            <div className="mobile-preview">
              <div className="mobile-header">
                <div className="mobile-avatar">
                  {biolink?.profile?.avatar ? (
                    <img 
                      src={biolink.profile.avatar.startsWith('http') ? biolink.profile.avatar : `${import.meta.env.VITE_BACKEND_URL}${biolink.profile.avatar}`} 
                      alt="Avatar"
                      onError={(e) => {
                        console.error('Avatar preview failed to load:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <h4>{biolink?.profile?.displayName || user?.displayName || user?.username || 'Your Name'}</h4>
                <p>{biolink?.profile?.tagline || 'Your tagline here'}</p>
              </div>
              <div className="mobile-links">
                {biolink?.links?.slice(0, 3).map((link, index) => (
                  <div key={index} className="mobile-link">
                    <span>{link.title || link.platform}</span>
                  </div>
                )) || (
                  <>
                    <div className="mobile-link">
                      <span>Instagram</span>
                    </div>
                    <div className="mobile-link">
                      <span>YouTube</span>
                    </div>
                  </>
                )}
              </div>
              <button className="quick-add-btn" onClick={handleCreateNew}>
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioLink;