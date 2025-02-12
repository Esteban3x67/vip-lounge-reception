# VIP Lounge Reception Tool

## Overview
Web application designed to help reception staff manage passenger flow, track capacity, and monitor flight status at the VIP lounge. This tool replaces the current Excel-based system with an automated, real-time solution.

## Key Features

### Dashboard View
- Real-time lounge occupancy tracking
- Staff on duty display
- Passenger categorization (Priority Pass/Lounge Key/SkyTeam)
- Active shower list monitoring
- Task notifications for staff
  - 4-hour limit warnings
  - Shower status checks
  - Flight announcements

### Passenger Management
- Entry registration from Inflybo system
- 4-hour stay limit tracking
- Flight status monitoring
- Automatic departure time updates
- Status tracking (checked out/renewal/called)

### Data Management
- Monthly passenger data view
- Offline functionality
- Historical data maintenance
- Special tracking for specific airlines

## Technical Requirements

### Backend
- Flask (Python)
- SQLite database
- Web scraping for flight information
- Real-time updates system

### Frontend
- React
- IndexedDB for offline storage
- Rich UI with charts and visualizations
- Multiple view interface

## Access Methods
Passengers can enter the lounge through:
- Priority Pass
- Lounge Key
- SkyTeam Alliance Elite Plus status
- Business class passengers from alliance airlines

## System Integration
The tool integrates with:
- Inflybo (Global Lounge platform)
- LAMS (SkyTeam system)
- Airport flight information

## Data Structure
Main tracking fields:
- Reception staff initials
- Passenger name
- Flight code
- Arrival time
- 4-hour limit time
- Flight departure time
- Status updates


/////////////UPDATE - 11 FEB 2025 /////////////////

# VIP Lounge Reception Tool

## New Features: Dashboard View and Shower Management System


### Shower TAB
- Added Shower tab to enter PAX.
- Ability to give priority if PAX is fliying with SKYTEAM.

### Dashboard Integration
- Stay Limit table with the 10 next to leave PAX
- Real-time shower status monitoring
- Integrated with main dashboard
- Quick status updates and PAX assignment

### Features
- Queue management with priority system
- Automatic timer warnings (20+ minutes)
- Cleaning status tracking
- Smart shower assignment
- Name truncation for long names

### Usage
1. Add PAX to shower queue (normal or priority)
2. Assign available showers
3. Monitor usage time
4. Mark as finished when PAX leaves
5. Track cleaning status
6. Assign next PAX when ready

### Installation
[Your existing installation instructions]

### Contributing
[Your existing contribution guidelines]

### Version
1.1.2 [Dashboard (Inflybo, Shower), Inflybo TAB, Shower TAB]

## Project Status
🚧 Under Development

## License
MIT License
