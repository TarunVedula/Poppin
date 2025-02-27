# Madison Bar Tracker - iOS App Design Specification

## App Structure
- Tab Bar Navigation with 3 tabs:
  1. Map View (Default)
  2. List View
  3. Profile/Login

## Screens

### Map View (Main Tab)
- Full-screen MapKit implementation
- Customized map annotations using SF Symbols:
  - "circle.fill" for bars, colored based on occupancy
  - Green: < 80% full
  - Orange: 80-99% full
  - Red: 100% full
- Bottom sheet (like Apple Maps) showing bar details when marker is tapped
- Live occupancy count with circular progress indicator
- Pull to refresh for latest updates
- Location services integration for "Near Me" functionality

### List View (Second Tab)
- UITableView with custom cells
- Each cell shows:
  - Bar name (bold SF Pro Display)
  - Address (SF Pro Text)
  - Occupancy indicator using UIProgressView
  - Current count/capacity
- Segmented control at top for sorting options:
  - Distance
  - Occupancy
  - Alphabetical
- Search bar for filtering bars
- Pull to refresh

### Bar Owner Interface
- Login screen with:
  - Large app logo
  - Clean form fields using standard iOS text fields
  - Sign in with Apple option
  - Biometric authentication
- Bar Management screen:
  - Large occupancy counter with stepper controls
  - Quick preset buttons (Empty, Half, Full)
  - Capacity limit warning
  - Haptic feedback when updating counts

## Native iOS Features
- MapKit for mapping
- Core Location for user positioning
- Push notifications for capacity alerts
- Haptic feedback for interactions
- SF Symbols for consistent iconography
- Dark mode support
- iPad support with split view
- iOS widgets showing favorite bars' status

## User Experience
- Smooth animations between views
- Native gesture support
- Haptic feedback for important actions
- Pull-to-refresh for data updates
- Clear loading states with activity indicators
- Error handling with native alert controllers

## Key Differences from Web App
1. Bottom tab navigation instead of top menu
2. Native map interactions
3. More gesture-based interactions
4. iOS-specific UI components
5. Offline support with local data caching
6. Push notifications
7. Widgets and App Clips support

## Security
- Keychain for credential storage
- App Transport Security (ATS) for secure communication
- Biometric authentication option
