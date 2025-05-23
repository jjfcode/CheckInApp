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
- Expo
- TypeScript
- React Navigation
- AsyncStorage
- Expo File System

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

## Created By

JJF Code © 2025

Version: 1.0.0
