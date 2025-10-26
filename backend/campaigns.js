const express = require('express');

const router = express.Router();

// Import models
const Campaign = require('./models/Campaign');
const CampaignAnalytics = require('./models/CampaignAnalytics');
const mongoose = require('mongoose');

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gshankar@$%@lsdhglhf');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Helper function to get campaigns with filters
async function getCampaigns(query = {}, options = {}) {
  const {
    sort = 'createdAt',
    order = 'desc',
    limit = 20,
    page = 1
  } = options;

  // Build MongoDB query
  let mongoQuery = {};
  
  if (query.status) {
    mongoQuery.status = query.status;
  }

  // Apply sorting
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  // Apply pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const campaigns = await Campaign.find(mongoQuery)
      .populate('userId', 'name username profileImage')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return campaigns;
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Routes

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    const query = { status: status || 'published' };
    const campaigns = await getCampaigns(query, { limit, page });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get all campaigns analytics
router.get('/campaigns/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const userId = req.userId;
    const mongoose = require('mongoose');
    if (!mongoose.isValidObjectId(userId)) {
      return res.json({ totalViews: 0, totalClicks: 0, totalConversions: 0, totalSpend: 0, period });
    }

    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const analytics = await CampaignAnalytics.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$metrics.views' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalConversions: { $sum: '$metrics.conversions' },
          totalSpend: { $sum: '$metrics.spend' }
        }
      }
    ]);
    
    const result = analytics[0] || {
      totalViews: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalSpend: 0
    };
    
    res.json({
      ...result,
      period
    });
  } catch (error) {
    console.error('Error fetching all campaigns analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get single campaign
router.get('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await Campaign.findById(id)
      .populate('userId', 'name username profileImage')
      .lean();
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create new campaign
router.post('/campaigns', authenticateToken, async (req, res) => {
  try {
    // Drop the problematic id index if it exists
    try {
      await Campaign.collection.dropIndex('id_1');
      console.log('Campaigns - Dropped problematic id_1 index');
    } catch (err) {
      console.log('Campaigns - Index id_1 does not exist or already dropped');
    }
    
    const { 
      name,
      title,
      description, 
      start_date, 
      end_date, 
      budget, 
      target_audience,
      targetAudience,
      creative_assets = [],
      platforms = [],
      objectives = [],
      primary_goal,
      campaign_type,
      tags = [],
      budgetAllocation = {},
      targeting = {},
      schedule = {}
    } = req.body;
    const userId = req.userId;
    
    // Handle field name mapping from frontend
    const campaignName = name || title;
    const campaignTargetAudience = targetAudience || target_audience;
    
    // Handle objectives - use primary_goal if objectives not provided
    let campaignObjectives = objectives;
    if (!campaignObjectives || campaignObjectives.length === 0) {
      if (primary_goal) {
        campaignObjectives = [primary_goal];
      } else {
        campaignObjectives = ['awareness']; // default
      }
    }
    
    // Handle platforms - convert from string to array if needed
    let campaignPlatforms = platforms;
    if (typeof platforms === 'string') {
      campaignPlatforms = platforms.split(',').map(p => p.trim()).filter(p => p);
    }
    
    // Handle tags - convert from string to array if needed
    let campaignTags = tags;
    if (typeof tags === 'string') {
      campaignTags = tags.split(',').map(t => t.trim()).filter(t => t);
    }

    const newCampaign = await Campaign.create({
      userId,
      name: campaignName,
      description,
      startDate: start_date,
      endDate: end_date,
      budget: budget || 0,
      targetAudience: campaignTargetAudience,
      creativeAssets: creative_assets,
      platforms: campaignPlatforms,
      objectives: campaignObjectives,
      budgetAllocation,
      targeting,
      schedule
    });
    
    await newCampaign.populate('userId', 'name username profileImage');
    
    res.status(201).json(newCampaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.put('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;
    
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name username profileImage');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Get campaign analytics
router.get('/campaigns/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;
    const userId = req.userId;
    
    // Check if user owns the campaign
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found or access denied' });
    }
    
    const now = new Date();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const analytics = await CampaignAnalytics.find({
      campaignId: id,
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();
    
    res.json({
      campaign_id: id,
      period,
      analytics
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ error: 'Failed to fetch campaign analytics' });
  }
});

// Search campaigns
router.get('/campaigns/search', async (req, res) => {
  try {
    const { q, status, limit = 20 } = req.query;
    
    if (!q) {
      return res.json([]);
    }
    
    let query = { 
      $text: { $search: q },
      status: 'published'
    };
    
    if (status) {
      query.status = status;
    }
    
    const campaigns = await Campaign.find(query)
      .populate('userId', 'name username profileImage')
      .limit(parseInt(limit))
      .lean();
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error searching campaigns:', error);
    res.status(500).json({ error: 'Failed to search campaigns' });
  }
});

// Get user's campaigns
router.get('/campaigns/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { status, limit = 20, page = 1 } = req.query;
    
    let query = { userId };
    if (status) {
      query.status = status;
    }
    
    const campaigns = await getCampaigns(query, { limit, page });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch user campaigns' });
  }
});

// Update campaign status
router.patch('/campaigns/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, userId },
      { status },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign status:', error);
    res.status(500).json({ error: 'Failed to update campaign status' });
  }
});

// Get campaign performance metrics
router.get('/campaigns/:id/metrics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const metrics = {
      views: campaign.metrics.views,
      clicks: campaign.metrics.clicks,
      conversions: campaign.metrics.conversions,
      spend: campaign.metrics.spend,
      impressions: campaign.metrics.impressions,
      reach: campaign.metrics.reach,
      engagement: campaign.metrics.engagement,
      ctr: campaign.metrics.clicks > 0 ? (campaign.metrics.clicks / campaign.metrics.views * 100).toFixed(2) : 0,
      conversionRate: campaign.metrics.clicks > 0 ? (campaign.metrics.conversions / campaign.metrics.clicks * 100).toFixed(2) : 0
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    res.status(500).json({ error: 'Failed to fetch campaign metrics' });
  }
});

module.exports = router;