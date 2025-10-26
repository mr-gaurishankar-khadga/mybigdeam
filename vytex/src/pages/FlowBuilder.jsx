import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Zap,
  MessageCircle,
  Clock,
  GitBranch,
  Settings,
  Trash2,
  Users,
  Send,
  CheckCircle,
  ArrowRight,
  Video,
  Image,
  FileText
} from 'lucide-react';
import './FlowBuilder.css';

const FlowBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flow: initialFlow } = location.state || {};

  // Flow builder state
  const [selectedFlow, setSelectedFlow] = useState(initialFlow || {
    id: Date.now().toString(),
    name: 'Social Media Automation',
    description: 'Automated DM based on follower status',
    nodes: [],
    edges: [],
    settings: { isActive: false },
    stats: { triggered: 0, completed: 0, conversionRate: 0 }
  });
  const [nodes, setNodes] = useState(initialFlow?.nodes || []);
  const [edges, setEdges] = useState(initialFlow?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const canvasRef = useRef(null);

  // Social media platforms
  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', connected: true },
    { id: 'facebook', name: 'Facebook', connected: true },
    { id: 'twitter', name: 'Twitter', connected: false },
    { id: 'youtube', name: 'YouTube', connected: true },
    { id: 'linkedin', name: 'LinkedIn', connected: false }
  ];

  // Content types
  const contentTypes = [
    { id: 'reels', name: 'Reels', icon: Video },
    { id: 'stories', name: 'Stories', icon: Image },
    { id: 'posts', name: 'Posts', icon: FileText }
  ];

  // Node types for automation workflow
  const nodeTypes = [
    { type: 'social_trigger', label: 'Social Trigger', icon: Zap, color: 'var(--accent-color)', description: 'Trigger on social media activity' },
    { type: 'comment_trigger', label: 'Comment Trigger', icon: MessageCircle, color: 'var(--accent-blue)', description: 'Trigger on user comment' },
    { type: 'follower_check', label: 'Follower Check', icon: Users, color: 'var(--primary-color)', description: 'Check if user follows creator' },
    { type: 'send_message', label: 'Send Message', icon: Send, color: 'var(--error-color)', description: 'Send automated DM' },
    { type: 'delay', label: 'Wait', icon: Clock, color: 'var(--warning-color)', description: 'Add time delay' },
    { type: 'condition', label: 'Condition', icon: GitBranch, color: 'var(--accent-blue)', description: 'Add conditional logic' }
  ];

  // Refs
  const nodeIdCounter = useRef(1);

  // Node management functions
  const addNode = (nodeType, position) => {
    const newNode = {
      id: `node_${nodeIdCounter.current++}`,
      type: nodeType,
      position: position || { x: 100 + nodes.length * 150, y: 100 },
      data: {
        label: nodeTypes.find(nt => nt.type === nodeType)?.label || 'Node',
        platform: '',
        contentType: '',
        condition: '',
        message: '',
        duration: 1,
        unit: 'hours'
      }
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
  };

  const updateNode = (nodeId, newData) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
    }
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Connection functions
  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const endConnection = (nodeId) => {
    if (isConnecting && connectionStart && connectionStart !== nodeId) {
      const newEdge = {
        id: `edge_${connectionStart}_${nodeId}`,
        source: connectionStart,
        target: nodeId
      };
      setEdges(prev => [...prev, newEdge]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
  };

  // Drag and drop functions
  const handleDragStart = (e, nodeType) => {
    setDraggedNode(nodeType);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: Math.max(20, e.clientX - rect.left - 90),
      y: Math.max(20, e.clientY - rect.top - 40)
    };

    addNode(draggedNode.type, position);
    setDraggedNode(null);
  };

  const handleNodeMouseDown = (e, nodeId) => {
    if (isConnecting) {
      handleNodeClick(nodeId);
      return;
    }
    
    e.preventDefault();
    setDraggedNode(nodeId);
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.position.x,
      y: e.clientY - rect.top - node.position.y
    });
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!draggedNode || !canvasRef.current) return;
    
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    setNodes(nds => nds.map(n => 
      n.id === draggedNode 
        ? { ...n, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : n
    ));
  }, [draggedNode, dragOffset]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const saveFlow = async () => {
    try {
      const flowData = { 
        ...selectedFlow, 
        nodes, 
        edges,
        // Remove the numeric ID - let backend generate a proper ObjectId
        name: selectedFlow.name || 'Social Media Automation',
        description: selectedFlow.description || 'Automated DM based on follower status'
      };
      
      console.log('Saving flow to backend:', flowData);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/automation/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          flow: flowData,
          userId: 'default_user'
        })
      });
      
      const result = await response.json();
      console.log('Save response:', result);
      
      if (result.success) {
        // Navigate back to automation page
        navigate('/Automation', { 
          state: { 
            savedFlow: result.flow,
            message: result.message || 'Flow saved successfully!' 
          } 
        });
      } else {
        console.error('Failed to save flow:', result.error);
        alert('Failed to save flow: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Error saving flow: ' + error.message);
    }
  };

  const closeFlowBuilder = () => {
    navigate('/Automation');
  };

  return (
    <div className="flow-builder-container">
      <div className="builder-container">
        <div className="builder-header">
          <div className="builder-title">
            <Zap size={24} />
            <h2>Social Media Automation Builder</h2>
          </div>
          <div className="builder-actions">
            <button className="save-btn" onClick={saveFlow}>
              <CheckCircle size={18} />
              Save Automation
            </button>
            <button className="close-btn" onClick={closeFlowBuilder}>
              ✕
            </button>
          </div>
        </div>

        <div className="builder-content">
          {/* Drag & Drop Components */}
          <div className="components-palette">
            <h3>Drag Components to Canvas</h3>
            <div className="palette-grid">
              {nodeTypes.map(nodeType => {
                const IconComponent = nodeType.icon;
                return (
                  <div
                    key={nodeType.type}
                    className="palette-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, nodeType)}
                    style={{ borderColor: nodeType.color }}
                  >
                    <div className="palette-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="palette-content">
                      <span>{nodeType.label}</span>
                      <p>{nodeType.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="canvas-area">
            <div 
              className="flow-canvas"
              ref={canvasRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {nodes.length === 0 ? (
                <div className="canvas-empty">
                  <div className="empty-message">
                    <ArrowRight size={48} />
                    <h3>Drag components here to build your automation</h3>
                    <p>Start with a Social Trigger or Comment Trigger</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Render Nodes */}
                  {nodes.map(node => {
                    const nodeType = nodeTypes.find(nt => nt.type === node.type);
                    const IconComponent = nodeType?.icon || Settings;
                    return (
                      <div
                        key={node.id}
                        className={`canvas-node ${selectedNode?.id === node.id ? 'selected' : ''}`}
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          borderColor: nodeType?.color,
                          cursor: draggedNode === node.id ? 'grabbing' : 'grab'
                        }}
                        onClick={() => setSelectedNode(node)}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      >
                        <div className="node-header" style={{ backgroundColor: nodeType?.color }}>
                          <IconComponent size={16} />
                          <span>{nodeType?.label}</span>
                          <button 
                            className="node-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(node.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="node-body">
                          <div className="node-content">
                            {node.data.label}
                          </div>
                          <div className="node-actions">
                            <button 
                              className="connect-handle"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isConnecting) {
                                  endConnection(node.id);
                                } else {
                                  startConnection(node.id);
                                }
                              }}
                            >
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Render Edges */}
                  <svg className="connections-layer">
                    {edges.map(edge => {
                      const sourceNode = nodes.find(n => n.id === edge.source);
                      const targetNode = nodes.find(n => n.id === edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const x1 = sourceNode.position.x + 150;
                      const y1 = sourceNode.position.y + 40;
                      const x2 = targetNode.position.x;
                      const y2 = targetNode.position.y + 40;

                      return (
                        <line
                          key={edge.id}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="var(--primary-color)"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="var(--primary-color)"
                        />
                      </marker>
                    </defs>
                  </svg>
                </>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          {selectedNode && (
            <div className="properties-panel">
              <h3>Configure Node</h3>
              
              {/* Social Trigger Configuration */}
              {selectedNode.type === 'social_trigger' && (
                <div className="config-section">
                  <label>Select Platform</label>
                  <select
                    value={selectedNode.data.platform || ''}
                    onChange={(e) => updateNode(selectedNode.id, { platform: e.target.value })}
                  >
                    <option value="">Choose platform...</option>
                    {socialPlatforms.filter(p => p.connected).map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>

                  <label>Content Type</label>
                  <div className="content-type-grid">
                    {contentTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          className={`content-type-btn ${selectedNode.data.contentType === type.id ? 'selected' : ''}`}
                          onClick={() => updateNode(selectedNode.id, { contentType: type.id })}
                        >
                          <IconComponent size={16} />
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comment Trigger Configuration */}
              {selectedNode.type === 'comment_trigger' && (
                <div className="config-section">
                  <label>Trigger Keywords</label>
                  <textarea
                    placeholder="Enter keywords that trigger automation (e.g., 'info', 'price', 'details')"
                    value={selectedNode.data.keywords || ''}
                    onChange={(e) => updateNode(selectedNode.id, { keywords: e.target.value })}
                    rows="3"
                  />
                </div>
              )}

              {/* Follower Check Configuration */}
              {selectedNode.type === 'follower_check' && (
                <div className="config-section">
                  <label>Condition</label>
                  <select
                    value={selectedNode.data.condition || 'is_following'}
                    onChange={(e) => updateNode(selectedNode.id, { condition: e.target.value })}
                  >
                    <option value="is_following">User is following</option>
                    <option value="not_following">User is not following</option>
                  </select>
                </div>
              )}

              {/* Send Message Configuration */}
              {selectedNode.type === 'send_message' && (
                <div className="config-section">
                  <label>Message Content</label>
                  <textarea
                    placeholder="Enter the message to send..."
                    value={selectedNode.data.message || ''}
                    onChange={(e) => updateNode(selectedNode.id, { message: e.target.value })}
                    rows="4"
                  />
                  
                  <label>Message Type</label>
                  <select
                    value={selectedNode.data.messageType || 'dm'}
                    onChange={(e) => updateNode(selectedNode.id, { messageType: e.target.value })}
                  >
                    <option value="dm">Direct Message</option>
                    <option value="comment_reply">Comment Reply</option>
                  </select>
                </div>
              )}

              {/* Delay Configuration */}
              {selectedNode.type === 'delay' && (
                <div className="config-section">
                  <label>Wait Duration</label>
                  <div className="delay-config">
                    <input
                      type="number"
                      value={selectedNode.data.duration || 1}
                      onChange={(e) => updateNode(selectedNode.id, { duration: parseInt(e.target.value) })}
                      min="1"
                    />
                    <select
                      value={selectedNode.data.unit || 'hours'}
                      onChange={(e) => updateNode(selectedNode.id, { unit: e.target.value })}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;
