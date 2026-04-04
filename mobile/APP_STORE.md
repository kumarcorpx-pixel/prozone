# CorporatePRO — App Store Submission Guide

## App Store Metadata

### App Name
CorporatePRO - Business PRO Services

### Subtitle
Corporate PRO Services Management

### Description
CorporatePRO is the official mobile app for YABS Public Relations Management LLC, Dubai's trusted PRO services provider.

Manage your companies, employees, documents, and service requests — all from your phone.

KEY FEATURES:
- View and track all your managed companies
- Monitor employee visa, Emirates ID, and passport expiry dates
- Submit and track PRO service requests in real-time
- Access uploaded documents (trade licenses, visas, contracts)
- Get notified about expiring documents and request updates
- Secure JWT authentication with automatic session refresh

WHO IS IT FOR:
- Business owners managing multiple companies in the UAE
- PRO staff handling government relations and employee services
- Clients tracking their company documents and service requests

Built for the UAE business community. Requires a CorporatePRO account at corporatepro.cloud.

### Keywords
PRO services, UAE business, company management, visa tracking, document management, employee management, trade license, Emirates ID, Dubai PRO, corporate services

### Category
Primary: Business
Secondary: Productivity

### Privacy Policy URL
https://corporatepro.cloud/privacy

### Support URL
https://corporatepro.cloud/contact

### Marketing URL
https://corporatepro.cloud

---

## Screenshots Required (iPhone 6.7" and 6.5")

1. **Login Screen** — Navy gradient with YABS branding
2. **Dashboard** — Stats grid showing companies, employees, requests, documents
3. **Companies List** — Cards with status badges, expiry dates, employee counts
4. **Employees List** — Visa status badges, nationality, expiry tracking
5. **Service Requests** — Filter pills, status badges, priority indicators
6. **Documents** — Color-coded expiry borders, doc type icons

---

## Build & Deploy Steps

### Prerequisites
- Mac with Xcode 15+
- Apple Developer Account ($99/year) — https://developer.apple.com
- Node.js 18+

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

### Step 2: Build Web Assets
```bash
npm run build
```

### Step 3: Add iOS Platform (first time only)
```bash
npx cap add ios
```

### Step 4: Sync to Native
```bash
npx cap sync ios
```

### Step 5: Open in Xcode
```bash
npx cap open ios
```

### Step 6: Configure in Xcode
1. Select the "App" target
2. Set **Team** to your Apple Developer account
3. Set **Bundle Identifier**: `cloud.corporatepro.app`
4. Set **Display Name**: `CorporatePRO`
5. Set **Version**: `1.0.0`
6. Set **Build**: `1`
7. Under **Signing & Capabilities**, enable "Automatically manage signing"

### Step 7: Add App Icons
In Xcode, go to Assets.xcassets → AppIcon:
- Drag in a 1024x1024 app icon PNG
- Xcode will generate all required sizes

### Step 8: Test on Simulator
1. Select iPhone 15 Pro simulator
2. Press Cmd+R to build and run
3. Test all screens: login, dashboard, companies, employees, requests, documents

### Step 9: Test on Real Device
1. Connect iPhone via USB
2. Select your device in the target dropdown
3. Press Cmd+R to build and run
4. Test scrolling, safe areas, keyboard, touch targets

### Step 10: Archive for App Store
1. Select "Any iOS Device" as the build target
2. Menu: Product → Archive
3. Wait for archive to complete
4. In Organizer window, click "Distribute App"
5. Select "App Store Connect"
6. Upload

### Step 11: App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create new app: "CorporatePRO"
3. Fill in metadata (from above)
4. Upload screenshots
5. Select the uploaded build
6. Submit for review

### Review Timeline
- First submission: 1-3 business days
- Updates: usually 24-48 hours
- Rejection common reasons:
  - Missing privacy policy
  - App requires login but no demo account provided
  - Insufficient app functionality

### Provide Demo Account for Review
In App Store Connect → App Review Information:
- Username: (create a demo client account)
- Password: (set a review password)
- Notes: "This app requires a CorporatePRO account. Use the demo credentials above."

---

## Production Checklist

### Code
- [x] No console.log statements in production
- [x] All API calls have error handling
- [x] Request timeout (15s)
- [x] Auto-retry on network failure (1 retry)
- [x] Token refresh on 401
- [x] Secure token storage (Capacitor Preferences)
- [x] Global error boundary
- [x] Memory leak prevention (timer cleanup, observer disconnect)
- [x] InfiniteList re-render fix (ref-based callbacks)

### Security
- [x] API base URL is HTTPS
- [x] No hardcoded credentials
- [x] Token stored in Capacitor Preferences (encrypted on iOS)
- [x] Logout clears all stored data
- [x] No sensitive data in component state after logout

### iOS
- [x] Safe area insets (top + bottom)
- [x] Touch targets minimum 44px
- [x] Blur backdrop headers and tab bar
- [x] Smooth scrolling (-webkit-overflow-scrolling)
- [x] Splash screen configured (navy background)
- [x] Status bar configured (light text)

### Performance
- [x] Paginated API calls (20 items per page)
- [x] IntersectionObserver for infinite scroll
- [x] Debounced search (300ms)
- [x] Deduped token refresh calls
