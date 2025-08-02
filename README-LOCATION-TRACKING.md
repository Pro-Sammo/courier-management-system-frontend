# Agent Location Tracking Implementation

## Overview

This document explains the implementation of real-time agent location tracking in the Courier Management System. The system uses WebSockets to send the agent's current position to the backend in real-time.

## Components

### 1. LocationTracker Component

A new component has been created at `src/components/agent/LocationTracker.tsx` that provides:

- A UI for agents to start/stop location tracking
- Automatic location updates every 30 seconds when active
- Visual indicators of tracking status
- Error handling for location permission issues

### 2. Socket Service

The `socketService.ts` handles WebSocket communication with the backend:

- `updateAgentLocation(location)` method emits the "update-agent-location" event with coordinates and timestamp
- This corresponds to the backend's "location_update" event listener

### 3. Navigation Service

The `NavigationService` in `navigation.ts` provides:

- `getCurrentLocation()` method to access the browser's geolocation API
- Error handling for geolocation permission issues

### 4. Socket Context

The `SocketContext` provides:

- Connection management with the backend
- Exposes the `updateAgentLocation` method to components
- Maintains connection status

## Integration

The `LocationTracker` component has been integrated into the `AgentLayout` component, making it available across all agent pages.

## How It Works

1. When an agent clicks "Start Tracking", the component:
   - Sets up an interval to run every 30 seconds
   - Immediately gets and sends the current location
   - Updates the UI to show tracking is active

2. Every 30 seconds while active:
   - Gets the current location using `NavigationService.getCurrentLocation()`
   - Sends the location to the backend using `socketService.updateAgentLocation()`
   - Updates the last update timestamp

3. When the agent clicks "Stop Tracking" or when an error occurs:
   - Clears the interval
   - Updates the UI to show tracking is inactive

4. The backend receives the location updates via the "location_update" event and can:
   - Broadcast the location to relevant users (e.g., customers tracking their parcels)
   - Store the location data for historical tracking
   - Update parcel status based on agent location

## Backend Integration

The frontend emits "update-agent-location" events that correspond to the backend's "location_update" event listener. The backend can then broadcast this information to relevant users via the "agent_location_update" event.

## Future Improvements

1. Add battery optimization settings
2. Implement variable update frequency based on movement
3. Add offline caching of location updates
4. Implement geofencing for automatic status updates