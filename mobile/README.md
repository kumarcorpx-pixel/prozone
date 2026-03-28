# CorporatePRO Mobile App

## Architecture
- **Framework**: React Native with Expo
- **Backend**: Same API as web (corporatepro.cloud/api/*)
- **Auth**: JWT tokens (same as web)
- **Push**: ntfy (already configured)

## Setup Instructions

### Prerequisites
1. Node.js 18+
2. Expo CLI: `npm install -g expo-cli`
3. Xcode 15+ (for iOS) — Mac required
4. Apple Developer Account ($99/year) for App Store
5. Android Studio (for Android)
6. Google Play Developer Account ($25 one-time)

### Quick Start
```bash
cd mobile/app
npx expo install
npx expo start
```

### iOS Build
```bash
npx expo build:ios
# or with EAS
npx eas build --platform ios
```

### Android Build
```bash
npx expo build:android
# or with EAS
npx eas build --platform android
```

## API Endpoints Used
All endpoints are at `https://corporatepro.cloud/api/`

### Auth
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Client Data
- GET /api/client/companies
- GET /api/client/employees
- GET /api/client/documents
- GET /api/client/requests
- GET /api/client/stats

### Documents
- POST /api/documents/upload
- GET /api/documents/{id}/download

### Notifications
- GET /api/notifications

### Search
- GET /api/search?q=query

## Screens
1. Login
2. Dashboard (Active Services, Quick Actions, Activity)
3. My Company (Details, Employees, Documents)
4. Services & Requests (List, Detail, Track)
5. Documents (Upload, Search, Preview)
6. Payments
7. Notifications
8. Messages
9. Settings (Profile, Password, Preferences)

## For iOS Specifically
- Requires Mac with Xcode
- Cannot build on Windows/Linux
- Apple Developer Account needed
- TestFlight for beta testing
- App Store review takes 1-3 days

## Alternative: WebView App (Fastest)
If you want an app on the App Store quickly:
1. Use Capacitor to wrap corporatepro.cloud
2. No separate codebase needed
3. 1-2 weeks to publish
```bash
npx cap init CorporatePRO cloud.corporatepro.app
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios
```
