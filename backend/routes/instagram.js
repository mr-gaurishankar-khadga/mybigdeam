const express = require('express');
const router = express.Router();
const instagramService = require('../services/instagramService');
const SocialConnection = require('../models/SocialConnection');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers['authorization'] || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'gshankar@$%@lsdhglhf';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Step 1: Get Instagram OAuth URL
 * Frontend redirects user to this URL to authorize
 */
router.get('/auth/url', authenticateToken, (req, res) => {
  try {
    const userId = req.userId;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = instagramService.getAuthorizationUrl(state);

    console.log('🔗 Generated Instagram OAuth URL for user:', userId);
    
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Redirect user to this URL to authorize Instagram access'
    });
  } catch (error) {
    console.error('❌ Error generating OAuth URL:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Step 2: OAuth Callback
 * Instagram redirects here after user authorizes
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('❌ Instagram OAuth Error:', error_description);
      return res.redirect(`http://localhost:5173/automate?error=${error}&message=${error_description}`);
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code not provided'
      });
    }

    // Decode state to get userId
    let userId;
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
      userId = decodedState.userId;
    } catch (err) {
      console.error('❌ Invalid state parameter:', err);
      return res.redirect('http://localhost:5173/automate?error=invalid_state');
    }

    // Exchange code for access token
    console.log('🔄 Exchanging authorization code for access token...');
    const tokenData = await instagramService.getAccessToken(code);

    // Get user profile
    const profile = await instagramService.getUserProfile(tokenData.accessToken, tokenData.userId);

    // Save connection to database
    const connectionData = {
      userId: userId,
      platform: 'instagram',
      platformUserId: tokenData.userId,
      platformUsername: profile.username,
      accessToken: tokenData.accessToken,
      refreshToken: null, // Instagram uses long-lived tokens, not refresh tokens
      tokenExpiresAt: new Date(Date.now() + (tokenData.expiresIn * 1000)),
      isConnected: true,
      lastSync: new Date(),
      permissions: ['instagram_basic', 'instagram_manage_messages', 'instagram_manage_comments'],
      syncStatus: 'active',
      profileData: {
        name: profile.username,
        username: profile.username,
        avatar: profile.profile_picture_url || '/default-avatar.png',
        followers: profile.followers_count || 0,
        following: profile.follows_count || 0,
        posts: profile.media_count || 0,
        verified: false,
        accountType: profile.account_type
      }
    };

    const connection = await SocialConnection.findOneAndUpdate(
      { userId, platform: 'instagram' },
      connectionData,
      { upsert: true, new: true }
    );

    console.log('✅ Instagram connected successfully for user:', userId);
    console.log('👤 Instagram Username:', profile.username);
    console.log('📊 Followers:', profile.followers_count);

    // Redirect back to frontend with success
    res.redirect(`http://localhost:5173/automate?connected=instagram&username=${profile.username}`);

  } catch (error) {
    console.error('❌ OAuth Callback Error:', error);
    res.redirect(`http://localhost:5173/automate?error=connection_failed&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Disconnect Instagram account
 */
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    await SocialConnection.findOneAndUpdate(
      { userId, platform: 'instagram' },
      {
        isConnected: false,
        syncStatus: 'inactive',
        accessToken: null,
        refreshToken: null
      }
    );

    console.log('🔌 Instagram disconnected for user:', userId);

    res.json({
      success: true,
      message: 'Instagram account disconnected successfully'
    });
  } catch (error) {
    console.error('❌ Error disconnecting Instagram:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get Instagram connection status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const connection = await SocialConnection.findOne({
      userId,
      platform: 'instagram',
      isConnected: true
    });

    if (!connection) {
      return res.json({
        success: true,
        connected: false,
        message: 'Instagram not connected'
      });
    }

    // Check if token needs refresh (refresh 7 days before expiry)
    const tokenExpiresAt = new Date(connection.tokenExpiresAt);
    const daysUntilExpiry = (tokenExpiresAt - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry < 7 && daysUntilExpiry > 0) {
      try {
        console.log('🔄 Refreshing Instagram access token...');
        const refreshedToken = await instagramService.refreshAccessToken(connection.accessToken);
        
        connection.accessToken = refreshedToken.access_token;
        connection.tokenExpiresAt = new Date(Date.now() + (refreshedToken.expires_in * 1000));
        await connection.save();
        
        console.log('✅ Token refreshed successfully');
      } catch (error) {
        console.error('❌ Token refresh failed:', error.message);
      }
    }

    res.json({
      success: true,
      connected: true,
      profile: connection.profileData,
      expiresAt: connection.tokenExpiresAt,
      daysUntilExpiry: Math.floor(daysUntilExpiry)
    });

  } catch (error) {
    console.error('❌ Error checking Instagram status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Webhook verification endpoint (GET)
 * Meta will call this to verify your webhook
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifiedChallenge = instagramService.verifyWebhook(mode, token, challenge);

  if (verifiedChallenge) {
    console.log('✅ Webhook verified!');
    res.status(200).send(verifiedChallenge);
  } else {
    console.error('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

/**
 * Webhook endpoint (POST)
 * Receives real-time updates from Instagram
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Acknowledge receipt immediately
    res.status(200).send('EVENT_RECEIVED');

    console.log('📨 Instagram webhook received:', JSON.stringify(body, null, 2));

    // Process webhook events
    const events = instagramService.processWebhookEvent(body);

    if (!events || events.length === 0) {
      console.log('⚠️ No processable events in webhook');
      return;
    }

    // Import automation engine to trigger automations
    const AutomationEngine = require('../automate');
    
    // Trigger automations for each event
    for (const event of events) {
      console.log('🎯 Processing Instagram event:', event.type);

      // Find user by platform user ID
      const connection = await SocialConnection.findOne({
        platform: 'instagram',
        platformUserId: event.recipientId || event.userId,
        isConnected: true
      });

      if (!connection) {
        console.log('⚠️ No active connection found for event');
        continue;
      }

      // Prepare trigger data for automation engine
      const triggerData = {
        platform: 'instagram',
        type: event.type,
        fromUserId: event.senderId || event.userId,
        username: event.username,
        timestamp: event.timestamp,
        ...event
      };

      // Add specific data based on event type
      if (event.type === 'comment') {
        triggerData.comment = event.text;
        triggerData.contentType = 'comment';
      } else if (event.type === 'message') {
        triggerData.message = event.message;
        triggerData.contentType = 'dm';
      } else if (event.type === 'mention') {
        triggerData.contentType = 'mention';
      }

      console.log('🚀 Triggering automation with data:', triggerData);

      // Trigger automation (this will be handled by the automation engine)
      // The automation engine will check for matching flows and execute them
      // We'll emit this event to the automation engine
      if (global.automationEngine) {
        global.automationEngine.triggerAutomation(triggerData);
      }
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Still return 200 to prevent Instagram from retrying
    res.status(200).send('ERROR');
  }
});

/**
 * Test endpoint - Send a test DM
 */
router.post('/test/dm', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        error: 'recipientId and message are required'
      });
    }

    const connection = await SocialConnection.findOne({
      userId,
      platform: 'instagram',
      isConnected: true
    });

    if (!connection) {
      return res.status(400).json({
        success: false,
        error: 'Instagram not connected'
      });
    }

    const result = await instagramService.sendDirectMessage(
      connection.accessToken,
      recipientId,
      message
    );

    res.json({
      success: true,
      message: 'DM sent successfully',
      result
    });

  } catch (error) {
    console.error('❌ Error sending test DM:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's recent media posts
 */
router.get('/media', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    const connection = await SocialConnection.findOne({
      userId,
      platform: 'instagram',
      isConnected: true
    });

    if (!connection) {
      return res.status(400).json({
        success: false,
        error: 'Instagram not connected'
      });
    }

    const media = await instagramService.getUserMedia(
      connection.accessToken,
      connection.platformUserId,
      limit
    );

    res.json({
      success: true,
      media
    });

  } catch (error) {
    console.error('❌ Error fetching media:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get insights/analytics
 */
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const connection = await SocialConnection.findOne({
      userId,
      platform: 'instagram',
      isConnected: true
    });

    if (!connection) {
      return res.status(400).json({
        success: false,
        error: 'Instagram not connected'
      });
    }

    const insights = await instagramService.getInsights(
      connection.accessToken,
      connection.platformUserId
    );

    res.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('❌ Error fetching insights:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
