# ZaryahPlus — Release Guide

How to ship a new version of the mobile app to App Store and Play Store.

## Prereqs (one-time)

- **Node 22+** (`nvm install 22 && nvm use 22`) — Capacitor CLI 8 requires this
- **JDK 21** — `brew install openjdk@21` (capacitor-android needs Java 21 source level)
- **Xcode** (App Store, latest)
- **Android Studio** OR `brew install --cask android-commandlinetools` + `sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"` (Play Store)
- **Apple Developer Program** account ($99/yr) — https://developer.apple.com
- **Google Play Console** account ($25 one-time) — https://play.google.com/console
- **Keystore file**: `android/zaryahplus-upload-key.jks` (already generated)
- **Keystore credentials**: `android/keystore.properties` (already generated — BACK THIS UP)

> ⚠️ **CRITICAL — Back up the keystore.** Copy `android/zaryahplus-upload-key.jks`
> AND `android/keystore.properties` to a secure place (1Password, encrypted USB).
> If you lose them, you can never publish updates to this Play Store listing
> again — you'd have to start a new app entry from scratch.

## Bundle ID & version policy

- Bundle ID: `com.zaryahplus.app` (do NOT change once published)
- Version is in three places — bump all three together for each release:
  1. `frontend/package.json` → `version`
  2. `frontend/android/app/build.gradle` → `versionCode` (integer, +1) and `versionName`
  3. `frontend/ios/App/App.xcodeproj/project.pbxproj` → `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION`

Play Store rejects uploads with a `versionCode` ≤ the previous one — always increment.

---

## Android — build & upload

### Build

```bash
cd frontend
nvm use 22
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
npm run release:android
```

Output: `frontend/android/app/build/outputs/bundle/release/app-release.aab` (~7.5 MB)

Tip: persist the env vars in `~/.zshrc` so future shells just run `npm run release:android`:
```bash
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
echo 'export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools' >> ~/.zshrc
```

### First-time Play Console setup

1. Go to https://play.google.com/console → Create app
2. App name: **ZaryahPlus** • Default language: English • Free • Mobile app
3. Fill out: Privacy Policy URL, Data Safety form, Content Rating quiz, Target audience, App access (provide test login if features are gated)
4. **Set up Play App Signing** (Setup → App integrity → Play App Signing). Upload the keystore certificate so Google can manage the production signing key. Our `zaryahplus-upload-key.jks` becomes the *upload* key — this is the recommended setup.
5. Upload the `app-release.aab` to **Internal testing** first (no review wait, instant install for testers via opt-in URL)
6. Promote: Internal → Closed → Open → Production
7. Production: ~3–7 day review on first submission, faster on subsequent

### Subsequent releases

1. Bump versions (see policy above)
2. `npm run release:android`
3. Upload AAB to the desired track in Play Console
4. Add release notes (max 500 chars)

---

## iOS — build & upload

### Prereqs

- Apple Developer Program enrolment complete
- In Xcode: Settings → Accounts → add your Apple ID
- Visit https://developer.apple.com/account/resources/identifiers → register `com.zaryahplus.app`

### Build

```bash
cd frontend
npm run release:ios
```

This builds the web app, syncs to iOS, and opens the project in Xcode.

In Xcode:

1. Select the **App** target → Signing & Capabilities
2. **Team**: pick your Developer Program team
3. **Bundle Identifier**: confirm `com.zaryahplus.app`
4. Top of window: change run destination to **Any iOS Device (arm64)**
5. **Product → Archive**
6. When the Organizer opens: **Distribute App → App Store Connect → Upload**
7. Sign with Apple distribution certificate (Xcode handles automatically)
8. Wait ~5–15 min for Apple to process the build

### App Store Connect

1. https://appstoreconnect.apple.com → My Apps → + → New App
2. Fill in: name (ZaryahPlus), primary language, bundle ID, SKU
3. Add the build to a version (it appears once Apple finishes processing)
4. **TestFlight tab**: invite internal testers, get a feel for the build
5. **App Information tab**: category (Lifestyle), privacy policy URL, content rights, age rating
6. **App Privacy questionnaire**: declare what data you collect (Firebase = analytics + identifiers)
7. **Pricing & Availability**: free or paid + countries
8. **Prepare for Submission**:
   - Screenshots (required iPhone sizes: 6.9" / 6.5" / 5.5"; iPad if supporting)
   - Description, keywords, support URL, marketing URL
   - Account deletion in-app (mandatory — Apple guideline 5.1.1(v))
9. Submit for Review (1–3 day average; can be longer on first submission)

---

## Common pitfalls

- **Apple rejects "web wrapper" apps** — we now bundle the web build (`webDir: 'dist'`). Keep enough native features (push, deep links, biometric auth) so the app demonstrably needs to be native.
- **Account deletion** — Apple requires this in-app for any app with accounts. Add a delete-account flow before submitting.
- **Privacy policy URL** — both stores require a public, working URL (e.g. `https://zaryahplus.com/privacy`).
- **Permission strings** — every iOS permission your app might trigger needs an Info.plist usage description. Already handled, but if you add new plugins (camera, contacts, etc) verify the string exists.
- **Versioning mistakes** — incrementing `versionCode` but forgetting `versionName` will pass Play but show users the same version label.
- **Capacitor sync** — always `npm run cap:sync` after changing native config (`capacitor.config.ts`, plugins, icons) so the native projects pick it up.

---

## File reference

- `capacitor.config.ts` — bundled mode, splash + status bar
- `android/zaryahplus-upload-key.jks` — Android upload signing key (NEVER commit)
- `android/keystore.properties` — keystore credentials (NEVER commit)
- `ios/App/App/Info.plist` — privacy strings, encryption export, orientation
- `frontend/dist/` — built web bundle (gitignored, regenerated by `vite build`)
