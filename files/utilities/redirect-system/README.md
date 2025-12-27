# Zunalita Redirect Alpha

This is a minimal URL redirection service that operates entirely client-side. It uses a custom encoding scheme to shorten URLs and redirect users without server-side processing.

## How It Works

1. **URL Encoding**: The service applies a character replacement map and Base64 encoding to create shortened URL parameters
2. **Redirection**: When a user visits a link with the encoded parameter (`?c=...`), the JavaScript decodes it and performs an immediate redirect
3. **Fallback Mode**: An optional `?f=true` parameter enables referrer-based redirection when the primary parameter is missing

## Technical Details

- **Character Mapping**: Common URL parts (`https://`, `http://`, `www.`, `.com`, `.org`, `.net`) are replaced with single-character tokens
- **Base64 Encoding**: The transformed URL is Base64 encoded with URL-safe character replacements (`+` → `-`, `/` → `_`)
- **Normalization**: URLs are normalized by removing protocols, `www.` prefixes, trailing slashes, and converting to lowercase
- **Client-Side Only**: All processing occurs in the browser; no server-side components are required

## Usage

### Creating a Redirect Link
```javascript
// Example: Generate a redirect link for https://example.com
gen("https://example.com");
```

### Redirect Parameters
- `?c=[encoded_url]` - Primary redirect parameter containing the encoded destination URL
- `?f=true` - Enables fallback mode that attempts to extract the redirect URL from the HTTP referrer

### Requirements
- JavaScript must be enabled in the browser
- Modern browser with support for `URLSearchParams`, `btoa()`, and `atob()`