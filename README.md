# Class Check-In App

A cross-platform mobile and web application built with React Native and Expo for managing class check-ins. This app helps instructors track attendance and collect participant information efficiently.

## Features

- 📝 Class setup with name and schedule
- ✅ Attendee check-in with detailed information
- 📱 Cross-platform support (iOS, Android, Web)
- 💾 Local data storage
- 📊 Export attendance data to CSV
- 🔒 Admin-protected class management

## Tech Stack

- React Native
- Expo (SDK 49)
- TypeScript
- React Navigation
- AsyncStorage
- Expo File System
- Expo Build Properties
- Expo Document Picker

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Expo Go app (for mobile testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jjfcode/CheckInApp.git
cd CheckInApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

### Running the App

- Web: Press 'w' in the terminal or visit http://localhost:8085
- iOS: Scan QR code with Camera app
- Android: Scan QR code with Expo Go app
- Simulator/Emulator: Press 'a' for Android or 'i' for iOS

## Usage

1. **Class Setup**
   - Enter class name
   - Set start and end times
   - Press "Start Class"

2. **Check-In**
   - Fill in attendee details
   - Toggle interest in future classes
   - Submit check-in

3. **Attendee Management**
   - View all attendees
   - Export data to CSV (admin protected)
   - Start new class (admin protected)

## Admin Features

- Export to CSV: Protected with admin password
- New Class Creation: Protected with admin password
- Default admin password: "admin"

## Troubleshooting

### CSV Export Issues
- Ensure your device has proper storage permissions
- For Android 11+, use the system file picker when prompted
- On iOS, allow sharing permissions when requested
- If export fails, try using the Debug screen (available in development mode)

## Future Updates

The following features are planned for upcoming releases:

1. **Photo Check-In**: Capture attendee photos during the check-in process
2. **Welcome Messages**: Automatically send welcome messages to attendees upon check-in
3. **Company Information**: Enhanced company profile sharing between attendees
4. **Class Completion**: Send "Thank You for Attending" messages when closing a class
5. **Dark Mode Support**: Add theme switching for better accessibility and visual comfort
6. **QR Code Check-In**: Allow quick check-ins by scanning a QR code
7. **Offline Sync**: Improved offline capabilities with background synchronization
8. **Analytics Dashboard**: Visual reports and insights about attendance patterns
9. **Multi-language Support**: Internationalization for global audiences
10. **Calendar Integration**: Sync with popular calendar applications

## Version History

- v1.0.0 (May 2025):
  - Initial release
  - Basic check-in functionality
  - CSV export capability

## Created By

JJF Code © 2025

Version: 1.0.0

## License

This project is licensed under the MIT License. See the LICENSE file for details.
