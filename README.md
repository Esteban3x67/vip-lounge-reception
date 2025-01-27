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

## Project Status
🚧 Under Development

## License
MIT License
