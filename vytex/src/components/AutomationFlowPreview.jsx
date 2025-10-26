import React, { useState, useEffect } from 'react';
import './AutomationFlowPreview.css';

const AutomationFlowPreview = ({ flow, onClose, onExecute }) => {
  const [executionStep, setExecutionStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [previewData, setPreviewData] = useState({
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      subscribed: true,
      tags: ['new-user', 'premium']
    },
    cart: {
      value: 75.99,
      items: 3,
      abandoned: true
    }
  });

  const nodeTypes = {
    trigger: { icon: '⚡', color: 'var(--accent-color)' },
    message: { icon: '💬', color: 'var(--accent-blue)' },
    delay: { icon: '⏰', color: 'var(--warning-color)' },
    condition: { icon: '🔀', color: 'var(--primary-color)' },
    action: { icon: '⚙️', color: 'var(--error-color)' },
    default: { icon: '❓', color: 'var(--text-muted)' }
  };

  const simulateExecution = async () => {
    if (!flow || !flow.nodes) return;
    
    setIsPlaying(true);
    setExecutionLog([]);
    setExecutionStep(0);

    const nodes = flow.nodes;
    const edges = flow.edges || [];
    let currentNode = nodes.find(n => n.type === 'trigger');
    let step = 0;

    while (currentNode && step < 10) { // Prevent infinite loops
      const logEntry = {
        step: step + 1,
        nodeId: currentNode.id,
        nodeType: currentNode.type,
        nodeData: currentNode.data,
        timestamp: new Date().toISOString(),
        status: 'executing'
      };

      setExecutionLog(prev => [...prev, logEntry]);
      setExecutionStep(step + 1);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update log entry to completed
      setExecutionLog(prev => prev.map(entry => 
        entry.step === step + 1 ? { ...entry, status: 'completed' } : entry
      ));

      // Find next node
      const nextEdge = edges.find(e => e.source === currentNode.id);
      if (nextEdge) {
        currentNode = nodes.find(n => n.id === nextEdge.target);
      } else {
        currentNode = null;
      }
      
      step++;
    }

    setIsPlaying(false);
  };

  const renderPreviewNode = (node, isActive = false, isCompleted = false) => {
    const nodeType = nodeTypes[node.type] || { icon: '❓', color: '#6b7280' };
    
    return (
      <div 
        key={node.id}
        className={`preview-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
        style={{ borderColor: nodeType.color }}
      >
        <div className="preview-node-header" style={{ backgroundColor: nodeType.color }}>
          <span className="preview-node-icon">{nodeType.icon}</span>
          <span className="preview-node-type">{node.type}</span>
        </div>
        <div className="preview-node-content">
          <div className="preview-node-label">{node.data?.label || node.type}</div>
          {node.type === 'message' && (
            <div className="preview-message-content">
              "{node.data?.content || 'Sample message'}"
            </div>
          )}
          {node.type === 'delay' && (
            <div className="preview-delay-info">
              Wait {node.data?.duration || 1} {node.data?.unit || 'hours'}
            </div>
          )}
          {node.type === 'condition' && (
            <div className="preview-condition-info">
              {node.data?.condition || 'user.property == value'}
            </div>
          )}
        </div>
        {(isActive || isCompleted) && (
          <div className="preview-node-status">
            {isActive && <div className="status-indicator pulsing"></div>}
            {isCompleted && <div className="status-indicator completed">✓</div>}
          </div>
        )}
      </div>
    );
  };

  const getCurrentExecutingNode = () => {
    if (!isPlaying || executionLog.length === 0) return null;
    const currentLog = executionLog[executionLog.length - 1];
    return currentLog?.status === 'executing' ? currentLog.nodeId : null;
  };

  const getCompletedNodes = () => {
    return executionLog
      .filter(log => log.status === 'completed')
      .map(log => log.nodeId);
  };

  return (
    <div className="flow-preview-modal">
      <div className="flow-preview-container">
        <div className="flow-preview-header">
          <div className="preview-header-left">
            <h2>Flow Preview: {flow?.name || 'Untitled Flow'}</h2>
            <p>See how your automation will execute step by step</p>
          </div>
          <div className="preview-header-actions">
            <button 
              className="btn-primary"
              onClick={simulateExecution}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <>
                  <span className="btn-icon">⏸️</span>
                  Running...
                </>
              ) : (
                <>
                  <span className="btn-icon">▶️</span>
                  Run Preview
                </>
              )}
            </button>
            <button className="btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="flow-preview-content">
          {/* Test Data Panel */}
          <div className="preview-test-data">
            <h3>Test Data</h3>
            <div className="test-data-grid">
              <div className="test-data-item">
                <label>User Info</label>
                <div className="test-data-value">
                  {previewData.user.name} ({previewData.user.email})
                </div>
              </div>
              <div className="test-data-item">
                <label>Cart Value</label>
                <div className="test-data-value">
                  ${previewData.cart.value}
                </div>
              </div>
              <div className="test-data-item">
                <label>User Tags</label>
                <div className="test-data-value">
                  {previewData.user.tags.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Flow Visualization */}
          <div className="preview-flow-canvas">
            <div className="preview-nodes-container">
              {flow?.nodes?.map((node, index) => {
                const isActive = getCurrentExecutingNode() === node.id;
                const isCompleted = getCompletedNodes().includes(node.id);
                return renderPreviewNode(node, isActive, isCompleted);
              })}
            </div>
          </div>

          {/* Execution Log */}
          <div className="preview-execution-log">
            <h3>Execution Log</h3>
            <div className="execution-log-container">
              {executionLog.length === 0 ? (
                <div className="log-empty-state">
                  Click "Run Preview" to see execution steps
                </div>
              ) : (
                executionLog.map((log, index) => (
                  <div 
                    key={index}
                    className={`log-entry ${log.status}`}
                  >
                    <div className="log-step">Step {log.step}</div>
                    <div className="log-content">
                      <div className="log-node-type">
                        {nodeTypes[log.nodeType]?.icon} {log.nodeType.toUpperCase()}
                      </div>
                      <div className="log-node-label">{log.nodeData?.label}</div>
                      {log.nodeType === 'message' && (
                        <div className="log-message-preview">
                          Message: "{log.nodeData?.content}"
                        </div>
                      )}
                    </div>
                    <div className="log-status">
                      {log.status === 'executing' ? (
                        <span className="status-executing">⏳ Running...</span>
                      ) : (
                        <span className="status-completed">✅ Completed</span>
                      )}
                    </div>
                    <div className="log-timestamp">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flow-preview-footer">
          <div className="preview-stats">
            <div className="stat">
              <span className="stat-label">Total Steps:</span>
              <span className="stat-value">{flow?.nodes?.length || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Executed:</span>
              <span className="stat-value">{executionLog.filter(l => l.status === 'completed').length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Status:</span>
              <span className={`stat-value ${isPlaying ? 'running' : 'idle'}`}>
                {isPlaying ? 'Running' : 'Ready'}
              </span>
            </div>
          </div>
          <div className="preview-actions">
            <button className="btn-secondary" onClick={() => setExecutionLog([])}>
              Clear Log
            </button>
            <button 
              className="btn-primary"
              onClick={() => onExecute && onExecute(flow)}
            >
              Deploy Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationFlowPreview;
