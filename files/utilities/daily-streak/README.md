# Daily Streak Tracker

A client-side JavaScript module that tracks daily visit streaks using multiple persistence layers for reliability. The module implements a secure, tamper-resistant streak counter that increments when users visit the site on consecutive days.

## Features

- **Daily Streak Logic**: Increments counter for consecutive daily visits, resets after missed days
- **Multi-Layer Persistence**: Falls back gracefully between Cache API and localStorage
- **Tamper Resistance**: Cryptographic signatures prevent client-side manipulation
- **Automatic Cleanup**: Removes script tag from DOM after execution
- **Fingerprint-Based Security**: Uses browser/OS characteristics to create unique identifiers

## How It Works

### Core Mechanism
1. **Initialization**: Checks if user has visited before using encrypted storage
2. **Date Comparison**: Compares last visit date with current date
3. **Streak Logic**:
   - Same day: No change
   - Consecutive day (yesterday): Increment streak
   - 2+ days gap: Reset to 1

### Storage Layers (in order of preference)
1. **Cache API**: Primary storage using Service Worker cache
2. **localStorage**: Fallback storage if Cache API fails
3. **Memory**: In-memory object if all storage fails

### Security Features
- **XOR Encryption**: Double Base64 encoding with XOR encryption
- **Hash Signatures**: Verifies data integrity with fingerprint-based signatures
- **Fingerprinting**: Uses user agent, language, and timezone to create unique identifiers
- **Singleton Pattern**: Prevents multiple simultaneous executions

## Integration

### Basic Usage
Add the script to your HTML:
```html
<script src="streak.js"></script>
```

### Accessing Streak Data
After execution, access the streak via:
```javascript
console.log(window.dailyStreak); // Returns current streak count
```

## Technical Details

### Data Structure
```javascript
{
  a: 5,        // Streak count (1-10000)
  b: "2024-01-01",  // Last visit date (ISO format)
  c: "abc123"  // Cryptographic signature
}
```

### Fingerprint Components
- User Agent String
- Browser Language
- Time Zone
- Hostname

### Normalization Rules
1. Invalid data → Reset to streak = 1
2. Streak > 10000 → Reset to 1
3. Invalid signature → Reset to 1
4. Date change → Apply streak logic

## Browser Requirements
- ES6+ compatible browser
- Support for:
  - `Symbol`
  - `localStorage`
  - `Cache API` (optional)
  - `document.currentScript`
  - `Intl.DateTimeFormat`

## Security Considerations
- Data is encrypted but not transmitted
- Fingerprinting is used for security, not tracking
- Maximum streak limit prevents overflow
- Self-contained execution prevents interference

## Notes
- The streak resets at midnight local time
- Multiple visits in one day don't increment the streak
- The module automatically removes its script tag from DOM
- Cache entries are hostname-specific