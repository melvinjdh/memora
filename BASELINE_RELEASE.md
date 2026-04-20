## Memora Baseline

Date: 2026-04-21

### Scope

- Verified React + Vite + TypeScript web build
- Verified Capacitor Android sync and debug build
- Improved protected-route redirects and admin refresh handling
- Fixed museum calendar selection for today's date
- Improved mobile admin access from header
- Improved tour guide booking dialog reset behavior
- Added route-level lazy loading to reduce initial web bundle size
- Polished small UX issues on tickets, footer placeholders, and museum cards

### Key Commands

```bash
npm run dev
npm run build
npm run android:doctor
npm run android:sync
npm run android:open
```

### Android Notes

- Android Studio path on this laptop: `D:\android\bin\studio64.exe`
- Android SDK path on this laptop: `C:\Users\ACER\AppData\Local\Android\Sdk`
- Java 21 is required for the current Android build

### Artifacts

- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Remaining Nice-to-Haves

- Manual browser click-through on all user journeys
- Further split admin/chart dependencies if faster first-load is needed
- Replace demo/localStorage persistence with real backend when ready
