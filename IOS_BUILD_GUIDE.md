# Paletta - iOS App Store Build Guide

This guide walks you through building and submitting Paletta to the iOS App Store.

## Features

Paletta is a comprehensive color palette app with features similar to Coolors.co:

- **Generate Palettes** - Create harmonious 5-color palettes for various use cases (branding, UI design, interior, fashion, etc.)
- **Explore Curated Palettes** - Browse a collection of hand-picked and algorithmically generated palettes
- **Visualizer** - See your palettes applied to real UI mockups (mobile apps, dashboards, cards, emails, websites)
- **Gradient Creator** - Build custom linear, radial, and conic gradients with multiple color stops
- **Image Color Extractor** - Upload or select images to extract dominant colors automatically
- **Save & Organize** - Save your favorite palettes for quick access
- **Native iOS Experience** - Haptic feedback, native share sheets, secure storage

## Prerequisites

1. **Mac with macOS** - Required for iOS development
2. **Xcode** - Install from the Mac App Store (latest version recommended)
3. **Apple Developer Account** - $99/year at [developer.apple.com](https://developer.apple.com)
4. **Node.js** - v18 or higher
5. **CocoaPods** - Install via `sudo gem install cocoapods`

## Step 1: Clone and Install Dependencies

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd paletta

# Install dependencies
npm install
\`\`\`

## Step 2: Initialize Capacitor

\`\`\`bash
# Initialize Capacitor (first time only)
npx cap init Paletta com.paletta.app --web-dir=out

# Add iOS platform
npx cap add ios
\`\`\`

## Step 3: Build the Web App

\`\`\`bash
# Build the Next.js app for static export
npm run build
\`\`\`

This creates the `out/` directory with your static app.

## Step 4: Sync with iOS

\`\`\`bash
# Sync web assets to iOS project
npx cap sync ios
\`\`\`

## Step 5: Open in Xcode

\`\`\`bash
# Open the iOS project in Xcode
npx cap open ios
\`\`\`

Or run the combined command:
\`\`\`bash
npm run build:ios
\`\`\`

## Step 6: Configure Xcode Project

### Signing & Capabilities
1. Select the **App** target in Xcode
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. Ensure **Automatically manage signing** is checked
5. The Bundle Identifier should be `com.paletta.app`

### App Icons
1. In Xcode, go to **Assets.xcassets** → **AppIcon**
2. Add your app icons in all required sizes:
   - 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt (various scales)
3. Use a tool like [App Icon Generator](https://appicon.co/) to generate all sizes

### Launch Screen
1. Go to **LaunchScreen.storyboard**
2. Customize the launch screen design
3. Or configure a splash screen image in `capacitor.config.ts`

### Info.plist Settings
The following are already configured, but verify:
- `UIViewControllerBasedStatusBarAppearance`: YES
- `UIStatusBarStyle`: UIStatusBarStyleDefault

## Step 7: Test on Simulator/Device

### Simulator
1. Select a simulator from the device dropdown in Xcode
2. Click **Run** (⌘R)

### Physical Device
1. Connect your iPhone via USB
2. Trust the computer on your device
3. Select your device from the dropdown
4. Click **Run** (⌘R)

## Step 8: Prepare for App Store Submission

### Create App Store Connect Record
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Paletta
   - Primary Language: English
   - Bundle ID: com.paletta.app
   - SKU: paletta-001

### Prepare Metadata
- **App Description**: Describe your app's features
- **Keywords**: color, palette, design, aesthetic, branding, UI
- **Screenshots**: Required for all supported device sizes
- **App Preview**: Optional video demonstration
- **Privacy Policy URL**: Required for apps that collect any data

### Archive and Upload
1. In Xcode, select **Any iOS Device** as the build target
2. Go to **Product** → **Archive**
3. Once archiving completes, click **Distribute App**
4. Select **App Store Connect** → **Upload**
5. Follow the prompts to upload

### Submit for Review
1. In App Store Connect, go to your app
2. Select the uploaded build
3. Fill in all required information
4. Click **Submit for Review**

## Capacitor Plugins Used

The app uses these native Capacitor plugins:

| Plugin | Purpose |
|--------|---------|
| `@capacitor/haptics` | Native haptic feedback on interactions |
| `@capacitor/clipboard` | Native clipboard access |
| `@capacitor/share` | Native share sheet |
| `@capacitor/preferences` | Native secure storage |
| `@capacitor/status-bar` | Status bar styling |
| `@capacitor/splash-screen` | Launch screen handling |
| `@capacitor/keyboard` | Keyboard handling |

## Troubleshooting

### Build Errors
\`\`\`bash
# Clean and rebuild
rm -rf out .next
npm run build
npx cap sync ios
\`\`\`

### Pod Issues
\`\`\`bash
cd ios/App
pod deintegrate
pod install
cd ../..
\`\`\`

### Signing Issues
- Ensure your Apple Developer account is active
- Verify the Bundle ID matches App Store Connect
- Check that certificates and provisioning profiles are valid

## Updates

To update your app after changes:

\`\`\`bash
# Build and sync
npm run build
npx cap sync ios

# Open Xcode and archive
npx cap open ios
\`\`\`

Then create a new archive and upload to App Store Connect.

## App Store Guidelines

Ensure your app complies with Apple's guidelines:
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Support

For Capacitor-specific issues:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor GitHub Issues](https://github.com/ionic-team/capacitor/issues)
