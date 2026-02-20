# Technology Stack & Build System

## Core Framework

- **React Native**: 0.81.5 with New Architecture enabled
- **Expo**: ~54.0.30 (managed workflow)
- **React**: 19.1.0
- **TypeScript**: ~5.9.2 with strict mode enabled

## UI & Design System

- **Gluestack UI**: v1.1.73 (primary component library)
- **Gluestack Style**: Custom design tokens and theming
- **Lucide React Native**: Icon library
- **React Native Reanimated**: v4.1.5 for animations
- **Expo Linear Gradient**: Gradient components

## Navigation & State

- **React Navigation**: v7 (Native Stack + Bottom Tabs)
- **Zustand**: v5.0.9 for state management (preferred over Redux)
- **Custom Hooks**: Data fetching and business logic abstraction

## API & Data

- **HTTP Client**: Native Fetch API (not Axios despite dependency)
- **API Architecture**: RESTful with structured error handling
- **Data Transformation**: Backend-to-frontend model mapping
- **Auto-refresh**: Intelligent intervals for real-time data

## Development Tools

- **Babel**: Expo preset with Reanimated plugin
- **Environment Variables**: Expo public variables for configuration
- **Platform Detection**: Dynamic API URL configuration
- **Debug Utilities**: Network testing and data validation tools

## Common Commands

### Development
```bash
# Start development server
npm start
# or
expo start

# Platform-specific development
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device  
npm run web        # Web browser
```

### Environment Setup
```bash
# Install dependencies
npm install

# Environment variables (create .env file)
EXPO_PUBLIC_API_URL=http://your-api-url/api/v1
EXPO_PUBLIC_API_TIMEOUT=10000
```

### Platform-Specific API URLs
- **Android Emulator**: `http://10.0.2.2:8080/api/v1`
- **iOS Simulator**: `http://localhost:8080/api/v1`
- **Physical Devices**: Use machine IP (e.g., `http://192.168.0.103:8080/api/v1`)

## Build Configuration

- **TypeScript Config**: Extends Expo base with strict mode
- **Babel Config**: Expo preset + Reanimated plugin
- **App Config**: Portrait orientation, edge-to-edge Android, tablet support
- **Asset Management**: Adaptive icons, splash screens, favicon

## Performance Considerations

- **Bundle Size**: Managed Expo workflow for optimized builds
- **Memory Management**: AbortController for request cancellation
- **Cache Strategy**: Warmup on app initialization
- **Auto-refresh**: Configurable intervals (30s indices, 60s stocks)

## Development Workflow

1. Use Expo development build for testing
2. Environment-specific API configuration
3. Debug utilities available in development mode
4. Hot reload enabled for rapid development
5. TypeScript strict mode for type safety