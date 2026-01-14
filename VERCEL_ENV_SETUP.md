# Vercel Environment Variables Setup

## ✅ Current Supabase API Keys (from your dashboard)

Based on your Supabase dashboard, here are the correct API keys:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://ftleeapkwqztmvlawudk.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY (anon/public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLvruUCPqOis
```

### 3. SUPABASE_SERVICE_ROLE_KEY (service_role/secret)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5OTA0NSwiZXhwIjoyMDgzODc1MDQ1fQ.oQdvVbrotMt80H_fZxsdcvgdLlNx5yEzbAT2Al1_YQc
```

## 📋 Steps to Add in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `vat-btw` or `vat.cal`
3. **Navigate to**: Settings → Environment Variables
4. **Add each variable** (click "Add New" for each):

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://ftleeapkwqztmvlawudk.supabase.co`
   - Environment: Select **ALL** (Production, Preview, Development)

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTkwNDUsImV4cCI6MjA4Mzg3NTA0NX0.54bEht8R03nPv25QGCsrVcIpePXcO4HRLvruUCPqOis`
   - Environment: Select **ALL** (Production, Preview, Development)

   **Variable 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGVlYXBrd3F6dG12bGF3dWRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI5OTA0NSwiZXhwIjoyMDgzODc1MDQ1fQ.oQdvVbrotMt80H_fZxsdcvgdLlNx5yEzbAT2Al1_YQc`
   - Environment: Select **ALL** (Production, Preview, Development)

5. **Save** each variable
6. **Redeploy** your application:
   - Go to the "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Select "Redeploy"

## ⚠️ Important Notes

- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Safe to use in browser (public key)
- **SUPABASE_SERVICE_ROLE_KEY**: **NEVER** expose this in client-side code. It bypasses Row Level Security.
- Make sure to select **ALL environments** (Production, Preview, Development) when adding variables
- After adding variables, you **MUST redeploy** for changes to take effect

## ✅ Verification

After redeploying, check:
1. Login should work without "Invalid API key" error
2. Dashboard should load correctly
3. All Supabase operations should function

## 🔍 If Still Having Issues

1. Double-check the keys match exactly (no extra spaces)
2. Ensure all 3 variables are added
3. Verify you selected ALL environments
4. Wait for redeployment to complete
5. Clear browser cache and try again

