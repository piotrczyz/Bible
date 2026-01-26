# PWA vs Capacitor Evaluation for Scripture App

> **Date:** 2026-01-26
> **Status:** Evaluation Complete - PWA Recommended

## Executive Summary

After investigating the codebase and researching PWA capabilities, **PWA is recommended** for the Scripture Bible Reader app. The current codebase has no Capacitor implementation (only planned), and the app's requirements align well with PWA capabilities.

## Current State Analysis

### What Exists
- Next.js static export (`output: 'export'`)
- Firebase Hosting deployment
- 5 Bible translations (~32MB total)
- Client-side only (no backend)
- localStorage for settings
- In-memory caching for Bible data

### What Doesn't Exist Yet
- No Capacitor configuration
- No iOS/Android projects
- No service worker
- No web app manifest
- No native dependencies

**Key Finding:** Capacitor was planned but never implemented. The app is already a static web app suitable for PWA.

## PWA Storage Limits Research

### iOS Safari Limits

| Storage Type | Limit | Notes |
|--------------|-------|-------|
| Cache API | ~50MB (may be 1GB in newer versions) | Hard limit per origin |
| IndexedDB | Up to 500MB | Depends on free disk space |
| localStorage | 5MB | Not suitable for Bible data |

### Critical iOS Behavior

**7-Day Eviction Policy:**
- Safari clears Cache API and IndexedDB after 7 days of non-use
- **Exception:** Installed PWAs (added to home screen) are exempt
- This means users who install the app won't lose cached Bible data

### Android/Chrome Limits
- Much more generous (~60% of disk space)
- No time-based eviction
- Better PWA support overall

## Storage Feasibility for Bible App

| Bible Version | Size | Cumulative |
|---------------|------|------------|
| KJV | 4.4MB | 4.4MB |
| WEB | 4.3MB | 8.7MB |
| BG | 7.9MB | 16.6MB |
| UBG | 7.8MB | 24.4MB |
| ASV | 8.1MB | 32.5MB |

**Verdict:** All 5 versions fit within iOS IndexedDB limit (500MB) and Cache API (50-1GB).

## PWA vs Capacitor Comparison

### PWA Advantages

| Benefit | Description |
|---------|-------------|
| **No native maintenance** | No Xcode, Android Studio, or native project updates |
| **No app store fees** | Saves $99/year (Apple) + $25 (Google) |
| **Instant updates** | Deploy to web, users get updates immediately |
| **Simpler CI/CD** | Just deploy a web app |
| **Smaller footprint** | No native build tooling required |
| **Single codebase** | True single codebase (Capacitor requires native config) |

### PWA Limitations

| Limitation | Impact for Scripture App |
|------------|-------------------------|
| **iOS Safari restrictions** | **Low** - Storage limits sufficient |
| **No App Store presence** | **Medium** - Reduced discoverability |
| **Install prompt UX** | **Low** - Can show custom banner |
| **Push notifications** | **N/A** - Not in scope |
| **Background sync** | **N/A** - Not needed (read-only) |

### Capacitor Advantages (If Needed Later)

| Benefit | Description |
|---------|-------------|
| App Store presence | Discoverable in App Store/Play Store |
| Native APIs | Biometrics, file system, etc. |
| Push notifications | Reliable delivery |
| No storage limits | Native SQLite, file system |

### When Capacitor Would Be Needed

1. App Store presence becomes critical for distribution
2. Push notifications for daily verses
3. Complex offline sync (bookmarks across devices)
4. Native payment integration
5. Biometric authentication

## POC Implementation

### Files Created

```
public/
├── manifest.json       # Web app manifest
└── sw.js              # Service worker

components/
└── pwa-register.tsx   # Service worker registration
```

### What the POC Does

1. **Web App Manifest** (`manifest.json`)
   - Enables "Add to Home Screen"
   - Defines app name, icons, theme colors
   - Sets standalone display mode (no browser chrome)

2. **Service Worker** (`sw.js`)
   - **Cache-first strategy** for static assets (app shell, CSS, JS)
   - **On-demand caching** for Bible data files
   - **Offline fallback** returns cached home page
   - **Update detection** with user notification
   - **Message API** for pre-caching Bible versions

3. **Registration Component** (`pwa-register.tsx`)
   - Registers service worker on mount
   - Detects and notifies user of updates
   - Handles skip-waiting for immediate updates

### Caching Strategy

```
┌─────────────────────────────────────────────────┐
│  Request Flow                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Static Assets (JS, CSS, images)                │
│    → Check Cache → Found? Return : Fetch & Cache│
│                                                 │
│  Bible Data (/bibles/*.json)                    │
│    → Check Cache → Found? Return : Fetch & Cache│
│                                                 │
│  Navigation (/)                                 │
│    → Check Cache → Found? Return : Fetch        │
│    → Offline? Return cached home                │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Recommendation

### Primary Recommendation: PWA

For the current MVP scope (Bible navigation, reading, themes), **PWA is the right choice** because:

1. **No native features needed** - Reading text doesn't require native APIs
2. **Storage is sufficient** - 32MB of Bible data fits within limits
3. **Simpler maintenance** - No Xcode/Android Studio required
4. **Instant updates** - Critical for bug fixes
5. **Lower barrier** - Users can start using immediately
6. **Already architected for it** - Static export, no backend

### Hybrid Option (Future)

If App Store presence becomes important later, you can:
1. Keep PWA as primary distribution
2. Wrap with Capacitor for App Store (minimal effort)
3. Use same codebase for both

This gives you the best of both worlds without committing to Capacitor complexity now.

### Migration Path

```
Current State → PWA (Now) → Capacitor (If Needed)
     │              │              │
     ▼              ▼              ▼
Static Next.js   Add SW +       Wrap in
Firebase Host    Manifest        Capacitor
```

## Action Items for Full PWA Implementation

### Required (MVP)
- [x] Create web app manifest
- [x] Create service worker
- [x] Register service worker
- [x] Add manifest to metadata

### Recommended (Polish)
- [ ] Create 192x192 and 512x512 icons for better PWA compliance
- [ ] Add maskable icons for Android
- [ ] Create install prompt component
- [ ] Add offline indicator UI
- [ ] Test on iOS Safari and Android Chrome

### Optional (Enhanced)
- [ ] Pre-cache user's selected Bible version
- [ ] Add background sync for future bookmarks
- [ ] Implement share target for receiving shared verses
- [ ] Add shortcuts in manifest for quick access

## Testing Checklist

Before going live with PWA:

- [ ] Test install on iOS Safari
- [ ] Test install on Android Chrome
- [ ] Verify offline reading works
- [ ] Check storage usage doesn't exceed limits
- [ ] Test update flow
- [ ] Lighthouse PWA audit (aim for 100)
- [ ] Test on slow 3G network

## Sources

- [PWA iOS Limitations - Brainhub](https://brainhub.eu/library/pwa-on-ios)
- [WebKit Storage Policy Updates](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [MDN Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [web.dev Storage Guide](https://web.dev/articles/storage-for-the-web)
- [Capacitor PWA Documentation](https://capacitorjs.com/docs/web/progressive-web-apps)
- [PWA iOS Limitations - MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)

---

*This evaluation was conducted on 2026-01-26 for the Scripture Bible Reader project.*
