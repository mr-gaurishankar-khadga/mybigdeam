const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');

const router = express.Router();

// Import models
const AffiliateLink = require('./models/AffiliateLink');
const AffiliatePlatform = require('./models/AffiliatePlatform');
const AffiliateAnalytics = require('./models/AffiliateAnalytics');
const User = require('./models/User');

// Import centralized auth middleware
const { authenticateToken } = require('./middleware/auth');

// Helper functions
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}




function generateTrackingParams(platform, userId = 'vytex_user') {
  
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  
  const trackingMap = {
    amazon: { tag: `vytex-${userId}-20`, linkCode: 'ur2', creative: '6738', creativeASIN: random },
    shopify: { ref: `vytex-${userId}`, utm_source: 'vytex', utm_campaign: `aff-${timestamp}` },
    clickbank: { hop: `vytex${userId}`, tid: random, aid: 'vytex' },
    cj: { PID: `vytex_${userId}`, SID: timestamp, CJSKU: random },
    impact: { irclickid: `vytex_${random}`, irgwc: '1', subId1: userId, subId2: timestamp }
  };
  
  return trackingMap[platform] || {};
}

function generateShortUrl(originalUrl, customAlias = null) {
  const baseUrl = 'https://vytex.link/';
  const shortCode = customAlias || crypto.randomBytes(4).toString('hex');
  return baseUrl + shortCode;
}

// Affiliate Platforms Configuration
const AFFILIATE_PLATFORMS = {
  amazon: {
    id: 'amazon',
    name: 'Amazon Associates',
    apiEndpoint: 'https://webservices.amazon.com/paapi5',
    authRequired: true,
    commissionRange: '1-10%',
    features: ['Product API', 'Native Ads', 'Link Builder'],
    trackingParams: ['tag', 'linkCode', 'creative', 'creativeASIN']
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify Collabs',
    apiEndpoint: 'https://partners.shopify.com/api',
    authRequired: true,
    commissionRange: '200%',
    features: ['Auto Payouts', 'Brand Discovery', 'No Approval'],
    trackingParams: ['ref', 'utm_source', 'utm_campaign']
  },
  clickbank: {
    id: 'clickbank',
    name: 'ClickBank',
    apiEndpoint: 'https://api.clickbank.com',
    authRequired: true,
    commissionRange: '5-75%',
    features: ['High Commissions', 'Digital Products', 'Global Reach'],
    trackingParams: ['hop', 'tid', 'aid']
  },
  cj: {
    id: 'cj',
    name: 'CJ Affiliate',
    apiEndpoint: 'https://api.cj.com',
    authRequired: true,
    commissionRange: '2-20%',
    features: ['Premium Brands', 'API Access', 'Advanced Tracking'],
    trackingParams: ['PID', 'SID', 'CJSKU']
  },
  impact: {
    id: 'impact',
    name: 'Impact',
    apiEndpoint: 'https://api.impact.com',
    authRequired: true,
    commissionRange: '3-25%',
    features: ['Mobile Optimization', 'Automation', 'Real-time Data'],
    trackingParams: ['irclickid', 'irgwc', 'subId1', 'subId2']
  },
  rakuten: {
    id: 'rakuten',
    name: 'Rakuten Advertising',
    apiEndpoint: 'https://api.rakutenadvertising.com',
    authRequired: true,
    commissionRange: '2-15%',
    features: ['25K+ Advertisers', 'Audience Engine', 'Journey Tracking'],
    trackingParams: ['ranMID', 'ranEAID', 'ranSiteID']
  },
  awin: {
    id: 'awin',
    name: 'AWIN',
    apiEndpoint: 'https://api.awin.com',
    authRequired: true,
    commissionRange: '1-30%',
    features: ['25K+ Brands', 'Easy Navigation', 'Custom Links'],
    trackingParams: ['p', 'a', 'r', 'clickref']
  },
  flexoffers: {
    id: 'flexoffers',
    name: 'FlexOffers',
    apiEndpoint: 'https://api.flexoffers.com',
    authRequired: true,
    commissionRange: '2-50%',
    features: ['10K+ Advertisers', 'Big Brands', 'Multiple Networks'],
    trackingParams: ['fobs', 'foc', 'fot', 'fos']
  }
};

// Middleware for request logging
router.use((req, res, next) => {
  console.log(`[Affiliate API] ${req.method} ${req.path}`, req.body || req.query);
  next();
});

// GET /api/affiliate/dashboard - Get dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get affiliate links
    const links = await AffiliateLink.find({ userId }).sort({ createdAt: -1 });
    
    // Get analytics
    const analytics = await AffiliateAnalytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$metrics.totalClicks' },
          totalConversions: { $sum: '$metrics.totalConversions' },
          totalEarnings: { $sum: '$metrics.totalEarnings' }
        }
      }
    ]);

    const dashboardData = {
      stats: {
        totalEarnings: analytics[0]?.totalEarnings || 0,
        thisMonth: 0, // Calculate from date range
        lastMonth: 0,
        totalClicks: analytics[0]?.totalClicks || 0,
        totalConversions: analytics[0]?.totalConversions || 0,
        conversionRate: analytics[0]?.totalClicks > 0 ? 
          ((analytics[0]?.totalConversions / analytics[0]?.totalClicks) * 100).toFixed(2) : 0,
        totalLinks: links.length,
        activeLinks: links.filter(link => link.status === 'active').length
      },
      recentLinks: links.slice(0, 5).map(link => ({
        id: link._id,
        product: link.product,
        platform: link.platform,
        shortUrl: link.shortUrl,
        clicks: link.clicks || 0,
        conversions: link.conversions || 0,
        earnings: link.earnings || 0,
        created: link.createdAt
      })),
      topPerformers: links
        .sort((a, b) => (b.earnings || 0) - (a.earnings || 0))
        .slice(0, 5)
        .map(link => ({
          id: link._id,
          product: link.product,
          platform: link.platform,
          earnings: link.earnings || 0,
          clicks: link.clicks || 0,
          conversions: link.conversions || 0
        }))
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard data' });
  }
});

// GET /api/affiliate/platforms - Get available platforms
router.get('/platforms', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get connected platforms
    const connectedPlatforms = await AffiliatePlatform.find({ userId, isConnected: true });
    const connectedIds = connectedPlatforms.map(cp => cp.platformId);
    
    const platforms = Object.values(AFFILIATE_PLATFORMS).map(platform => ({
      ...platform,
      connected: connectedIds.includes(platform.id),
      popularity: Math.floor(Math.random() * 30) + 70 // Simulated popularity
    }));

    res.json({ success: true, data: platforms });
  } catch (error) {
    console.error('Platforms error:', error);
    res.status(500).json({ success: false, error: 'Failed to load platforms' });
  }
});

// POST /api/affiliate/platforms/connect - Connect to a platform
router.post('/platforms/connect', authenticateToken, async (req, res) => {
  try {
    const { platformId, credentials } = req.body;
    const userId = req.userId;

    if (!platformId || !AFFILIATE_PLATFORMS[platformId]) {
      return res.status(400).json({ success: false, error: 'Invalid platform ID' });
    }

    // Check if already connected
    const existingConnection = await AffiliatePlatform.findOne({ userId, platformId });
    if (existingConnection && existingConnection.isConnected) {
      return res.status(400).json({ success: false, error: 'Platform already connected' });
    }

    const platform = AFFILIATE_PLATFORMS[platformId];
    const connectionData = {
      userId,
      platformId,
      platformName: platform.name,
      isConnected: true,
      connectedAt: new Date(),
      credentials: credentials || {},
      status: 'active',
      permissions: ['read', 'write']
    };

    if (existingConnection) {
      await AffiliatePlatform.findByIdAndUpdate(existingConnection._id, connectionData);
    } else {
      await AffiliatePlatform.create(connectionData);
    }

    res.json({ 
      success: true, 
      message: `Successfully connected to ${platform.name}`,
      data: connectionData 
    });
  } catch (error) {
    console.error('Platform connection error:', error);
    res.status(500).json({ success: false, error: 'Failed to connect platform' });
  }
});

// POST /api/affiliate/platforms/disconnect - Disconnect from a platform
router.post('/platforms/disconnect', authenticateToken, async (req, res) => {
  try {
    const { platformId } = req.body;
    const userId = req.userId;

    await AffiliatePlatform.findOneAndUpdate(
      { userId, platformId },
      { isConnected: false, status: 'inactive' }
    );

    res.json({ 
      success: true, 
      message: 'Platform disconnected successfully' 
    });
  } catch (error) {
    console.error('Platform disconnection error:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect platform' });
  }
});

// GET /api/affiliate/links - Get all affiliate links
router.get('/links', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, platform, status, search } = req.query;
    const userId = req.userId;
    
    let query = { userId };

    // Apply filters
    if (platform) {
      query.platform = platform;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { product: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const links = await AffiliateLink.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AffiliateLink.countDocuments(query);

    res.json({
      success: true,
      data: {
        links,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Links retrieval error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve links' });
  }
});

// POST /api/affiliate/links/generate - Generate new affiliate link
router.post('/links/generate', authenticateToken, async (req, res) => {
  try {
    // Drop the problematic id index if it exists
    try {
      await AffiliateLink.collection.dropIndex('id_1');
      console.log('AffiliateLink - Dropped problematic id_1 index');
    } catch (err) {
      console.log('AffiliateLink - Index id_1 does not exist or already dropped');
    }
    
    const { originalUrl, platform, customAlias, product } = req.body;
    const userId = req.userId;

    // Basic field validation
    if (!originalUrl) {
      return res.status(400).json({ success: false, error: 'originalUrl is required' });
    }
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ success: false, error: 'originalUrl must be a valid URL' });
    }
    if (!platform) {
      return res.status(400).json({ success: false, error: 'platform is required' });
    }

    // Validate platform is connected
    const platformConnection = await AffiliatePlatform.findOne({ 
      userId, 
      platformId: platform, 
      isConnected: true 
    });
    
    if (!platformConnection) {
      return res.status(400).json({ 
        success: false, 
        error: `Platform not connected. Please connect the platform first.` 
      });
    }

    // Generate new link
    const newLink = await AffiliateLink.create({
      userId,
      originalUrl,
      shortUrl: generateShortUrl(originalUrl, customAlias),
      platform,
      product: product || 'Untitled Product',
      customAlias: customAlias || null,
      trackingParams: Object.entries(generateTrackingParams(platform, userId)).map(([key, value]) => ({
        key,
        value
      }))
    });

    res.json({ 
      success: true, 
      message: 'Affiliate link generated successfully',
      data: newLink 
    });
  } catch (error) {
    console.error('Link generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate link' });
  }
});

// PUT /api/affiliate/links/:id - Update affiliate link
router.put('/links/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;

    const link = await AffiliateLink.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    res.json({ 
      success: true, 
      message: 'Link updated successfully',
      data: link 
    });
  } catch (error) {
    console.error('Link update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update link' });
  }
});

// DELETE /api/affiliate/links/:id - Delete affiliate link
router.delete('/links/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const link = await AffiliateLink.findOneAndDelete({ _id: id, userId });

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    res.json({ 
      success: true, 
      message: 'Link deleted successfully' 
    });
  } catch (error) {
    console.error('Link deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete link' });
  }
});

// POST /api/affiliate/links/:id/click - Track link click
router.post('/links/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAgent, ip, referrer } = req.body;

    const link = await AffiliateLink.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Update click count
    link.clicks = (link.clicks || 0) + 1;
    link.lastClicked = new Date();
    await link.save();

    // Update analytics
    await AffiliateAnalytics.findOneAndUpdate(
      { userId: link.userId, date: new Date().toISOString().split('T')[0] },
      { $inc: { 'metrics.totalClicks': 1 } },
      { upsert: true }
    );

    // Return original URL for redirect
    res.json({ 
      success: true, 
      redirectUrl: link.originalUrl,
      message: 'Click tracked successfully' 
    });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ success: false, error: 'Failed to track click' });
  }
});

// POST /api/affiliate/links/:id/conversion - Track conversion
router.post('/links/:id/conversion', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency = 'USD', commission } = req.body;

    const link = await AffiliateLink.findById(id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Update conversion data
    link.conversions = (link.conversions || 0) + 1;
    link.earnings = (link.earnings || 0) + (commission || 0);
    await link.save();

    // Update analytics
    await AffiliateAnalytics.findOneAndUpdate(
      { userId: link.userId, date: new Date().toISOString().split('T')[0] },
      { 
        $inc: { 
          'metrics.totalConversions': 1,
          'metrics.totalEarnings': commission || 0
        }
      },
      { upsert: true }
    );

    res.json({ 
      success: true, 
      message: 'Conversion tracked successfully',
      data: {
        linkId: id,
        newEarnings: link.earnings,
        totalEarnings: link.earnings
      }
    });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({ success: false, error: 'Failed to track conversion' });
  }
});

// GET /api/affiliate/analytics - Get analytics data
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '30d', platform } = req.query;
    const userId = req.userId;
    
    const now = new Date();
    const periodDays = parseInt(period.replace('d', ''));
    const startDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    let matchQuery = { userId, date: { $gte: startDate } };
    if (platform) {
      matchQuery.platform = platform;
    }

    const analytics = await AffiliateAnalytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$metrics.totalClicks' },
          totalConversions: { $sum: '$metrics.totalConversions' },
          totalEarnings: { $sum: '$metrics.totalEarnings' }
        }
      }
    ]);

    const result = analytics[0] || {
      totalClicks: 0,
      totalConversions: 0,
      totalEarnings: 0
    };

    const analyticsData = {
      overview: {
        totalClicks: result.totalClicks,
        totalConversions: result.totalConversions,
        totalEarnings: result.totalEarnings,
        conversionRate: result.totalClicks > 0 ? 
          ((result.totalConversions / result.totalClicks) * 100).toFixed(2) : 0,
        averageEarningsPerClick: result.totalClicks > 0 ? 
          (result.totalEarnings / result.totalClicks).toFixed(2) : 0
      },
      trends: {
        clicksByDate: {},
        conversionsByDate: {},
        earningsByDate: {}
      },
      topPerformers: [],
      platformBreakdown: {}
    };

    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to load analytics' });
  }
});

// GET /api/affiliate/earnings - Get earnings data
router.get('/earnings', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const earnings = await AffiliateAnalytics.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: '$metrics.totalEarnings' },
          thisMonth: { $sum: '$metrics.totalEarnings' }, // Simplified
          lastMonth: { $sum: '$metrics.totalEarnings' } // Simplified
        }
      }
    ]);

    const result = earnings[0] || {
      total: 0,
      thisMonth: 0,
      lastMonth: 0
    };
    
    res.json({ 
      success: true, 
      data: {
        total: result.total,
        thisMonth: result.thisMonth,
        lastMonth: result.lastMonth,
        byPlatform: {},
        recentTransactions: []
      }
    });
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({ success: false, error: 'Failed to load earnings' });
  }
});

// POST /api/affiliate/bulk-import - Bulk import links
router.post('/bulk-import', authenticateToken, async (req, res) => {
  try {
    const { links: importLinks, platform } = req.body;
    const userId = req.userId;

    if (!Array.isArray(importLinks) || importLinks.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid import data' 
      });
    }

    const newLinks = [];
    for (const importLink of importLinks) {
      if (importLink.originalUrl) {
        const newLink = await AffiliateLink.create({
          userId,
          originalUrl: importLink.originalUrl,
          shortUrl: generateShortUrl(importLink.originalUrl),
          platform: platform || importLink.platform || 'Unknown',
          product: importLink.product || 'Imported Product',
          imported: true
        });
        newLinks.push(newLink);
      }
    }

    res.json({ 
      success: true, 
      message: `Successfully imported ${newLinks.length} links`,
      data: { importedCount: newLinks.length, totalLinks: newLinks.length }
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ success: false, error: 'Failed to import links' });
  }
});

// GET /api/affiliate/export - Export affiliate data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format = 'json', type = 'links' } = req.query;
    const userId = req.userId;

    let data;
    switch (type) {
      case 'links':
        data = await AffiliateLink.find({ userId }).lean();
        break;
      case 'analytics':
        data = await AffiliateAnalytics.find({ userId }).lean();
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid export type' });
    }

    if (format === 'csv' && type === 'links') {
      // Convert to CSV for links
      const csv = [
        'ID,Product,Platform,Original URL,Short URL,Clicks,Conversions,Earnings,Status,Created',
        ...data.map(link => 
          `${link._id},"${link.product}","${link.platform}","${link.originalUrl}","${link.shortUrl}",${link.clicks || 0},${link.conversions || 0},${link.earnings || 0},"${link.status}","${link.createdAt}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="affiliate-${type}-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="affiliate-${type}-${Date.now()}.json"`);
      res.json(data);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

module.exports = router;