# Gravy Wallet — Plan A: Setup + Brand Rename

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Start from zero and end with a fully renamed Gravy Wallet fork that builds and runs on both iOS and Android, with new bundle IDs, app name, icons, splash, deep-link scheme, and Firebase project.

**Architecture:** Fork Trustee Wallet → scrub git history → clone locally → verify upstream builds → run automated rename → manually patch missed spots → replace assets → strip Branch.io / Sentry / Telegram tokens → green build on both platforms.

**Tech Stack:** React Native 0.73.6, Node 20, Ruby 3.1+, CocoaPods 1.14+, Xcode 15+, Android Studio Hedgehog / Gradle 8, JDK 17, `react-native-rename`, `git-filter-repo`.

**Reference spec:** [`docs/superpowers/specs/2026-05-18-gravy-wallet-design.md`](../specs/2026-05-18-gravy-wallet-design.md)

**Scope:** Covers Phases 0 + 1 of the spec. Out of scope: pruning unused modules (Plan B), backend (Plan C), swap module (Plan D), distribution (Plan E).

---

## Pre-flight: prerequisites the user must do manually

These need human action before the plan can execute. Verify each before Task 1.

- [ ] **GitHub:** Create empty private repo `dvvolkovv/gravy-wallet` (no README, no .gitignore, no license — we'll push from local). Confirmed at `https://github.com/dvvolkovv/gravy-wallet`.
- [ ] **Firebase:** Create new Firebase project at https://console.firebase.google.com/ named `gravy-wallet`. Add two iOS apps (`app.gravywallet`, `app.gravywallet.dev`) and two Android apps (`app.gravywallet`, `app.gravywallet.dev`). Download `GoogleService-Info.plist` (2 files) and `google-services.json` (2 files) — save to `~/Downloads/gravy-firebase/`.
- [ ] **App Store Connect:** Sign in at https://appstoreconnect.apple.com/ with the GsmSoft GmbH account. Create two new app entries: "Gravy Wallet" (`app.gravywallet`) and "Gravy Wallet Dev" (`app.gravywallet.dev`). SKU can be anything (e.g., `gravywallet-prod`, `gravywallet-dev`). Don't fill metadata yet — just reserve the bundle IDs.
- [ ] **Icon asset:** Have one 1024×1024 PNG master icon ready at `~/Downloads/gravy-icon-1024.png`. (If not designed yet — can use placeholder solid color + text "G" for now; replace before public release.)
- [ ] **Splash asset:** One 1242×2436 PNG splash at `~/Downloads/gravy-splash.png` (placeholder OK).
- [ ] **Tooling:**
  ```bash
  node --version    # ≥ 20.x
  ruby --version    # ≥ 3.1
  pod --version     # ≥ 1.14
  brew install git-filter-repo
  npm i -g react-native-rename @bam.tech/react-native-make
  ```
  Confirm each command returns expected version.

---

## Task 1: Clone Trustee Wallet, scrub history, push to our private repo

**Files:**
- Create: `~/Downloads/gravy-wallet/` (new directory)
- Create: `~/Downloads/dexwallet/scripts/scrub-history.sh` (one-shot, throwaway after run)

**Goal:** End up with `~/Downloads/gravy-wallet/` containing all Trustee code, but with secrets scrubbed from git history, pushed to `dvvolkovv/gravy-wallet` as the sole remote.

- [ ] **Step 1: Clone Trustee Wallet into a temporary scratch location**

```bash
cd ~/Downloads
git clone https://github.com/trustee-wallet/trusteeWallet.git gravy-wallet-scratch
cd gravy-wallet-scratch
```

Expected: clone completes, `git log --oneline | head -5` shows commits from 2024 and earlier. `wc -l app/config/changeable.prod.js` shows several hundred lines (this is where secrets live).

- [ ] **Step 2: Find the secret patterns to scrub**

```bash
cd ~/Downloads/gravy-wallet-scratch
grep -n "TELEGRAM_BOT_TOKEN\|bot[0-9]*:" app/config/changeable.prod.js || true
grep -rn "trustee\.deals" app/config/ | head -20
grep -rn "BRANCH_KEY\|branch_key" ios/ android/ 2>/dev/null | head -10
```

Note: copy the actual secret strings you find. They go into the replacements file in Step 3.

- [ ] **Step 3: Build the replacements file for git-filter-repo**

Create `~/Downloads/gravy-replacements.txt` with one line per secret to scrub. Format: `LITERAL==>REPLACEMENT`. Example (replace the actual values with what you found in Step 2):

```
bot1234567890:AAA-BBB-CCC-DDD-actualtoken-here==>***REMOVED***
12345678==>***REMOVED***
https://api.v3.trustee.deals==>***REMOVED***
https://exchange.trustee.deals==>***REMOVED***
```

Include every distinct secret you found. The `==>` is the literal separator git-filter-repo expects.

- [ ] **Step 4: Run git-filter-repo to rewrite history**

```bash
cd ~/Downloads/gravy-wallet-scratch
git filter-repo --replace-text ~/Downloads/gravy-replacements.txt --force
```

Expected: rewrites all commits, takes 30-60s, output ends with `Completely finished after N.NNN seconds.`

- [ ] **Step 5: Rename scratch directory to final name**

```bash
mv ~/Downloads/gravy-wallet-scratch ~/Downloads/gravy-wallet
cd ~/Downloads/gravy-wallet
```

- [ ] **Step 6: Verify secrets are gone from history**

```bash
cd ~/Downloads/gravy-wallet
git log -p --all | grep -i "telegram_bot_token" | head -5
git log -p --all | grep -i "trustee\.deals" | head -5
```

Expected: no output (or only `***REMOVED***`). If real tokens still appear, fix the replacements file and re-run Step 4.

- [ ] **Step 7: Set our private repo as the sole remote and push**

```bash
cd ~/Downloads/gravy-wallet
git remote remove origin
git remote add origin git@github.com:dvvolkovv/gravy-wallet.git
git push -u origin master
git push -u origin --tags
```

Expected: push succeeds. Verify on GitHub that the repo now has Trustee's code minus secrets.

- [ ] **Step 8: Rename default branch from `master` to `main`**

```bash
cd ~/Downloads/gravy-wallet
git branch -m master main
git push -u origin main
gh repo edit dvvolkovv/gravy-wallet --default-branch main
git push origin --delete master
```

Expected: GitHub now shows `main` as default; `master` deleted.

- [ ] **Step 9: Delete the scrub-replacements file (contains secrets in plaintext)**

```bash
rm ~/Downloads/gravy-replacements.txt
```

- [ ] **Step 10: Commit the design doc + this plan into the repo**

```bash
mkdir -p ~/Downloads/gravy-wallet/docs/superpowers
cp -r ~/Downloads/dexwallet/docs/superpowers/specs ~/Downloads/gravy-wallet/docs/superpowers/
cp -r ~/Downloads/dexwallet/docs/superpowers/plans ~/Downloads/gravy-wallet/docs/superpowers/
cd ~/Downloads/gravy-wallet
git add docs/
git commit -m "docs: add Gravy Wallet design spec and Plan A"
git push
```

Expected: docs/ folder visible on GitHub.

---

## Task 2: Workspace setup and dependency install

**Files:**
- Modify: `~/Downloads/gravy-wallet/.nvmrc` (may not exist; create if missing)

**Goal:** Get all JS and CocoaPods dependencies installed cleanly.

- [ ] **Step 1: Check Node version requirement**

```bash
cd ~/Downloads/gravy-wallet
cat package.json | grep -A2 "\"engines\""
ls .nvmrc 2>/dev/null && cat .nvmrc || echo "no .nvmrc"
```

If Trustee specifies a Node version (e.g., `>=18`), use that. RN 0.73 officially supports Node 18+; we'll target Node 20 LTS.

- [ ] **Step 2: Pin Node version**

```bash
echo "20" > ~/Downloads/gravy-wallet/.nvmrc
nvm use 20 || nvm install 20
node --version    # should be v20.x
```

- [ ] **Step 3: Install npm packages**

```bash
cd ~/Downloads/gravy-wallet
rm -rf node_modules package-lock.json
npm install
```

Expected: completes in 2-5 minutes. May emit deprecation warnings for old deps — ignore for now. `postinstall` hook runs `jetifier` and `patch-package` — let it complete.

If npm fails on the BlockSoftLab-forked git deps (some have invalid URLs after years), fix `package.json` to point to working forks or remove the dep temporarily (note in PR — re-evaluate during Plan B prune).

- [ ] **Step 4: Install iOS CocoaPods**

```bash
cd ~/Downloads/gravy-wallet/ios
pod install --repo-update
```

Expected: completes in 3-8 minutes (first time, slow). Outputs `Pod installation complete!`.

If pods fail due to incompatible iOS deployment target — bump `IPHONEOS_DEPLOYMENT_TARGET` in `ios/Podfile` (try 13.4 → 14.0).

- [ ] **Step 5: Commit any tooling fixes**

```bash
cd ~/Downloads/gravy-wallet
git add .nvmrc package.json package-lock.json ios/Podfile ios/Podfile.lock
git status      # review changes
git commit -m "chore: pin Node 20, install deps, fix iOS deployment target"
git push
```

If no changes — skip commit, just `git status` to confirm clean.

---

## Task 3: Verify Android baseline build (Trustee branding still)

**Goal:** Confirm the forked Trustee codebase builds and runs on Android **before** we touch any branding. If it doesn't build here, fix it now while there are no rename-related variables.

- [ ] **Step 1: Confirm Android SDK + JDK 17**

```bash
echo $ANDROID_HOME    # should point to ~/Library/Android/sdk or similar
java -version 2>&1 | head -1    # should be "openjdk version \"17..."
```

If JDK is wrong: `brew install openjdk@17 && echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc && source ~/.zshrc`.

- [ ] **Step 2: List available Android devices/emulators**

```bash
~/Library/Android/sdk/platform-tools/adb devices
flutter emulators 2>/dev/null    # if Flutter is installed and you've used it for Taler ID
```

If no emulator running, launch one:
```bash
~/Library/Android/sdk/emulator/emulator -avd Pixel_XL_API_33 -read-only &
sleep 20
~/Library/Android/sdk/platform-tools/adb devices    # confirm emulator-5554 shows
```

- [ ] **Step 3: Build debug APK**

```bash
cd ~/Downloads/gravy-wallet/android
./gradlew assembleDebug
```

Expected: BUILD SUCCESSFUL. APK written to `android/app/build/outputs/apk/debug/app-debug.apk`. Takes 3-10 minutes first time (Gradle download).

Common failures and fixes:
- Out of memory: edit `android/gradle.properties` → `org.gradle.jvmargs=-Xmx4096m`
- AGP version mismatch with Gradle: check `android/build.gradle` `com.android.tools.build:gradle:X.Y.Z` matches `gradle/wrapper/gradle-wrapper.properties`
- Old `compileSdkVersion`: bump to 34

- [ ] **Step 4: Install and launch on emulator**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-android
```

Expected: Metro bundler starts, JS bundle compiles, app installs on emulator, opens "Trustee Wallet" splash → seed setup screen.

- [ ] **Step 5: Manual smoke test (~3 min)**

In the running app:
1. Tap "Create new wallet" → see seed phrase (12 or 24 words)
2. Confirm seed → land on Dashboard
3. Verify at least Bitcoin and Ethereum balances render (will show 0.00)
4. Open Settings → confirm app version shows

If any of these crash → debug now. We need a working baseline before rename.

- [ ] **Step 6: Tag this as the verified Trustee baseline**

```bash
cd ~/Downloads/gravy-wallet
git tag baseline-trustee-android-ok
git push origin baseline-trustee-android-ok
```

---

## Task 4: Verify iOS baseline build (Trustee branding still)

**Goal:** Same as Task 3 but for iOS.

- [ ] **Step 1: Open Xcode workspace**

```bash
open ~/Downloads/gravy-wallet/ios/*.xcworkspace
```

The workspace name will be Trustee's original (e.g., `TrusteeWallet.xcworkspace`). Don't rename yet.

- [ ] **Step 2: Set signing team to GsmSoft GmbH**

In Xcode: Select project → main target → "Signing & Capabilities" tab → set Team to "GsmSoft GmbH (MG58MDUNZ2)". This is needed for any device install, even debug.

- [ ] **Step 3: Build for simulator first (no signing needed)**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-ios
```

Expected: Metro bundler starts, app builds in Xcode, launches in iPhone 15 simulator. Takes 5-15 minutes first time.

Common failures:
- Hermes vs JSC mismatch: in `ios/Podfile`, ensure `:hermes_enabled => true`
- Flipper conflicts on Apple Silicon: comment out Flipper section in Podfile and `pod install` again

- [ ] **Step 4: Smoke test in simulator**

Same as Task 3 Step 5: create wallet, see seed, confirm dashboard renders.

- [ ] **Step 5: Build for physical iPhone**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-ios --device "Dmitry's iPhone"
# or by UDID:
npx react-native run-ios -d 00008101-000E21100202001E
```

Expected: app installs on iPhone. First time may require trusting the developer profile in iPhone Settings → General → VPN & Device Management.

- [ ] **Step 6: Tag verified iOS baseline**

```bash
cd ~/Downloads/gravy-wallet
git tag baseline-trustee-ios-ok
git push origin baseline-trustee-ios-ok
```

---

## Task 5: Create `dev` branch

**Goal:** From now on, all rename work happens on `dev`, not `main`.

- [ ] **Step 1: Create and push `dev` branch**

```bash
cd ~/Downloads/gravy-wallet
git checkout -b dev
git push -u origin dev
```

- [ ] **Step 2: Set `dev` as default working branch**

All subsequent tasks in this plan happen on `dev`. After Plan A completes and is validated, we'll merge `dev` → `main`.

---

## Task 6: Run `react-native-rename` for base rename

**Goal:** Use the automated tool to do 80% of the rename work (display name, iOS bundle ID, Android package). Then manually patch what it misses.

- [ ] **Step 1: Verify clean working tree on `dev`**

```bash
cd ~/Downloads/gravy-wallet
git status    # must be clean
git branch --show-current    # must be "dev"
```

- [ ] **Step 2: Run the rename tool**

```bash
cd ~/Downloads/gravy-wallet
npx react-native-rename "Gravy Wallet" -b app.gravywallet
```

Expected output: "Renaming... done." The tool will:
- Change `displayName` in `app.json`
- Rename iOS scheme and project from `TrusteeWallet` → `GravyWallet`
- Update Android package from `com.trusteeglobal.app` → `app.gravywallet`
- Rename Android Java/Kotlin package directories
- Update various Info.plist / AndroidManifest entries

- [ ] **Step 3: Inspect the diff**

```bash
cd ~/Downloads/gravy-wallet
git status
git diff --stat | head -50
```

Expected: dozens of changed files across `ios/`, `android/`, root.

- [ ] **Step 4: Commit the automated rename**

```bash
cd ~/Downloads/gravy-wallet
git add -A
git commit -m "feat: automated rename Trustee → Gravy via react-native-rename"
git push
```

- [ ] **Step 5: Find leftover "trustee" / "Trustee" references the tool missed**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "rustee" --include="*.js" --include="*.ts" --include="*.json" --include="*.gradle" --include="*.plist" --include="*.xml" --include="*.m" --include="*.swift" --include="*.h" \
  app/ android/ ios/ 2>/dev/null | grep -v node_modules | grep -v "\.lock" > /tmp/leftover-trustee.txt

wc -l /tmp/leftover-trustee.txt
head -50 /tmp/leftover-trustee.txt
```

Expected: dozens-hundreds of leftover references. They fall into three categories:
1. **Internal class names** like `BlocksoftTrusteeApi`, `TrusteeError` — leave alone (per spec Section 7.3)
2. **User-visible strings** in i18n / source — replace in Task 7
3. **URL strings** like `trustee.deals` — these go away in Plan B prune, leave for now

---

## Task 7: Replace user-visible "Trustee" strings in source

**Files:**
- Modify: `app/services/i18n/locales/*.json` (all locales)
- Modify: any source file with user-visible strings containing "Trustee"

- [ ] **Step 1: Replace in localization files**

```bash
cd ~/Downloads/gravy-wallet
for f in app/services/i18n/locales/*.json; do
  echo "Patching $f"
  sed -i.bak 's/Trustee Wallet/Gravy Wallet/g; s/trustee\.com/gravy.app/g' "$f"
done
rm app/services/i18n/locales/*.bak
```

- [ ] **Step 2: Spot-check locales render correctly**

```bash
cd ~/Downloads/gravy-wallet
grep -l "Trustee\|trustee" app/services/i18n/locales/*.json
```

Expected: maybe a few stragglers (Trustee Card, Trustee.deals exchanger — those go away in Plan B). Manually open the file, decide case-by-case if it needs editing.

- [ ] **Step 3: Search and fix source-code user-visible strings**

```bash
cd ~/Downloads/gravy-wallet
grep -rn '"Trustee\|Trustee "' app/ --include="*.js" --include="*.ts" | grep -v node_modules | grep -v "i18n/locales"
```

Each hit: open the file, evaluate if the string is shown to a user. If yes → replace "Trustee" → "Gravy". If it's an internal log message → leave for now.

- [ ] **Step 4: Build and visually verify**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-android      # check Android shows "Gravy Wallet" in title bar, menu, settings
```

If anywhere still says "Trustee" — find and patch.

- [ ] **Step 5: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add app/services/i18n/locales/ app/
git commit -m "feat: replace user-visible Trustee strings with Gravy"
git push
```

---

## Task 8: Set up Android product flavors (dev + prod)

**Files:**
- Modify: `android/app/build.gradle`
- Modify: `android/app/src/main/AndroidManifest.xml` (likely)

**Goal:** Two build variants — `prod` (`app.gravywallet`, "Gravy Wallet") and `dev` (`app.gravywallet.dev`, "Gravy Wallet Dev").

- [ ] **Step 1: Read current build.gradle**

```bash
cat ~/Downloads/gravy-wallet/android/app/build.gradle | grep -A 30 "android {"
```

Note the current `applicationId`, `versionCode`, `versionName`, `compileSdkVersion`.

- [ ] **Step 2: Add productFlavors block**

Edit `android/app/build.gradle`. Inside the `android { ... }` block, add (after `defaultConfig { ... }`):

```gradle
    flavorDimensions "default"
    productFlavors {
        prod {
            dimension "default"
            applicationId "app.gravywallet"
            resValue "string", "app_name", "Gravy Wallet"
        }
        dev {
            dimension "default"
            applicationId "app.gravywallet.dev"
            applicationIdSuffix ""  // already in id above
            resValue "string", "app_name", "Gravy Wallet Dev"
        }
    }
```

If `defaultConfig.applicationId` is still set to `app.gravywallet`, remove it (productFlavors override).

- [ ] **Step 3: Make sure `app_name` is not hardcoded in strings.xml**

```bash
grep -n "app_name" ~/Downloads/gravy-wallet/android/app/src/main/res/values/strings.xml
```

If you see `<string name="app_name">Gravy Wallet</string>` — **remove that line** (the productFlavor `resValue` defines it now and duplicate causes build error).

- [ ] **Step 4: Build both flavors**

```bash
cd ~/Downloads/gravy-wallet/android
./gradlew assembleDevDebug
./gradlew assembleProdDebug
```

Both expected: BUILD SUCCESSFUL. APKs in:
- `app/build/outputs/apk/dev/debug/app-dev-debug.apk`
- `app/build/outputs/apk/prod/debug/app-prod-debug.apk`

- [ ] **Step 5: Install both and confirm coexistence**

```bash
~/Library/Android/sdk/platform-tools/adb install -r android/app/build/outputs/apk/dev/debug/app-dev-debug.apk
~/Library/Android/sdk/platform-tools/adb install -r android/app/build/outputs/apk/prod/debug/app-prod-debug.apk
~/Library/Android/sdk/platform-tools/adb shell pm list packages | grep gravywallet
```

Expected: two entries — `app.gravywallet` and `app.gravywallet.dev`. Both icons should appear on the emulator launcher, with names "Gravy Wallet" and "Gravy Wallet Dev".

- [ ] **Step 6: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add android/app/build.gradle android/app/src/main/res/values/strings.xml
git commit -m "feat(android): add dev + prod flavors with app.gravywallet[.dev] bundle IDs"
git push
```

---

## Task 9: Set up iOS dev + prod configurations

**Files:**
- Modify: `ios/GravyWallet.xcodeproj/project.pbxproj` (via Xcode UI)
- Create: `ios/GravyWallet/Info-Dev.plist` (or use Xcode build settings)

**Goal:** Two iOS schemes — "GravyWallet" (`app.gravywallet`, "Gravy Wallet") and "GravyWallet-Dev" (`app.gravywallet.dev`, "Gravy Wallet Dev"). Implemented via Xcode build configurations.

- [ ] **Step 1: Open Xcode and duplicate the build configuration**

```bash
open ~/Downloads/gravy-wallet/ios/GravyWallet.xcworkspace
```

In Xcode:
1. Select project (top blue icon) → "Info" tab
2. Under "Configurations": click `+` → "Duplicate Debug configuration" → name it `Debug-Dev`
3. Same for Release → `Release-Dev`

Now you have 4 configurations: Debug, Debug-Dev, Release, Release-Dev.

- [ ] **Step 2: Set bundle ID per configuration**

In Xcode, target settings → "Build Settings" tab → search for "Product Bundle Identifier":
- Debug, Release → `app.gravywallet`
- Debug-Dev, Release-Dev → `app.gravywallet.dev`

Also "Bundle display name":
- Debug, Release → `Gravy Wallet`
- Debug-Dev, Release-Dev → `Gravy Wallet Dev`

- [ ] **Step 3: Duplicate the scheme**

In Xcode → Product → Scheme → Manage Schemes → select "GravyWallet" → Duplicate → name `GravyWallet-Dev` → Edit:
- Build → Run → use Debug-Dev
- Archive → use Release-Dev
- Make scheme "Shared" (checkbox at bottom)

Click "Close".

- [ ] **Step 4: Verify scheme files committed to git**

```bash
ls ~/Downloads/gravy-wallet/ios/GravyWallet.xcodeproj/xcshareddata/xcschemes/
```

Expected: `GravyWallet.xcscheme` and `GravyWallet-Dev.xcscheme`.

- [ ] **Step 5: Build both schemes**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-ios --scheme GravyWallet
npx react-native run-ios --scheme GravyWallet-Dev
```

Both expected to launch in simulator and coexist (different bundle IDs → different installed apps).

- [ ] **Step 6: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add ios/GravyWallet.xcodeproj/ ios/GravyWallet.xcworkspace/
git commit -m "feat(ios): add Dev build configurations and scheme with .dev bundle ID"
git push
```

---

## Task 10: Replace app icons (iOS + Android)

**Files:**
- Modify: `ios/GravyWallet/Images.xcassets/AppIcon.appiconset/*`
- Modify: `android/app/src/main/res/mipmap-*/`

**Prereq:** `~/Downloads/gravy-icon-1024.png` exists (from pre-flight).

- [ ] **Step 1: Generate iOS icon set**

```bash
cd ~/Downloads/gravy-wallet
npx @bam.tech/react-native-make set-icon --path ~/Downloads/gravy-icon-1024.png --platform ios
```

Expected: writes all sizes (20×20 through 1024×1024) into `ios/GravyWallet/Images.xcassets/AppIcon.appiconset/`.

- [ ] **Step 2: Generate Android icon set**

```bash
cd ~/Downloads/gravy-wallet
npx @bam.tech/react-native-make set-icon --path ~/Downloads/gravy-icon-1024.png --platform android
```

Expected: writes mipmap-mdpi through mipmap-xxxhdpi (regular + round + adaptive).

- [ ] **Step 3: Verify icons replaced**

```bash
cd ~/Downloads/gravy-wallet
ls ios/GravyWallet/Images.xcassets/AppIcon.appiconset/*.png | wc -l    # expect >10
ls android/app/src/main/res/mipmap-*/ic_launcher*.png | wc -l    # expect >15
```

- [ ] **Step 4: Build + visually inspect on home screen**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-android       # check home screen icon
npx react-native run-ios            # check home screen icon
```

If old Trustee icon still appears → uninstall app from device first (Android: drag to trash; iOS: long-press → Remove App), then reinstall.

- [ ] **Step 5: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add ios/GravyWallet/Images.xcassets/AppIcon.appiconset/ android/app/src/main/res/mipmap-*/
git commit -m "feat: replace app icons with Gravy branding"
git push
```

---

## Task 11: Replace splash screens

**Files:**
- Modify: `ios/GravyWallet/Images.xcassets/LaunchImage.imageset/*` (or LaunchScreen.storyboard assets)
- Modify: `android/app/src/main/res/drawable*/launch_screen.*`

**Prereq:** `~/Downloads/gravy-splash.png` exists.

- [ ] **Step 1: Inspect current splash setup**

```bash
cd ~/Downloads/gravy-wallet
find ios/GravyWallet -name "LaunchScreen*" -o -name "LaunchImage*" | head -10
find android/app/src/main/res -name "launch_screen*" -o -name "splash*" | head -10
```

Note the exact files Trustee uses. Common patterns:
- iOS: `LaunchScreen.storyboard` references an image set
- Android: `launch_screen.xml` references a drawable

- [ ] **Step 2: Replace iOS launch image**

If LaunchScreen.storyboard uses an image asset like `splash_logo`:
- Replace `ios/GravyWallet/Images.xcassets/splash_logo.imageset/` PNGs with Gravy splash variants (1x, 2x, 3x).

If it uses a solid background + text view:
- Edit `LaunchScreen.storyboard` in Xcode (right-click → Open As → Source Code OK, but UI Builder is friendlier).
- Change text label from "Trustee" → "Gravy".

- [ ] **Step 3: Replace Android splash**

```bash
cd ~/Downloads/gravy-wallet
# Find existing splash drawables
ls android/app/src/main/res/drawable*/
```

For each `drawable-XXdpi/splash.png` (or similar), copy the appropriately-sized Gravy splash. Tools like `@bam.tech/react-native-make set-splash` may help, but simplest is manual copy:

```bash
# Example — adapt based on what you find
for dpi in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  cp ~/Downloads/gravy-splash.png android/app/src/main/res/drawable-$dpi/splash.png 2>/dev/null || true
done
```

- [ ] **Step 4: Build, install fresh, verify splash**

```bash
cd ~/Downloads/gravy-wallet
~/Library/Android/sdk/platform-tools/adb uninstall app.gravywallet
~/Library/Android/sdk/platform-tools/adb uninstall app.gravywallet.dev
npx react-native run-android       # watch first-launch splash
```

The splash should show Gravy branding for ~1-2 seconds before app loads.

Same for iOS — uninstall app from simulator/device first, then `npx react-native run-ios`.

- [ ] **Step 5: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add ios/GravyWallet/ android/app/src/main/res/
git commit -m "feat: replace splash screens with Gravy branding"
git push
```

---

## Task 12: Change deep-link URL scheme (trustee:// → gravy://)

**Files:**
- Modify: `ios/GravyWallet/Info.plist` (and Info-Dev.plist if it exists)
- Modify: `android/app/src/main/AndroidManifest.xml`
- Modify: any JS code that constructs / parses deep links

- [ ] **Step 1: Find current scheme references**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "trustee://" --include="*.plist" --include="*.xml" --include="*.js" --include="*.ts" ios/ android/ app/ | grep -v node_modules
```

Note every occurrence.

- [ ] **Step 2: Update iOS Info.plist**

In `ios/GravyWallet/Info.plist` find `CFBundleURLSchemes`:

```xml
<key>CFBundleURLSchemes</key>
<array>
    <string>trustee</string>      <!-- change this -->
</array>
```

Change `trustee` to `gravy`. If there's a dev-specific Info.plist, also patch.

For Universal Links (Associated Domains): postpone — Gravy doesn't have a domain set up yet (Plan E concern).

- [ ] **Step 3: Update AndroidManifest.xml**

In `android/app/src/main/AndroidManifest.xml` find intent filters with `android:scheme="trustee"`:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="trustee" />    <!-- change this -->
</intent-filter>
```

Change to `gravy`.

- [ ] **Step 4: Update any JS deep-link constants**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "trustee:" app/ --include="*.js" --include="*.ts" | grep -v node_modules
```

For each hit, change the `trustee:` prefix to `gravy:`.

- [ ] **Step 5: Test deep link on Android**

```bash
~/Library/Android/sdk/platform-tools/adb shell am start -W -a android.intent.action.VIEW -d "gravy://test" app.gravywallet.dev
```

Expected: app opens. If it shows an error or stays on home screen → AndroidManifest.xml change didn't take.

- [ ] **Step 6: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add ios/ android/ app/
git commit -m "feat: change deep-link scheme trustee:// → gravy://"
git push
```

---

## Task 13: Replace Firebase config files

**Files:**
- Replace: `android/app/google-services.json`
- Replace: `ios/GravyWallet/GoogleService-Info.plist`
- (Plus dev variants if Firebase config differs per flavor — see Step 4)

**Prereq:** Firebase project + 2 iOS apps + 2 Android apps created (pre-flight). Config files downloaded to `~/Downloads/gravy-firebase/`.

- [ ] **Step 1: Inspect what's there now (Trustee's)**

```bash
cat ~/Downloads/gravy-wallet/android/app/google-services.json | python3 -m json.tool | head -20
```

Confirm it's Trustee's project ID (not ours).

- [ ] **Step 2: Replace Android prod config**

```bash
cp ~/Downloads/gravy-firebase/google-services-prod.json ~/Downloads/gravy-wallet/android/app/google-services.json
```

(Adapt filename based on what you downloaded.)

- [ ] **Step 3: Add Android dev config**

For per-flavor Firebase configs:

```bash
mkdir -p ~/Downloads/gravy-wallet/android/app/src/dev/
mkdir -p ~/Downloads/gravy-wallet/android/app/src/prod/
cp ~/Downloads/gravy-firebase/google-services-dev.json ~/Downloads/gravy-wallet/android/app/src/dev/google-services.json
cp ~/Downloads/gravy-firebase/google-services-prod.json ~/Downloads/gravy-wallet/android/app/src/prod/google-services.json
```

Then remove the top-level one (it's overridden per-flavor now):

```bash
rm ~/Downloads/gravy-wallet/android/app/google-services.json
```

- [ ] **Step 4: Replace iOS GoogleService-Info.plist**

```bash
cp ~/Downloads/gravy-firebase/GoogleService-Info-prod.plist ~/Downloads/gravy-wallet/ios/GravyWallet/GoogleService-Info.plist
```

For per-configuration handling, add a script phase in Xcode (Build Phases → New Run Script Phase, run before "Copy Bundle Resources"):

```bash
if [ "${CONFIGURATION}" == "Debug-Dev" ] || [ "${CONFIGURATION}" == "Release-Dev" ]; then
  cp "${PROJECT_DIR}/GravyWallet/GoogleService-Info-Dev.plist" "${PROJECT_DIR}/GravyWallet/GoogleService-Info.plist"
else
  cp "${PROJECT_DIR}/GravyWallet/GoogleService-Info-Prod.plist" "${PROJECT_DIR}/GravyWallet/GoogleService-Info.plist"
fi
```

Place both source files:
```bash
cp ~/Downloads/gravy-firebase/GoogleService-Info-prod.plist ~/Downloads/gravy-wallet/ios/GravyWallet/GoogleService-Info-Prod.plist
cp ~/Downloads/gravy-firebase/GoogleService-Info-dev.plist ~/Downloads/gravy-wallet/ios/GravyWallet/GoogleService-Info-Dev.plist
```

- [ ] **Step 5: Build both flavors and verify Firebase init logs**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-android --variant=devDebug
# In logcat (separate terminal):
~/Library/Android/sdk/platform-tools/adb logcat | grep -i firebase | head -20
```

Expected: see Firebase initialization log with the **gravy-wallet** project ID, not Trustee's.

- [ ] **Step 6: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add android/app/src/ ios/GravyWallet/
git commit -m "feat: replace Firebase config with gravy-wallet project (per-flavor)"
git push
```

---

## Task 14: Strip Branch.io completely

**Files:**
- Modify: `package.json` (remove `react-native-branch`)
- Modify: `ios/GravyWallet/AppDelegate.mm` or `.m` (remove Branch init)
- Modify: `android/app/src/main/java/.../MainApplication.java` (remove Branch init)
- Modify: `app/config/branch.js` or similar (delete)
- Modify: `ios/Podfile` (remove RNBranch pod ref)
- Modify: `ios/GravyWallet/Info.plist` (remove Branch keys)

- [ ] **Step 1: Find Branch.io integration points**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "branch\|Branch" --include="*.js" --include="*.ts" --include="*.m" --include="*.mm" --include="*.swift" --include="*.java" --include="*.kt" --include="*.plist" --include="*.xml" app/ ios/ android/ 2>/dev/null | grep -v node_modules | grep -iE "react-native-branch|rnbranch|branch-sdk|branch_key|branch\.io" > /tmp/branch-refs.txt
wc -l /tmp/branch-refs.txt
cat /tmp/branch-refs.txt
```

- [ ] **Step 2: Remove npm package**

```bash
cd ~/Downloads/gravy-wallet
npm uninstall react-native-branch
```

- [ ] **Step 3: Delete config file if exists**

```bash
ls ~/Downloads/gravy-wallet/app/config/branch.js 2>/dev/null && rm ~/Downloads/gravy-wallet/app/config/branch.js
```

- [ ] **Step 4: Remove Branch init from iOS AppDelegate**

Open `ios/GravyWallet/AppDelegate.mm` (or `.m`). Remove `#import <RNBranch/RNBranch.h>` and any `[RNBranch ...]` calls. Remove the `application:openURL:` and `application:continueUserActivity:` handlers if they only call Branch.

- [ ] **Step 5: Remove Branch from iOS Info.plist**

Open `ios/GravyWallet/Info.plist`. Find and remove:
- `branch_key` entry
- `branch_universal_link_domains` entry (if present)
- Any associated-domains entries pointing to `app.link`

- [ ] **Step 6: Remove Branch from Android MainApplication**

Open `android/app/src/main/java/.../MainApplication.java` (or `.kt`). Remove `import io.branch...` and any `Branch.getAutoInstance(...)` calls.

- [ ] **Step 7: Remove Branch from AndroidManifest.xml**

Remove `<meta-data android:name="io.branch.sdk.BranchKey" .../>` and any Branch-related activity entries.

- [ ] **Step 8: Re-install pods and rebuild**

```bash
cd ~/Downloads/gravy-wallet/ios
pod install
cd ..
npx react-native run-android
npx react-native run-ios
```

Both expected to launch without referencing Branch.

- [ ] **Step 9: Confirm no Branch references remain**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "Branch\|branch" --include="*.js" --include="*.ts" --include="*.m" --include="*.mm" --include="*.java" --include="*.plist" --include="*.xml" app/ ios/ android/ 2>/dev/null | grep -v node_modules | grep -iE "react-native-branch|rnbranch|branch-sdk|branch_key|branch\.io"
```

Expected: no output.

- [ ] **Step 10: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add -A
git commit -m "feat: strip Branch.io SDK and config (deep links via gravy:// scheme only)"
git push
```

---

## Task 15: Strip Sentry DSN (disable Sentry; full removal in Plan B)

**Goal:** Make Sentry no-op for MVP without ripping out the SDK entirely (that's a Plan B prune task). Just disable init so no events are sent to Trustee's Sentry project.

- [ ] **Step 1: Find Sentry init code**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "Sentry\.init\|@sentry" --include="*.js" --include="*.ts" app/ | grep -v node_modules
```

- [ ] **Step 2: Comment out or short-circuit Sentry init**

Open each file from Step 1. Wrap the `Sentry.init({...})` call in a no-op:

```javascript
// TODO Plan B: fully remove Sentry SDK
if (false) {
  Sentry.init({...});
}
```

Or simpler — replace the DSN value with empty string:

```javascript
Sentry.init({ dsn: '' });  // disabled for MVP
```

- [ ] **Step 3: Remove DSN from Info.plist**

```bash
cd ~/Downloads/gravy-wallet
grep -n "SENTRY_DSN\|sentry" ios/GravyWallet/Info.plist
```

If present → delete those entries.

- [ ] **Step 4: Build and verify no Sentry network calls**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-android
```

Use Charles Proxy / Android Studio's Network Inspector to confirm no requests go to `*.sentry.io`. (Or just trust the code change — for MVP, code-level disable is enough.)

- [ ] **Step 5: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add app/ ios/GravyWallet/Info.plist
git commit -m "feat: disable Sentry init (full SDK removal deferred to Plan B)"
git push
```

---

## Task 16: Strip Telegram error-reporting tokens

**Files:**
- Modify: `app/config/changeable.prod.js`
- Modify: any code that uses `TELEGRAM_BOT_TOKEN`

- [ ] **Step 1: Find Telegram token references in code**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "TELEGRAM\|telegram" --include="*.js" --include="*.ts" app/ | grep -v node_modules | grep -iE "bot_token|bot-token|chat_id|sendmessage"
```

- [ ] **Step 2: Edit `app/config/changeable.prod.js`**

Open the file. Find the constants `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, etc. Replace their values with empty string:

```javascript
// before:
export const TELEGRAM_BOT_TOKEN = '...redacted-or-already-***REMOVED***...';
// after:
export const TELEGRAM_BOT_TOKEN = '';
```

(History was already scrubbed in Task 1, so the live values are already `***REMOVED***`. Now we also blank the runtime references.)

- [ ] **Step 3: Find code that sends to Telegram and short-circuit**

```bash
cd ~/Downloads/gravy-wallet
grep -rn "api.telegram.org\|sendMessage" app/ --include="*.js" --include="*.ts" | grep -v node_modules
```

For each function that calls Telegram, add an early return:

```javascript
function reportErrorToTelegram(error) {
  return; // disabled for MVP, Plan B fully removes
  // ...original body...
}
```

- [ ] **Step 4: Build and confirm no crashes from empty tokens**

```bash
cd ~/Downloads/gravy-wallet
npx react-native run-android
# Intentionally cause an error in the app to see if the Telegram-report path silently no-ops
```

If the app crashes on startup due to empty token validation — find the validator and skip it for empty values.

- [ ] **Step 5: Commit**

```bash
cd ~/Downloads/gravy-wallet
git add app/
git commit -m "feat: disable Telegram error reporting (tokens scrubbed, calls short-circuited)"
git push
```

---

## Task 17: Final integrated smoke test

**Goal:** Both flavors of both platforms build, install, launch, and basic wallet operations work end-to-end.

- [ ] **Step 1: Clean build all variants**

```bash
cd ~/Downloads/gravy-wallet
# Android
cd android && ./gradlew clean && ./gradlew assembleDevDebug assembleProdDebug && cd ..
# iOS
cd ios && rm -rf build/ && cd ..
xcodebuild -workspace ios/GravyWallet.xcworkspace -scheme GravyWallet -configuration Debug -sdk iphonesimulator clean build
xcodebuild -workspace ios/GravyWallet.xcworkspace -scheme GravyWallet-Dev -configuration Debug-Dev -sdk iphonesimulator clean build
```

All 4 expected: SUCCESS.

- [ ] **Step 2: Manual smoke checklist**

Install each variant and verify:

| Variant | Bundle ID | App name | Icon |
|--|--|--|--|
| Android prod | `app.gravywallet` | "Gravy Wallet" | Gravy |
| Android dev | `app.gravywallet.dev` | "Gravy Wallet Dev" | Gravy |
| iOS prod | `app.gravywallet` | "Gravy Wallet" | Gravy |
| iOS dev | `app.gravywallet.dev` | "Gravy Wallet Dev" | Gravy |

For each:
- Splash screen shows Gravy branding
- Cold launch reaches seed-setup screen
- Create new wallet → 12/24-word seed shown → confirmed
- Dashboard renders BTC + ETH + a few others
- Settings → "About" shows app version (any version is fine for now)
- Backgrounding + PIN unlock works
- Deep link test: `adb shell am start -a android.intent.action.VIEW -d "gravy://test"` opens app

- [ ] **Step 3: Confirm Firebase initializes with gravy-wallet project (not Trustee)**

In Firebase Console → Analytics → Realtime: with the app running on a real device for ~30s, the app should appear under the gravy-wallet project's active users.

(If Firebase Analytics isn't critical right now, just check Android logcat / iOS console for `FirebaseApp configured for: gravy-wallet`.)

- [ ] **Step 4: Run any existing unit tests**

```bash
cd ~/Downloads/gravy-wallet
npm test 2>&1 | tail -30
```

Expected: existing Trustee tests still pass (or skip — we haven't changed business logic). If any fail because of our renames, fix the test imports / strings.

- [ ] **Step 5: Tag Plan A completion**

```bash
cd ~/Downloads/gravy-wallet
git tag plan-a-complete
git push origin plan-a-complete
```

---

## Task 18: Merge `dev` → `main` and close out Plan A

- [ ] **Step 1: Open PR `dev` → `main`**

```bash
cd ~/Downloads/gravy-wallet
gh pr create --base main --head dev --title "Plan A: Setup + Brand Rename" --body "$(cat <<'EOF'
## Summary
- Forked Trustee Wallet, scrubbed secrets from git history
- Renamed app to Gravy Wallet (bundle IDs app.gravywallet[.dev])
- Set up dev + prod flavors on both Android and iOS
- Replaced icons, splash, deep-link scheme, Firebase project
- Stripped Branch.io, disabled Sentry, disabled Telegram error reporting

## Test plan
- [x] Android prod debug build installs as "Gravy Wallet"
- [x] Android dev debug build installs as "Gravy Wallet Dev"
- [x] iOS prod scheme builds + launches in simulator + on device
- [x] iOS dev scheme builds + launches with separate bundle ID
- [x] Create seed → dashboard renders → balances shown
- [x] Deep link `gravy://test` opens app
- [x] Firebase Analytics shows in gravy-wallet project
- [x] No remaining references to Branch.io / Sentry DSN / Trustee Telegram tokens

## Next
Plan B (aggressive prune) starts on a new `dev` branch from this merged main.
EOF
)"
```

- [ ] **Step 2: Self-review the PR diff on GitHub**

Open the PR URL. Skim file-by-file changes for anything unexpected (residual `trustee` strings, accidentally-committed `node_modules`, etc).

- [ ] **Step 3: Merge to main**

```bash
gh pr merge --merge --delete-branch=false
```

(Don't delete `dev` — we'll reuse it for Plan B.)

- [ ] **Step 4: Update local main**

```bash
cd ~/Downloads/gravy-wallet
git checkout main
git pull origin main
```

- [ ] **Step 5: Update todo for Plan B kickoff**

Plan A done. When ready to start Plan B (aggressive prune), come back to writing-plans skill with the Plan B scope.

---

## Self-review checklist (the planner runs this before handoff)

Spec coverage verification — each Plan A scope item in the spec maps to a task:

- ✅ **Spec § 5 Phase 0 (Setup)** → Tasks 1-4
- ✅ **Spec § 5 Phase 1 (Brand rename)** → Tasks 5-17
- ✅ **Spec § 6 Repository & branching** (main + dev, git history scrub) → Tasks 1, 5, 18
- ✅ **Spec § 7.1 Identifier mapping** → Tasks 8 (Android), 9 (iOS)
- ✅ **Spec § 7.2 Asset replacement** (icons, splash) → Tasks 10-11
- ✅ **Spec § 7.3 Tooling** (`react-native-rename`, `@bam.tech/react-native-make`) → Tasks 6, 10
- ✅ **Spec § 12 Secrets to replace** (Firebase, Branch, Sentry, Telegram) → Tasks 13-16
- ✅ **Spec § 6.1 Directory layout: deep-link scheme `gravy://`** → Task 12
- ⏸ **Spec § 7.1 mapping for ASC API Key J3P22V4XX reuse** — handled at pre-flight (user creates ASC app entries); no code task needed in Plan A. Actual altool invocation is Plan E (distribution).

Out-of-scope-for-Plan-A items (confirmed in Plan E coverage):
- Spec § 8 Aggressive prune → Plan B
- Spec § 9 Backend `gravy-prices` → Plan C
- Spec § 10 CoinGecko mobile integration → Plan C
- Spec § 11 Swap module → Plan D
- Spec § 13 Build & signing for release (keystore generation, ASC altool) → Plan E
- Spec § 14 Distribution (APK hosting, landing page) → Plan E
- Spec § 15 Per-release smoke testing → Plan E

Placeholder scan: none found.

Type / API consistency:
- "Gravy Wallet" / "Gravy Wallet Dev" used consistently for display names across Tasks 7-9
- `app.gravywallet` / `app.gravywallet.dev` consistent across Tasks 8, 9, 13, 18
- Scheme names `GravyWallet` and `GravyWallet-Dev` consistent across Tasks 9, 17
- All file paths use the `~/Downloads/gravy-wallet/` working directory

Plan A is ready to execute.
