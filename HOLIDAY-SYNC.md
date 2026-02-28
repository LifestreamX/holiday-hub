# Holiday Sync Guide

This project uses the [Nager.Date API](https://date.nager.at/) to fetch public holiday data for various countries.

## Quick Start

To sync holidays for a specific country and year, run:

```bash
node scripts/sync-holidays.js [countryCode] [year]
```

### Examples

```bash
# Sync US holidays for 2026 (default)
node scripts/sync-holidays.js

# Sync UK holidays for 2026
node scripts/sync-holidays.js GB 2026

# Sync Canada holidays for 2027
node scripts/sync-holidays.js CA 2027

# Sync multiple years
node scripts/sync-holidays.js US 2026
node scripts/sync-holidays.js US 2027
```

## Supported Countries

Nager.Date supports many countries. Common country codes include:

- `US` - United States
- `GB` - United Kingdom
- `CA` - Canada
- `AU` - Australia
- `DE` - Germany
- `FR` - France
- `IT` - Italy
- `ES` - Spain
- `JP` - Japan
- `IN` - India
- `BR` - Brazil
- `MX` - Mexico

For a full list, visit: https://date.nager.at/Country

## How It Works

1. The script fetches holiday data from the Nager.Date API
2. Converts the data to match our database schema
3. Creates new holidays or updates existing ones
4. Holidays are stored with:
   - Name and description
   - Category (federal, bank, school, etc.)
   - Rule type (fixed or calculated)
   - Date information (month/day for fixed holidays)
   - Country code

## API Route

You can also sync holidays via the web API (requires authentication):

```bash
POST /api/holidays/sync
Content-Type: application/json

{
  "countryCode": "US",
  "year": 2026
}
```

## Notes

- Fixed holidays (same date every year) are stored with month and day
- Calculated holidays (like Easter, Good Friday) are marked as calculated
- The system will automatically determine the correct date for each year
- Syncing is idempotent - running it multiple times won't create duplicates
