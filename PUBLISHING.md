# Publishing Guide for Check-In App

## Prerequisites

### For Both Platforms
1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Create an Expo account at https://expo.dev/signup
3. Log in to EAS:
```bash
eas login
```

### For iOS Publishing
1. Apple Developer Account ($99/year) - https://developer.apple.com/programs/enroll/
2. Mac computer for iOS builds and submission
3. App Store Connect setup
4. App Store screenshots (various sizes)
5. App privacy policy

### For Android Publishing
1. Google Play Developer Account ($25 one-time fee) - https://play.google.com/console/signup
2. Privacy policy
3. App screenshots (various sizes)
4. Feature graphic (1024 x 500 px)

## Configuration Steps

1. Update app.json with required information:
```json
{
  "expo": {
    "name": "Check-In App",
    "slug": "check-in-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.jjfcode.checkinapp",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    },
    "android": {
      "package": "com.jjfcode.checkinapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

2. Initialize EAS build:
```bash
eas build:configure
```

## Build and Submit Process

### Android Build and Submit
1. Create Android build:
```bash
eas build --platform android
```

2. Submit to Google Play Store:
```bash
eas submit -p android
```

### iOS Build and Submit (Requires Mac)
1. Create iOS build:
```bash
eas build --platform ios
```

2. Submit to App Store:
```bash
eas submit -p ios
```

## Store Listings Requirements

### Apple App Store
1. App name
2. App description
3. Keywords
4. Support URL
5. Marketing URL (optional)
6. Privacy Policy URL
7. Screenshots:
   - iPhone 6.5" Display (1242 x 2688 px)
   - iPhone 5.5" Display (1242 x 2208 px)
   - iPad Pro 12.9" Display (2048 x 2732 px)

### Google Play Store
1. App name
2. Short description (80 characters)
3. Full description
4. Feature graphic (1024 x 500 px)
5. Screenshots:
   - Phone screenshots (1080 x 1920 px)
   - 7-inch tablet screenshots (1080 x 1920 px)
   - 10-inch tablet screenshots (1080 x 1920 px)
6. Privacy Policy URL
7. Content rating questionnaire
8. Target audience and content

## Recommended Testing Before Submission
1. Test app on multiple devices
2. Verify all features work offline
3. Check app performance
4. Test admin features
5. Verify CSV export functionality
6. Test data persistence
7. Validate form inputs
8. Check UI on different screen sizes
