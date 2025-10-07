# Password Reset Setup Guide

## Issue: Supabase Not Sending Password Reset Emails

If password reset emails are not being sent, follow these steps to configure Supabase properly:

---

## 1. Configure Email Settings in Supabase Dashboard

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project: `ryspfqoxnzdrhrqiiqht`

### Step 2: Configure Email Templates
1. Navigate to **Authentication** → **Email Templates**
2. Find the **"Reset Password"** template
3. Verify the template is enabled and configured

### Step 3: Configure Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Add your redirect URLs to the **"Redirect URLs"** allowlist:
   - For local development: `http://localhost:3000/reset-password`
   - For production: `https://yourdomain.com/reset-password`
   - Add both if testing locally and in production

### Step 4: Configure Site URL
1. In **Authentication** → **URL Configuration**
2. Set the **Site URL** to your application's base URL:
   - Local: `http://localhost:3000`
   - Production: `https://yourdomain.com`

---

## 2. Email Provider Configuration

### Option A: Use Supabase's Built-in Email (Development Only)
- Supabase provides a built-in email service for development
- **Limitation**: Rate limited and may not work reliably
- **Not recommended for production**

### Option B: Configure Custom SMTP (Recommended for Production)
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable custom SMTP
3. Configure your SMTP provider (e.g., SendGrid, Mailgun, AWS SES, Gmail):
   ```
   SMTP Host: smtp.yourprovider.com
   SMTP Port: 587 (or 465 for SSL)
   SMTP User: your-smtp-username
   SMTP Password: your-smtp-password
   Sender Email: noreply@yourdomain.com
   Sender Name: SK PMMS
   ```

### Popular SMTP Providers:
- **SendGrid**: Free tier available, easy setup
- **Mailgun**: Free tier available, reliable
- **AWS SES**: Very cheap, requires AWS account
- **Gmail**: Can use for testing, not recommended for production

---

## 3. Verify Email Confirmation Settings

1. Go to **Authentication** → **Providers** → **Email**
2. Check these settings:
   - **Enable email provider**: ✓ Enabled
   - **Confirm email**: Can be enabled or disabled based on your needs
   - **Secure email change**: Recommended to enable

---

## 4. Test the Password Reset Flow

### Using the Browser Console:
1. Open your app at `/forgot-password`
2. Open browser DevTools (F12)
3. Go to the **Console** tab
4. Enter an email and submit
5. Check the console logs for:
   ```
   Sending password reset email to: user@example.com
   Redirect URL: http://localhost:3000/reset-password
   Reset password response: { data: {...}, error: null }
   ```

### Check for Errors:
- If you see an error about "Email rate limit exceeded" → Wait a few minutes
- If you see "Invalid redirect URL" → Add the URL to the allowlist (Step 1.3)
- If you see "SMTP not configured" → Set up custom SMTP (Step 2.B)

---

## 5. Check Spam/Junk Folder

Password reset emails often end up in spam. Check:
1. Gmail: Check "Spam" folder
2. Outlook: Check "Junk Email" folder
3. Other providers: Check spam/junk folders

---

## 6. Alternative: Manual Password Reset via Supabase Dashboard

If emails still don't work, you can manually reset passwords:

1. Go to **Authentication** → **Users**
2. Find the user
3. Click the three dots (⋮) → **Send password recovery**
4. Or click **Reset password** to set a new password directly

---

## 7. Debugging Checklist

- [ ] Redirect URL is added to Supabase allowlist
- [ ] Site URL is configured correctly
- [ ] Email template is enabled
- [ ] SMTP is configured (for production)
- [ ] User email exists in the database
- [ ] No rate limiting errors in console
- [ ] Checked spam/junk folder
- [ ] Browser console shows no errors

---

## 8. Code Implementation

The password reset flow is implemented in:
- `/app/forgot-password/page.tsx` - Request reset email
- `/app/reset-password/page.tsx` - Handle reset token and update password
- `/app/login/page.tsx` - Link to forgot password

### How it works:
1. User enters email on forgot-password page
2. Supabase sends email with magic link containing token
3. User clicks link → redirected to `/reset-password` with token in URL
4. User enters new password
5. Password updated via `supabase.auth.updateUser()`

---

## 9. Testing Locally

To test the full flow locally:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Make sure these URLs are in Supabase allowlist:
   - `http://localhost:3000/**`
   - `http://localhost:3000/reset-password`

3. Use a real email address you have access to

4. Check the browser console for any errors

---

## 10. Production Deployment

Before deploying to production:

1. Add production URLs to Supabase:
   - `https://yourdomain.com/**`
   - `https://yourdomain.com/reset-password`

2. Configure custom SMTP (required for production)

3. Update Site URL to production domain

4. Test the flow on production

---

## Common Issues & Solutions

### Issue: "Invalid redirect URL"
**Solution**: Add the URL to Authentication → URL Configuration → Redirect URLs

### Issue: "Email rate limit exceeded"
**Solution**: Wait 60 seconds between requests, or configure custom SMTP

### Issue: Emails not arriving
**Solution**: 
1. Check spam folder
2. Verify SMTP configuration
3. Check Supabase logs in Dashboard → Logs

### Issue: Reset link expired
**Solution**: Links expire after 1 hour. Request a new reset email.

### Issue: "User not found" error
**Solution**: Make sure the email exists in Authentication → Users

---

## Need Help?

1. Check Supabase logs: Dashboard → Logs → Auth logs
2. Check browser console for errors
3. Verify all configuration steps above
4. Contact Supabase support if issues persist
