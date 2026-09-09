# 🍺 Keg Tracking App

A Node.js web application for tracking beer kegs and other assets with complete inventory management capabilities.

## Features

✅ **Add/Edit/Delete Kegs** - Full CRUD operations
✅ **Track Location** - Move kegs between locations
✅ **Manage Quantity** - Add or remove units
✅ **Status Tracking** - Available, In Use, Maintenance
✅ **Transaction History** - Complete audit trail of all changes
✅ **Search & Filter** - Quick keg lookup
✅ **Statistics Dashboard** - Overview of keg status
✅ **SQLite Database** - Persistent data storage
✅ **Responsive UI** - Works on desktop and mobile

## Installation

### Prerequisites
- Node.js (v12 or higher)
- npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/maerbeia/keg-tracking-app.git
cd keg-tracking-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open in your browser:
```
http://localhost:3000
```

## Development

To run with auto-reload on file changes (requires nodemon):
```bash
npm run dev
```

## API Endpoints

### Kegs
- `GET /api/kegs` - Get all kegs
- `GET /api/kegs/:id` - Get single keg
- `POST /api/kegs` - Create new keg
- `PUT /api/kegs/:id` - Update keg
- `DELETE /api/kegs/:id` - Delete keg

### Transactions
- `GET /api/kegs/:id/history` - Get keg transaction history
- `POST /api/kegs/:id/transfer` - Transfer keg to new location
- `POST /api/kegs/:id/adjust` - Adjust keg quantity

## Database Schema

### kegs table
```
id (INTEGER PRIMARY KEY)
name (TEXT)
type (TEXT)
location (TEXT)
status (TEXT) - available, in-use, maintenance
quantity (INTEGER)
last_updated (DATETIME)
notes (TEXT)
```

### transactions table
```
id (INTEGER PRIMARY KEY)
keg_id (INTEGER FOREIGN KEY)
action (TEXT) - TRANSFER, ADD, REMOVE
quantity_changed (INTEGER)
from_location (TEXT)
to_location (TEXT)
timestamp (DATETIME)
user (TEXT)
notes (TEXT)
```

## Usage Examples

### Add a new keg
```bash
curl -X POST http://localhost:3000/api/kegs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPA Keg #1",
    "type": "IPA",
    "location": "Warehouse A",
    "quantity": 1,
    "notes": "Premium IPA"
  }'
```

### Transfer a keg
```bash
curl -X POST http://localhost:3000/api/kegs/1/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to_location": "Bar 1",
    "user": "John Doe",
    "notes": "Moved to main bar"
  }'
```

### Adjust quantity
```bash
curl -X POST http://localhost:3000/api/kegs/1/adjust \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_changed": -1,
    "user": "John Doe",
    "notes": "Keg depleted"
  }'
```

## Technologies Used

- **Backend**: Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Template Engine**: EJS

## License

ISC

## Author

maerbeia
