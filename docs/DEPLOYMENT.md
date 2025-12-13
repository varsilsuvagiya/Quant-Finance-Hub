# Deployment Guide

## Quant Finance Hub - Deployment Instructions

This guide covers deploying the Quant Finance Hub application to production.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- Groq API key
- Domain name (optional, for production)
- Vercel account (recommended) or other hosting platform

---

## Environment Variables

Create a `.env.local` file (or set environment variables in your hosting platform):

```env
# MongoDB Connection
MONGODB_URI=""

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.com

# Groq AI API Key
GROQ_API_KEY=your-groq-api-key-here
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

3. **Set Environment Variables:**

   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add all required variables from `.env.local`

4. **Configure Custom Domain (Optional):**
   - Go to project settings → Domains
   - Add your custom domain
   - Update `NEXTAUTH_URL` to match your domain

### Option 2: Docker

1. **Create Dockerfile:**

   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and Run:**
   ```bash
   docker build -t quant-finance-hub .
   docker run -p 3000:3000 --env-file .env.local quant-finance-hub
   ```

### Option 3: Traditional Server (Node.js)

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start production server:**

   ```bash
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "quant-finance-hub" -- start
   pm2 save
   pm2 startup
   ```

---

## MongoDB Setup

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist your IP address (or `0.0.0.0/0` for all IPs)
5. Get connection string and add to `MONGODB_URI`

### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/quant-finance-hub`

---

## Groq API Setup

1. Sign up at [Groq Console](https://console.groq.com/)
2. Create API key
3. Add to `GROQ_API_KEY` environment variable

---

## Post-Deployment Checklist

- [ ] All environment variables are set
- [ ] MongoDB connection is working
- [ ] NextAuth is configured correctly
- [ ] Groq API key is valid
- [ ] Email verification links work (update email service in production)
- [ ] Password reset links work (update email service in production)
- [ ] SSL certificate is installed (HTTPS)
- [ ] Domain is configured correctly
- [ ] Error monitoring is set up (optional)
- [ ] Analytics is configured (optional)

---

## Email Configuration (Production)

For production, you should integrate a real email service:

### Option 1: SendGrid

```typescript
// src/lib/email.ts
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(email: string, token: string) {
  const msg = {
    to: email,
    from: "noreply@yourdomain.com",
    subject: "Verify your email",
    html: `<a href="${process.env.NEXTAUTH_URL}/verify-email?token=${token}">Verify Email</a>`,
  };
  await sgMail.send(msg);
}
```

### Option 2: Resend

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  await resend.emails.send({
    from: "noreply@yourdomain.com",
    to: email,
    subject: "Verify your email",
    html: `<a href="${process.env.NEXTAUTH_URL}/verify-email?token=${token}">Verify Email</a>`,
  });
}
```

---

## Performance Optimization

1. **Enable Caching:**

   - Use Next.js Image optimization
   - Enable static page generation where possible

2. **Database Indexing:**

   ```javascript
   // Add indexes in MongoDB
   db.strategies.createIndex({ createdBy: 1 });
   db.strategies.createIndex({ isPublic: 1 });
   db.strategies.createIndex({ isTemplate: 1 });
   ```

3. **CDN Setup:**
   - Use Vercel's CDN (automatic)
   - Or configure CloudFlare for custom domains

---

## Monitoring & Logging

### Recommended Services

- **Error Tracking:** Sentry
- **Analytics:** Vercel Analytics or Google Analytics
- **Uptime Monitoring:** UptimeRobot or Pingdom

### Setting up Sentry

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

---

## Security Checklist

- [ ] All environment variables are secure
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] SQL injection protection (N/A - using MongoDB)
- [ ] XSS protection (React handles this)
- [ ] CSRF protection (NextAuth handles this)
- [ ] Password hashing (bcrypt)
- [ ] Session security (NextAuth JWT)

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Check connection string
   - Verify IP whitelist
   - Check database user credentials

2. **NextAuth Errors**

   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Ensure session cookies are working

3. **Build Errors**

   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

4. **API Errors**
   - Check environment variables
   - Verify API keys are valid
   - Check server logs

---

## Rollback Procedure

If deployment fails:

1. **Vercel:**

   - Go to Deployments
   - Click on previous successful deployment
   - Click "Promote to Production"

2. **Docker:**

   ```bash
   docker run -p 3000:3000 --env-file .env.local quant-finance-hub:previous-tag
   ```

3. **PM2:**
   ```bash
   pm2 restart quant-finance-hub --update-env
   ```

---

## Support

For issues or questions:

- GitHub Issues: https://github.com/varsilsuvagiya/Quant-Finance-Hub/issues
- Email: [Your support email]

---

## License

[Your License]
