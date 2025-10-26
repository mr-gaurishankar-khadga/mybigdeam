const express = require('express');
const mongoose = require('mongoose');
const instagramService = require('./services/instagramService');

const router = express.Router();

// Import models
const AutomationFlow = require('./models/AutomationFlow');
const SocialConnection = require('./models/SocialConnection');
const AutomationLog = require('./models/AutomationLog');
const User = require('./models/User');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers['authorization'] || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'gshankar@$%@lsdhglhf';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Automation Engine Class
class AutomationEngine {
  constructor() {
    this.activeFlows = new Map();
    this.processingQueue = [];
    this.isProcessing = false;
  }

  // Initialize automation engine
  async initialize() {
    console.log('🤖 Initializing Automation Engine...');
    await this.loadActiveFlows();
    this.startProcessingLoop();
  }

  // Load active flows from database
  async loadActiveFlows() {
    try {
      const flows = await AutomationFlow.find({ 'settings.isActive': true });
      flows.forEach(flow => {
        this.activeFlows.set(flow._id.toString(), flow);
      });
      console.log(`✅ Loaded ${flows.length} active automation flows`);
    } catch (error) {
      console.error('❌ Error loading active flows:', error);
    }
  }

  // Start processing loop
  startProcessingLoop() {
    setInterval(async () => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        await this.processQueue();
      }
    }, 1000); // Process every second
  }

  // Process automation queue
  async processQueue() {
    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const task = this.processingQueue.shift();
      try {
        await this.executeAutomation(task);
      } catch (error) {
        console.error('❌ Error executing automation:', error);
      }
    }
    
    this.isProcessing = false;
  }

  // Add task to processing queue
  addToQueue(task) {
    this.processingQueue.push(task);
  }

  // Execute automation flow
  async executeAutomation(task) {
    const { flowId, triggerData, userId } = task;
    const flow = this.activeFlows.get(flowId);
    
    if (!flow) {
      console.log(`❌ Flow ${flowId} not found or inactive`);
      return;
    }

    // Create automation log
    const log = await AutomationLog.create({
      flowId,
      userId,
      triggerType: triggerData.type,
      triggerData,
      status: 'running'
    });

    const startTime = Date.now();
    
    try {
      // Find starting node (trigger node)
      const startNode = flow.nodes.find(node => 
        node.type === 'social_trigger' || node.type === 'comment_trigger'
      );
      
      if (!startNode) {
        throw new Error('No trigger node found in flow');
      }

      // Execute flow from start node
      const result = await this.executeNode(startNode, flow, triggerData, userId, log);
      
      // Update log with success
      log.status = 'completed';
      log.result = result;
      log.executionTime = Date.now() - startTime;
      await log.save();

      // Update flow stats
      await this.updateFlowStats(flowId, true);
      
      console.log(`✅ Automation ${flowId} completed successfully`);
      
    } catch (error) {
      // Update log with error
      log.status = 'failed';
      log.error = error.message;
      log.executionTime = Date.now() - startTime;
      await log.save();

      await this.updateFlowStats(flowId, false);
      
      console.error(`❌ Automation ${flowId} failed:`, error.message);
    }
  }

  // Execute individual node
  async executeNode(node, flow, triggerData, userId, log) {
    log.executionPath.push(node.id);
    await log.save();

    let result = null;

    switch (node.type) {
      case 'social_trigger':
        result = await this.handleSocialTrigger(node, triggerData);
        break;
      case 'comment_trigger':
        result = await this.handleCommentTrigger(node, triggerData);
        break;
      case 'follower_check':
        result = await this.handleFollowerCheck(node, triggerData, userId);
        break;
      case 'send_message':
        result = await this.handleSendMessage(node, triggerData, userId);
        break;
      case 'delay':
        result = await this.handleDelay(node);
        break;
      case 'condition':
        result = await this.handleCondition(node, triggerData);
        break;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }

    // Find next node based on edges
    const nextEdge = flow.edges.find(edge => edge.source === node.id);
    if (nextEdge) {
      const nextNode = flow.nodes.find(n => n.id === nextEdge.target);
      if (nextNode) {
        return await this.executeNode(nextNode, flow, triggerData, userId, log);
      }
    }

    return result;
  }

  // Handle social trigger
  async handleSocialTrigger(node, triggerData) {
    const { platform, contentType } = node.data;
    
    // Validate trigger matches node configuration
    if (platform && triggerData.platform !== platform) {
      throw new Error(`Platform mismatch: expected ${platform}, got ${triggerData.platform}`);
    }
    
    if (contentType && triggerData.contentType !== contentType) {
      throw new Error(`Content type mismatch: expected ${contentType}, got ${triggerData.contentType}`);
    }
    
    return { success: true, message: 'Social trigger validated' };
  }

  // Handle comment trigger
  async handleCommentTrigger(node, triggerData) {
    const { keywords } = node.data;
    
    if (!keywords || !triggerData.comment) {
      return { success: false, message: 'No keywords or comment data' };
    }
    
    const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
    const comment = triggerData.comment.toLowerCase();
    
    const hasKeyword = keywordList.some(keyword => comment.includes(keyword));
    
    if (!hasKeyword) {
      throw new Error('Comment does not contain trigger keywords');
    }
    
    return { success: true, message: 'Comment trigger matched' };
  }

  // Handle follower check
  async handleFollowerCheck(node, triggerData, userId) {
    const { condition } = node.data;
    const { platform, fromUserId } = triggerData;
    
    // Get social connection
    const connection = await SocialConnection.findOne({ 
      userId, 
      platform, 
      isConnected: true 
    });
    
    if (!connection) {
      throw new Error(`No active ${platform} connection found`);
    }
    
    // Simulate follower check (in real implementation, use platform APIs)
    const isFollowing = await this.checkIfUserFollows(platform, fromUserId, userId);
    
    const conditionMet = (condition === 'is_following' && isFollowing) || 
                        (condition === 'not_following' && !isFollowing);
    
    if (!conditionMet) {
      throw new Error(`Follower condition not met: ${condition}`);
    }
    
    return { success: true, isFollowing, condition };
  }

  // Handle send message
  async handleSendMessage(node, triggerData, userId) {
    const { message, messageType } = node.data;
    const { platform, fromUserId } = triggerData;
    
    if (!message) {
      throw new Error('No message content specified');
    }
    
    // Get social connection
    const connection = await SocialConnection.findOne({ 
      userId, 
      platform, 
      isConnected: true 
    });
    
    if (!connection) {
      throw new Error(`No active ${platform} connection found`);
    }
    
    // Send message using real API
    const result = await this.sendMessage(platform, fromUserId, message, messageType, userId);
    
    return { success: true, messageSent: true, result };
  }

  // Handle delay
  async handleDelay(node) {
    const { duration, unit } = node.data;
    
    let delayMs = duration * 1000; // default to seconds
    
    switch (unit) {
      case 'minutes':
        delayMs = duration * 60 * 1000;
        break;
      case 'hours':
        delayMs = duration * 60 * 60 * 1000;
        break;
      case 'days':
        delayMs = duration * 24 * 60 * 60 * 1000;
        break;
    }
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    return { success: true, delayed: `${duration} ${unit}` };
  }

  // Handle condition
  async handleCondition(node, triggerData) {
    // Implement custom condition logic based on node configuration
    return { success: true, message: 'Condition passed' };
  }

  // Check if user follows (real Instagram API)
  async checkIfUserFollows(platform, fromUserId, userId) {
    try {
      if (platform !== 'instagram') {
        // For other platforms, use mock for now
        return Math.random() > 0.5;
      }

      // Get Instagram connection with access token
      const connection = await SocialConnection.findOne({
        userId,
        platform: 'instagram',
        isConnected: true
      });

      if (!connection) {
        console.log('⚠️ No Instagram connection found for follower check');
        return false;
      }

      // Check follower status using Instagram API
      const result = await instagramService.checkUserFollows(
        connection.accessToken,
        connection.platformUserId,
        fromUserId
      );

      console.log(`✅ Follower check result: ${result.isFollowing ? 'Following' : 'Not following'}`);
      return result.isFollowing || false;

    } catch (error) {
      console.error('❌ Error checking follower status:', error.message);
      return false;
    }
  }

  // Send message (real Instagram API)
  async sendMessage(platform, toUserId, message, messageType, userId) {
    try {
      if (platform !== 'instagram') {
        // For other platforms, use mock for now
        console.log(`📤 [MOCK] Sending ${messageType} on ${platform} to ${toUserId}: ${message}`);
        return { messageId: `msg_${Date.now()}`, sent: true };
      }

      // Get Instagram connection with access token
      const connection = await SocialConnection.findOne({
        userId,
        platform: 'instagram',
        isConnected: true
      });

      if (!connection) {
        throw new Error('No Instagram connection found');
      }

      // Send DM using Instagram API
      console.log(`📤 Sending Instagram DM to ${toUserId}: ${message}`);
      const result = await instagramService.sendDirectMessage(
        connection.accessToken,
        toUserId,
        message
      );

      return {
        messageId: result.message_id || `msg_${Date.now()}`,
        sent: true,
        platform: 'instagram',
        result
      };

    } catch (error) {
      console.error(`❌ Error sending ${platform} message:`, error.message);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Update flow statistics
  async updateFlowStats(flowId, success) {
    try {
      const flow = await AutomationFlow.findById(flowId);
      if (flow) {
        flow.stats.triggered += 1;
        if (success) {
          flow.stats.completed += 1;
        } else {
          flow.stats.failed += 1;
        }
        flow.stats.conversionRate = (flow.stats.completed / flow.stats.triggered) * 100;
        flow.settings.lastTriggered = new Date();
        await flow.save();
        
        // Update in-memory cache
        this.activeFlows.set(flowId, flow);
      }
    } catch (error) {
      console.error('❌ Error updating flow stats:', error);
    }
  }

  // Trigger automation based on social media activity
  triggerAutomation(triggerData) {
    // Find matching flows
    this.activeFlows.forEach((flow, flowId) => {
      const triggerNode = flow.nodes.find(node => 
        node.type === 'social_trigger' || node.type === 'comment_trigger'
      );
      
      if (triggerNode && this.shouldTriggerFlow(triggerNode, triggerData)) {
        this.addToQueue({
          flowId,
          triggerData,
          userId: flow.userId
        });
      }
    });
  }

  // Check if flow should be triggered
  shouldTriggerFlow(triggerNode, triggerData) {
    if (triggerNode.type === 'social_trigger') {
      return (!triggerNode.data.platform || triggerNode.data.platform === triggerData.platform) &&
             (!triggerNode.data.contentType || triggerNode.data.contentType === triggerData.contentType);
    }
    
    if (triggerNode.type === 'comment_trigger') {
      if (!triggerNode.data.keywords || !triggerData.comment) return false;
      
      const keywords = triggerNode.data.keywords.toLowerCase().split(',').map(k => k.trim());
      const comment = triggerData.comment.toLowerCase();
      
      return keywords.some(keyword => comment.includes(keyword));
    }
    
    return false;
  }
}

// Initialize automation engine
const automationEngine = new AutomationEngine();

// Make automation engine globally accessible for webhooks
global.automationEngine = automationEngine;

// API Routes

// Get all flows for a user
router.get('/flows', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const flows = await AutomationFlow.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`📋 Fetched ${flows.length} flows for user ${userId}`);
    
    res.json({
      success: true,
      flows: flows.map(flow => ({
        id: flow._id,
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes || [],
        edges: flow.edges || [],
        settings: flow.settings || { isActive: false },
        stats: flow.stats || { triggered: 0, completed: 0, conversionRate: 0 },
        triggers: flow.stats?.triggered || 0,
        success_rate: Math.round(flow.stats?.conversionRate || 0),
        active_users: Math.floor(Math.random() * 100),
        createdAt: flow.createdAt || new Date().toISOString()
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching flows:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create or update a flow
router.post('/flows', authenticateToken, async (req, res) => {
  try {
    // Drop the problematic id index if it exists
    try {
      await AutomationFlow.collection.dropIndex('id_1');
      console.log('AutomationFlow - Dropped problematic id_1 index');
    } catch (err) {
      console.log('AutomationFlow - Index id_1 does not exist or already dropped');
    }
    
    const { flow } = req.body;
    const userId = req.userId;
    
    if (!flow) {
      return res.status(400).json({ success: false, error: 'Invalid flow data' });
    }
    
    console.log(`💾 Saving flow: ${flow.name} with ${flow.nodes?.length || 0} nodes and ${flow.edges?.length || 0} edges`);
    
    const flowData = {
      userId,
      name: flow.name || 'Untitled Flow',
      description: flow.description || 'No description',
      nodes: flow.nodes || [],
      edges: flow.edges || [],
      settings: {
        isActive: false,
        triggerCount: 0,
        successCount: 0,
        ...flow.settings
      },
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0,
        conversionRate: 0,
        ...flow.stats
      },
      tags: flow.tags || [],
      category: flow.category || 'general'
    };
    
    let savedFlow;
    if (flow.id && flow.id !== 'new' && flow.id !== 'undefined') {
      // Update existing flow
      try {
        savedFlow = await AutomationFlow.findByIdAndUpdate(
          flow.id,
          flowData,
          { new: true }
        );
        if (!savedFlow) {
          // If flow not found, create new one
          savedFlow = await AutomationFlow.create(flowData);
          console.log(`✅ Created new flow (original not found): ${flow.name}`);
        } else {
          console.log(`✅ Updated existing flow: ${flow.name}`);
        }
      } catch (error) {
        // If ID is invalid, create new flow
        console.log(`⚠️ Invalid flow ID, creating new flow: ${error.message}`);
        savedFlow = await AutomationFlow.create(flowData);
        console.log(`✅ Created new flow: ${flow.name}`);
      }
    } else {
      // Create new flow
      savedFlow = await AutomationFlow.create(flowData);
      console.log(`✅ Created new flow: ${flow.name}`);
    }
    
    // Update in automation engine if active
    if (savedFlow.settings.isActive) {
      automationEngine.activeFlows.set(savedFlow._id.toString(), savedFlow);
    } else {
      automationEngine.activeFlows.delete(savedFlow._id.toString());
    }
    
    res.json({ 
      success: true, 
      flow: savedFlow,
      message: savedFlow._id === flow.id ? 'Flow updated successfully' : 'Flow created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error saving flow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle flow active status
router.patch('/flows/:flowId/toggle', authenticateToken, async (req, res) => {
  try {
    const { flowId } = req.params;
    const userId = req.userId;
    
    const flow = await AutomationFlow.findOne({ _id: flowId, userId });
    if (!flow) {
      return res.status(404).json({ success: false, error: 'Flow not found' });
    }
    
    // Toggle active status
    flow.settings.isActive = !flow.settings.isActive;
    await flow.save();
    
    // Update automation engine
    if (flow.settings.isActive) {
      automationEngine.activeFlows.set(flowId, flow);
    } else {
      automationEngine.activeFlows.delete(flowId);
    }
    
    console.log(`🔄 Toggled flow ${flowId} to ${flow.settings.isActive ? 'active' : 'inactive'}`);
    
    res.json({ success: true, flow });
  } catch (error) {
    console.error('❌ Error toggling flow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a flow
router.delete('/flows/:flowId', authenticateToken, async (req, res) => {
  try {
    const { flowId } = req.params;
    const userId = req.userId;
    
    const flow = await AutomationFlow.findOneAndDelete({ _id: flowId, userId });
    if (!flow) {
      return res.status(404).json({ success: false, error: 'Flow not found' });
    }
    
    // Remove from automation engine
    automationEngine.activeFlows.delete(flowId);
    
    console.log(`🗑️ Deleted flow: ${flowId}`);
    
    res.json({ success: true, message: 'Flow deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting flow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get social connections
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const connections = await SocialConnection.find({ userId });
    
    const connectionStatus = {
      instagram: false,
      facebook: false,
      twitter: false,
      youtube: false,
      linkedin: false,
      tiktok: false,
      snapchat: false,
      pinterest: false
    };
    
    connections.forEach(conn => {
      if (conn.isConnected) {
        connectionStatus[conn.platform] = true;
      }
    });
    
    console.log(`🔗 Fetched connections for user ${userId}:`, connectionStatus);
    
    res.json({ success: true, connections: connectionStatus });
  } catch (error) {
    console.error('❌ Error fetching connections:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect/disconnect social platform
router.post('/connections/:platform', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const { connect, credentials } = req.body;
    const userId = req.userId;
    
    const connectionData = {
      userId,
      platform,
      platformUserId: connect ? `${platform}_${userId}` : null,
      platformUsername: connect ? `user_${userId}` : null,
      accessToken: connect ? `token_${Date.now()}` : null,
      refreshToken: connect ? `refresh_${Date.now()}` : null,
      isConnected: connect,
      lastSync: connect ? new Date() : null,
      permissions: connect ? ['read', 'write'] : [],
      syncStatus: connect ? 'active' : 'inactive',
      profileData: connect ? {
        name: `User ${userId}`,
        username: `user_${userId}`,
        avatar: '/default-avatar.png',
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
        posts: Math.floor(Math.random() * 100),
        verified: false
      } : {}
    };
    
    const connection = await SocialConnection.findOneAndUpdate(
      { userId, platform },
      connectionData,
      { upsert: true, new: true }
    );
    
    console.log(`🔗 ${connect ? 'Connected' : 'Disconnected'} ${platform} for user ${userId}`);
    
    res.json({ success: true, connection });
  } catch (error) {
    console.error('❌ Error updating connection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get automation analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const flows = await AutomationFlow.find({ userId });
    const logs = await AutomationLog.find({ userId }).sort({ createdAt: -1 }).limit(100);
    
    const totalFlows = flows.length;
    const activeFlows = flows.filter(flow => flow.settings?.isActive).length;
    
    const totalExecutions = logs.length;
    const successfulExecutions = logs.filter(log => log.status === 'completed').length;
    const failedExecutions = logs.filter(log => log.status === 'failed').length;
    
    const avgExecutionTime = logs.reduce((sum, log) => sum + (log.executionTime || 0), 0) / totalExecutions || 0;
    
    const analytics = {
      totalFlows,
      activeFlows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      avgExecutionTime: Math.round(avgExecutionTime),
      recentLogs: logs.slice(0, 10)
    };
    
    console.log(`📊 Analytics for user ${userId}:`, analytics);
    
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simulate social media trigger (for testing)
router.post('/trigger', async (req, res) => {
  try {
    const triggerData = req.body;
    
    // Validate trigger data
    if (!triggerData.platform || !triggerData.type) {
      return res.status(400).json({ success: false, error: 'Invalid trigger data' });
    }
    
    // Trigger automation
    automationEngine.triggerAutomation(triggerData);
    
    res.json({ 
      success: true, 
      message: 'Automation triggered successfully',
      triggerData 
    });
  } catch (error) {
    console.error('❌ Error triggering automation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get automation logs
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    const logs = await AutomationLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error('❌ Error fetching logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize automation engine when module loads
automationEngine.initialize().catch(console.error);

module.exports = router;