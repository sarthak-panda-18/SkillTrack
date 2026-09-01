# Google OAuth 2.0 Setup Guide for SkillTrack AI

This document provides step-by-step instructions to configure Google OAuth 2.0 authentication for **SkillTrack AI**.

---

## 1. Create Google Cloud OAuth Credentials

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** -> **OAuth client ID**.
3. If prompted, configure your **OAuth consent screen**:
   - User Type: **External**
   - App name: `SkillTrack AI`
   - User support email: Select your email address.
   - Developer contact email: Enter your email address.
   - Save and continue.
4. Select Application type: **Web application**.
5. Name: `SkillTrack AI Web Client`.
6. Add **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
7. Add **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://localhost:5000/api/auth/google/callback`
8. Click **Create**.
9. Copy your **Client ID** and **Client Secret**.

---

## 2. Configure Environment Variables

### Backend Configuration (`backend/.env`)

Add your Google Client ID and Secret to `backend/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Frontend Configuration (`frontend/.env.local`)

Add your Google Client ID to `frontend/.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 3. How Google OAuth Authentication Works in SkillTrack AI

1. **User Clicks "Continue with Google"**:
   - Triggers Google OAuth Sign-In flow on frontend.
2. **Google Verifies Identity**:
   - Returns a signed Google ID Token (JWT).
3. **SkillTrack Backend Validation**:
   - `POST /api/auth/google` receives credential token.
   - Backend `OAuth2Client` verifies signature against `GOOGLE_CLIENT_ID`.
4. **Account Provisioning & Linking**:
   - If user exists: links Google provider and logs user in.
   - If new user: creates account with default `role = 'STUDENT'`, `status = 'ACTIVE'`, and redirects user to `/onboarding`.
5. **Session Token Issued**:
   - SkillTrack JWT is issued and stored in client localStorage & cookies.
