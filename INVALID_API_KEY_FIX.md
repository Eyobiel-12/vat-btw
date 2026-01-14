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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
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
   Value: your-anon-key-here
   
   SUPABASE_SERVICE_ROLE_KEY
   Value: your-service-role-key-here
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

