# Fix: "Invalid API key" Error

## Why This Error Occurs

The "Invalid API key" error happens when:
1. **Environment variables are missing** in Vercel deployment
2. **API key is incorrect** or has been regenerated
3. **Environment variables are not loaded** properly in the browser

## Solution

### For Local Development:
Your `.env.local` file should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ftleeapkwqztmvlawudk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLrVruUCPqOis
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5OTA0NSwiZXhwIjoyMDgzODc1MDQ1fQ.oQdvVvrotMt80H_fZxsdcvgdLlNx5yEzbAT2Al1_YQc
```

### For Vercel Deployment:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `vat-btw`
3. **Go to Settings → Environment Variables**
4. **Add these variables** (for ALL environments: Production, Preview, Development):

   ```
   NEXT_PUBLIC_SUPABASE_URL
   Value: https://ftleeapkwqztmvlawudk.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLrVruUCPqOis
   
   SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5OTA0NSwiZXhwIjoyMDgzODc1MDQ1fQ.oQdvVvrotMt80H_fZxsdcvgdLlNx5yEzbAT2Al1_YQc
   ```

5. **Redeploy** your application after adding the variables

### Verify Your API Keys:

1. Go to: https://supabase.com/dashboard/project/ftleeapkwqztmvlawudk/settings/api
2. Check that the **anon/public** key matches your environment variable
3. If the key has been regenerated, update it in both `.env.local` and Vercel

## Quick Check

Run this command to verify your local environment variables:
```bash
cd /Users/eyobielgoitom/Downloads/dutch-vat-automation
cat .env.local | grep NEXT_PUBLIC_SUPABASE
```

If the variables are missing or incorrect, the login will fail with "Invalid API key".

## After Fixing

1. **Restart your dev server**: `pnpm dev`
2. **Clear browser cache** and try logging in again
3. **For Vercel**: Wait for redeployment to complete

