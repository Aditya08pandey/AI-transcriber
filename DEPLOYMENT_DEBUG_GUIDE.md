# Deployment Debug Guide

## 🚨 Common Deployment Issues & Solutions

### 1. Environment Variables Not Set

**Problem:** Your app works locally but fails on deployed server because environment variables are missing.

**Solution:**
1. Set these environment variables in your deployment platform:
   ```env
   OPENAI_API_KEY=sk-your_openai_api_key_here
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/transcribe_ai
   ```

2. **For Vercel:**
   - Go to your project dashboard
   - Navigate to Settings → Environment Variables
   - Add each variable

3. **For Netlify:**
   - Go to Site Settings → Environment Variables
   - Add each variable

4. **For Railway:**
   - Go to your project → Variables
   - Add each variable

### 2. MongoDB Connection Issues

**Problem:** Database connection fails on deployed server.

**Solutions:**

**A. Check MongoDB Atlas Settings:**
1. Go to MongoDB Atlas dashboard
2. Navigate to Network Access
3. Add your deployment platform's IP or use `0.0.0.0/0` for all IPs (less secure but easier)

**B. Verify MongoDB URI:**
- Ensure the URI format is correct
- Check username/password are URL-encoded
- Verify database name exists

**C. Test Connection:**
```javascript
// Add this to your API route for debugging
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
```

### 3. API Route Structure Issues

**Problem:** Next.js App Router vs Pages Router confusion.

**Solution:** Your API routes should be in the correct location:
- ✅ `src/app/api/summarize/route.ts` (App Router)
- ❌ `src/pages/api/summarize.ts` (Pages Router - conflicts)

### 4. CORS Issues

**Problem:** Frontend can't communicate with API routes.

**Solution:** Add CORS headers to your API routes:

```typescript
// In your API route
export async function POST(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
```

### 5. Build Issues

**Problem:** App builds locally but fails on deployment.

**Solutions:**

**A. Check Node.js version:**
```json
// package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**B. Fix TypeScript errors:**
```bash
npm run build
```

**C. Check for missing dependencies:**
```bash
npm install
```

### 6. Runtime Errors

**Problem:** App deploys but crashes at runtime.

**Debugging Steps:**

**A. Check deployment logs:**
- Vercel: Project → Functions → View logs
- Netlify: Site → Functions → View logs
- Railway: Project → Deployments → View logs

**B. Add error logging:**
```typescript
// In your API route
try {
  // Your code
} catch (error) {
  console.error('Detailed error:', error);
  return NextResponse.json(
    { error: 'Internal server error', details: error.message },
    { status: 500 }
  );
}
```

### 7. OpenAI API Issues

**Problem:** OpenAI API calls fail on deployed server.

**Solutions:**

**A. Check API key:**
```typescript
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
  return NextResponse.json(
    { error: 'OpenAI API key not configured' },
    { status: 500 }
  );
}
```

**B. Check API limits:**
- Verify your OpenAI account has credits
- Check rate limits in OpenAI dashboard

**C. Test API key:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.openai.com/v1/models
```

### 8. File Upload Issues

**Problem:** File uploads work locally but fail on deployment.

**Solutions:**

**A. Check file size limits:**
- Vercel: 4.5MB limit for serverless functions
- Netlify: 6MB limit
- Add file size validation

**B. Check file processing:**
- Ensure all dependencies are installed
- Check if file processing libraries work on deployment platform

### 9. Performance Issues

**Problem:** App is slow on deployment.

**Solutions:**

**A. Optimize API calls:**
- Add caching
- Reduce token usage
- Use streaming responses

**B. Check function timeout:**
- Vercel: 10 seconds for hobby plan
- Netlify: 10 seconds
- Railway: 30 seconds

### 10. Debugging Checklist

**Before deploying:**
- [ ] All environment variables are set
- [ ] MongoDB connection string is correct
- [ ] OpenAI API key is valid
- [ ] All dependencies are in package.json
- [ ] TypeScript builds without errors
- [ ] API routes are in correct location

**After deploying:**
- [ ] Check deployment logs for errors
- [ ] Test API endpoints directly
- [ ] Verify environment variables are loaded
- [ ] Test database connection
- [ ] Test OpenAI API calls
- [ ] Check browser console for errors

### 11. Quick Debug Script

Add this to your API route for debugging:

```typescript
export async function POST(request: NextRequest) {
  // Debug logging
  console.log('=== API Debug Info ===');
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('Node Environment:', process.env.NODE_ENV);
  console.log('Request Method:', request.method);
  
  try {
    // Your existing code
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```

### 12. Common Error Messages & Solutions

**"OPENAI_API_KEY is not set"**
- Set the environment variable in your deployment platform

**"MongoDB connection failed"**
- Check MongoDB URI format
- Add deployment IP to MongoDB Atlas whitelist
- Verify database credentials

**"Function timeout"**
- Reduce processing time
- Use streaming responses
- Upgrade deployment plan

**"Module not found"**
- Check all dependencies are in package.json
- Run `npm install` on deployment

**"CORS error"**
- Add CORS headers to API responses
- Check request origin

### 13. Platform-Specific Issues

**Vercel:**
- Check function logs in dashboard
- Verify environment variables are set
- Check build logs for errors

**Netlify:**
- Check function logs in dashboard
- Verify environment variables in site settings
- Check build logs

**Railway:**
- Check deployment logs
- Verify environment variables in project settings
- Check service logs

### 14. Testing Your Fix

After implementing fixes:

1. **Test locally first:**
   ```bash
   npm run build
   npm start
   ```

2. **Deploy and test:**
   - Check deployment logs
   - Test API endpoints
   - Verify all features work

3. **Monitor for issues:**
   - Set up error monitoring
   - Check logs regularly
   - Monitor API usage

## 🎯 Most Likely Solution

Based on your codebase, the most likely issue is **missing environment variables** on your deployed server. 

**Immediate steps:**
1. Set `OPENAI_API_KEY` in your deployment platform
2. Set `MONGODB_URI` in your deployment platform
3. Redeploy your application
4. Test the summarize functionality

If that doesn't work, check the deployment logs for specific error messages and refer to the debugging steps above. 