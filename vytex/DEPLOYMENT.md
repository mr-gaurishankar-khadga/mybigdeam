# MYVYTEX Deployment Guide

## 🚀 Netlify Deployment Steps

### 1. Environment Setup

Create a `.env` file in the `vytex` directory with your production values:

```bash
# Production Environment Variables
VITE_BACKEND_URL=https://your-backend-domain.com
VITE_APP_NAME=MYVYTEX
VITE_APP_VERSION=1.0.0
VITE_CONTACT_EMAIL=ggs699000@gmail.com
VITE_CONTACT_PHONE=+91 8141166187
VITE_BUSINESS_NAME=MYVYTEX

# Social Media Integration (Add when you get them)
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id

# Payment Configuration (Add when you get them)
VITE_CASHFREE_CLIENT_ID=your_cashfree_client_id
VITE_CASHFREE_MODE=production

# Legal URLs (Update with your actual domain)
VITE_PRIVACY_POLICY_URL=https://your-domain.netlify.app/privacy-policy
VITE_TERMS_CONDITIONS_URL=https://your-domain.netlify.app/terms-and-conditions
VITE_DATA_DELETION_URL=https://your-domain.netlify.app/data-deletion-policy
```

### 2. Build Configuration

The project is already configured for production builds with:
- ✅ Environment variables support
- ✅ Security headers in index.html
- ✅ SEO meta tags
- ✅ Performance optimizations
- ✅ Code splitting

### 3. Netlify Deployment

#### Option A: Connect GitHub Repository
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18.x

#### Option B: Manual Deploy
1. Build the project:
   ```bash
   cd vytex
   npm install
   npm run build
   ```
2. Upload the `dist` folder to Netlify

### 4. Environment Variables in Netlify

Add these environment variables in Netlify dashboard:
- `VITE_BACKEND_URL` - Your backend API URL
- `VITE_FACEBOOK_APP_ID` - Facebook App ID
- `VITE_INSTAGRAM_CLIENT_ID` - Instagram Client ID
- `VITE_CASHFREE_CLIENT_ID` - Cashfree Client ID

### 5. Custom Domain Setup

1. In Netlify dashboard, go to "Domain settings"
2. Add your custom domain
3. Update environment variables with your domain
4. Update meta tags in `index.html` with your domain

### 6. Facebook Developer Account Setup

Once deployed, use these URLs for Facebook app configuration:

- **Privacy Policy URL:** `https://your-domain.netlify.app/privacy-policy`
- **Terms of Service URL:** `https://your-domain.netlify.app/terms-and-conditions`
- **Data Deletion Callback URL:** `https://your-domain.netlify.app/data-deletion-policy`

### 7. Security Checklist

✅ **Completed Security Measures:**
- Environment variables for all URLs
- Security headers in HTML
- HTTPS enforcement
- XSS protection
- Content Security Policy
- Referrer policy
- Frame options

### 8. Performance Optimizations

✅ **Already Implemented:**
- Code splitting
- Bundle optimization
- Image optimization
- Preconnect to external domains
- Minification
- Tree shaking

### 9. Monitoring & Analytics

Add these to your environment variables when ready:
```bash
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_HOTJAR_ID=your_hotjar_id
```

### 10. Backup & Recovery

- Enable Netlify's automatic backups
- Keep your GitHub repository updated
- Document your environment variables
- Test deployment process regularly

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Production build with optimizations
npm run build:prod
```

## 📱 Mobile Optimization

The app is already optimized for mobile with:
- Responsive design
- Touch-friendly interfaces
- Mobile-first CSS
- Progressive Web App features

## 🌐 SEO Optimization

✅ **SEO Features Implemented:**
- Meta tags for search engines
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data
- Canonical URLs
- Sitemap ready

## 🚨 Important Notes

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Update URLs** - Replace placeholder URLs with your actual domain
3. **Test thoroughly** - Test all features after deployment
4. **Monitor performance** - Use Netlify analytics
5. **Keep dependencies updated** - Regular security updates

## 📞 Support

For deployment issues, contact:
- **Email:** ggs699000@gmail.com
- **Phone:** +91 8141166187
- **Business:** MYVYTEX
