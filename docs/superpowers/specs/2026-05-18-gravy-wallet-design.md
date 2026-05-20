# Gravy Wallet — Design Doc

**Status:** Draft
**Author:** Dmitry Volkov (dvvolkovv@gmail.com)
**Date:** 2026-05-18
**Base:** Fork of [Trustee Wallet](https://github.com/trustee-wallet/trusteeWallet) (MIT)

---

## 1. Goal

Build **Gravy Wallet** — a non-custodial multi-chain mobile cryptocurrency wallet with a built-in DEX (on-chain token swap) for EVM chains. Distribution via sideload APK (Android) and TestFlight (iOS). No commission on swaps.

Gravy Wallet is built by forking Trustee Wallet, rebranding it, aggressively stripping unused features tied to Trustee's proprietary backend, and adding a new Swap module.

## 2. Non-goals (MVP)

- Cross-chain swaps (ETH ↔ SOL, etc.)
- Fiat on-ramp (buy crypto with card)
- NFT support
- WalletConnect / external DApp browser
- Cashback / referral program / branded card
- Limit orders, gasless swaps (Permit/Fusion)
- Custom ERC-20 token import by contract address
- Token-level fiat price display (only native chain coins)
- Full Google Play / App Store release (postponed past MVP)
- Sentry / Telegram error reporting (postponed past MVP)
- Push notifications

## 3. Decisions log

| Topic | Decision |
|--|--|
| Approach | Fork Trustee Wallet → rebrand → strip → add DEX |
| Mobile platforms | iOS + Android (no web, no desktop) |
| Stack | React Native 0.73.6 (inherited from Trustee) |
| Chain coverage | All 26 chains from Trustee (BTC, BCH, BSV, BTG, LTC, DOGE, XVG, BNB Beacon, BSC, ETH, ETC, METIS, ONE, SOL, TRX, USDT-Omni, VET, WAVES, XLM, XMR, XRP, FIO, ASH + ETH "forks" MATIC, FTM, RSK, OPTIMISM, AMB, VLX) |
| DEX coverage | EVM-only via 1inch (6 chains: Ethereum, BSC, Polygon, Arbitrum, Optimism, Base) |
| Extra features | CoinGecko market prices via our own backend proxy |
| Cut features | Market, Cashback, Trustee Card, fiat-ramp, NFT, WalletConnect, DApp browser, all `trustee.deals` API |
| Swap commission | 0% (no `feeRecipient`) |
| Distribution | Sideload APK + TestFlight (no app stores in MVP) |
| Branding name | Gravy Wallet |
| Bundle ID | `app.gravywallet` (prod), `app.gravywallet.dev` (dev) |
| Repo name | `gravy-wallet` |
| Upstream tracking | None — fork once, never sync |
| Implementation approach | "Strip first, then build" (single linear pipeline) |
| Backend host | DigitalOcean `167.172.181.34` (existing) |

## 4. Architecture

Gravy = three-layer React Native app + one small backend service.

```
┌─────────────────────────────────────────────────────┐
│  app/  — UI layer (RN, Redux, react-navigation 6)  │
│   • modules/Account, Send, Receive                 │
│   • modules/Settings, WalletCreate, WalletBackup   │
│   • modules/Swap                          (NEW)    │
│   • services/Api/GravyPrices              (NEW)    │
│   • services/Api/CoinGecko (fallback)     (NEW)    │
│   • services/Api/SwapClient               (NEW)    │
├─────────────────────────────────────────────────────┤
│  crypto/  — wallet core (untouched)                │
│   • blockchains/  — 26 chain providers             │
│   • actions/BlocksoftKeysStorage — seed & keys     │
├─────────────────────────────────────────────────────┤
│  Native (iOS + Android) — packaged by Metro        │
└─────────────────────────────────────────────────────┘
                          │
                          ▼ (HTTPS)
        ┌──────────────────────────────────────┐
        │  gravy-prices  (DO 167.172.181.34)   │
        │  Node.js / PM2 / nginx               │
        │  • /prices  — CoinGecko proxy+cache  │
        │  • /swap/*  — 1inch proxy+cache      │
        └──────────────────────────────────────┘
```

### 4.1 Key design principles

- **Non-custodial:** seed and private keys never leave the device (stored in iOS Keychain / Android Keystore via `react-native-keychain`, inherited from Trustee).
- **Backend is stateless:** `gravy-prices` only proxies and caches third-party APIs; loses nothing on restart.
- **Mobile fallbacks:** if `gravy-prices` is unreachable, mobile falls back to direct CoinGecko API call.
- **No accounts:** no user registration, no login. Identity = seed phrase.

## 5. Phases

Linear pipeline, one phase at a time, each phase ends with a green build & smoke-test.

| # | Phase | Estimate |
|--|--|--|
| 0 | **Setup** — fork repo, get original Trustee building locally on Mac + Linux server | 1-2 days |
| 1 | **Brand rename** — name, bundle IDs, icons, splash, localized strings, schemes | 2-3 days |
| 2 | **Aggressive prune** — delete Market/Cashback/Card/NFT/WalletConnect/DApp/trustee.deals API, daemons, Redux slices, npm deps | 1-2 weeks |
| 3 | **CoinGecko integration** — stand up `gravy-prices` backend, hook mobile to it for fiat-rate display | 3-5 days |
| 4 | **Swap module** — new `app/modules/Swap/`, 1inch quote/build flow, EVM tx signing & broadcasting | 1-2 weeks |
| 5 | **Distribution setup** — Android release keystore, ASC app entry, APK landing page, TestFlight automation | 2-3 days |
| 6 | **Polish & QA** — device testing, bug fixing, version bump, first public release | 1 week |

**Total:** ~4-7 weeks of pure focused work (sum of estimates: 29-48 days). Realistic calendar time for part-time solo dev: **~6-10 weeks**.

## 6. Repository & branching

- New private GitHub repo: `dvvolkovv/gravy-wallet`.
- Initial seed: snapshot of Trustee Wallet master (no `upstream` remote, no future sync).
- Branches:
  - `main` — production, prod flavor, drives TestFlight + production APK
  - `dev` — staging, dev flavor, drives sideload `gravy-wallet-dev.apk`
  - `feature/<name>` — per Phase 1-6 work, merged into `dev` after smoke-test, then `dev` → `main`
- **License:** Trustee is MIT; we keep the BlockSoftLab copyright line in `LICENSE` alongside our own, write our own README.
- **Git history hygiene:** rewrite history with `git filter-repo` before first push to scrub Trustee's hard-coded Telegram bot tokens and any other secrets from `app/config/changeable.prod.js`. Repo is private regardless, but keeps history clean.

### 6.1 Directory layout

```
gravy-wallet/
├── app/
│   ├── modules/
│   │   ├── Account/                    (KEEP)
│   │   ├── Send/                       (KEEP)
│   │   ├── Receive/                    (KEEP)
│   │   ├── Settings/                   (KEEP, prune Card/Cashback links)
│   │   ├── WalletCreate/               (KEEP)
│   │   ├── WalletBackup/               (KEEP)
│   │   ├── Dashboard/                  (KEEP, prune bottom-nav)
│   │   ├── Swap/                       (NEW)
│   │   └── Market/Cashback/Card/Nft*/WalletConnect/WalletDapp/  ❌ DELETE
│   ├── appstores/Stores/               (KEEP, prune Market/Cashback/Card/Nft/WalletConnect slices)
│   ├── daemons/                        (KEEP, prune cashback/card/market daemons)
│   ├── services/
│   │   ├── Api/
│   │   │   ├── CoinGecko/              (NEW — only as direct-call fallback)
│   │   │   ├── SwapClient/             (NEW — wraps our backend's /swap/* endpoints)
│   │   │   ├── GravyPrices/            (NEW — wraps our backend's /prices)
│   │   │   └── ApiV3.js                ❌ DELETE
│   │   └── i18n/                       (KEEP, strip Cashback/Card strings)
│   ├── config/
│   │   ├── config.js                   (REWRITE — only Gravy URLs)
│   │   └── changeable.prod.js          (REWRITE — no Telegram tokens, no trustee.deals)
│   └── router/                         (KEEP, prune deleted-module routes)
├── crypto/                             (UNTOUCHED, all 26 blockchains)
├── ios/                                (rename project, replace assets)
├── android/                            (rename package, replace assets)
├── scripts/
│   ├── build-android-{dev,prod}.sh     (NEW)
│   ├── build-ios-testflight.sh         (NEW)
│   ├── deploy-apk.sh                   (NEW)
│   └── set-testflight-notes.py         (NEW, adapted from Taler ID's)
└── docs/superpowers/specs/             (this file)
```

## 7. Branding rename

### 7.1 Identifier mapping

| Aspect | Trustee | Gravy |
|--|--|--|
| Android package | `com.trusteeglobal.app` | `app.gravywallet` (prod), `app.gravywallet.dev` (dev) |
| iOS bundle ID | `org.trustee.wallet` | `app.gravywallet` (prod), `app.gravywallet.dev` (dev) |
| App display name | "Trustee Wallet" | "Gravy Wallet" (prod), "Gravy Wallet Dev" (dev) |
| Deep link scheme | `trustee://` | `gravy://` |
| Apple Team ID | (theirs) | `MG58MDUNZ2` (GsmSoft GmbH) |
| ASC API Key | (theirs) | `J3P22V4URD` (reused from Taler ID) |

### 7.2 Asset replacement

- iOS: `ios/GravyWallet/Images.xcassets/AppIcon.appiconset/` — full size set (20×20 → 1024×1024). Generate via `@bam.tech/react-native-make` from one 1024×1024 master.
- Android: `android/app/src/main/res/mipmap-*` — all DPIs (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi), regular + round + adaptive (foreground + background).
- Splash screens: `ios/.../LaunchScreen.storyboard` + `android/.../res/drawable/launch_screen.xml`.
- In-app assets: `app/assets/images/` — logos, brand sprites.

### 7.3 Tooling

- `npx react-native-rename "Gravy Wallet" -b app.gravywallet` — base rename of Android package, iOS bundle, displayName.
- Custom `sed`-based script to scrub "Trustee"/"trustee" references in `app/services/i18n/locales/{ru,en,uk,...}.json`, in non-renamed source strings, in User-Agent constants.
- **Do not rename `Blocksoft*` internal class names** (e.g., `BlocksoftKeysStorage`) — pure cosmetic, large blast radius. Keep as-is.

## 8. Aggressive prune scope

### 8.1 Pruning order (safe-first: leaves before trunks)

**Step A — UI modules:**
- `app/modules/Market/`
- `app/modules/Cashback/`
- `app/modules/WalletDapp/`
- `app/modules/WalletConnect/`
- `app/modules/Settings/elements/Card/`
- `app/modules/Account/AccountSettings/CashbackLink/`
- Any `NftMain/`, `NftCollection/`, `NftItem/` modules

After each deletion: edit `app/router/Router.js` (remove routes), edit `app/modules/Dashboard/` (remove bottom-nav entries), rebuild, verify app launches.

**Step B — Redux slices:**
- `app/appstores/Stores/Market/`
- `app/appstores/Stores/Cashback/`
- `app/appstores/Stores/Card/`
- `app/appstores/Stores/Nft/`
- `app/appstores/Stores/WalletConnect/`

Clean `app/appstores/Stores/index.js` (rootReducer), remove orphan selectors, remove obsolete state-migration entries.

**Step C — Daemons (background pollers):**
- `app/daemons/cashback/`
- `app/daemons/card/`
- `app/daemons/market/` (if present)

Edit `app/daemons/DaemonsList.js` — remove from boot list (otherwise: crash on app start).

**Step D — API layer:**
- `app/services/Api/ApiV3.js` (main `trustee.deals` client)
- `app/services/Api/CashbackUtils.js`
- `app/services/Api/CardUtils.js`
- `app/services/Api/ApiProxy.js` (if present)
- Grep all `from '.../ApiV3'` imports and either replace with new service calls or delete the call sites.

**Step E — Config & secrets:**
- `app/config/changeable.prod.js` — remove `TELEGRAM_BOT_TOKEN`, `TRUSTEE_DEALS_API_KEY`, `CASHBACK_PROGRAM_SECRET`, `SUMSUB_API_KEY`.
- `app/config/config.js` — strip all `trustee.deals` URLs.

**Step F — npm dependencies:**
After all using code is removed, drop these from `package.json`:
- `@walletconnect/web3wallet`, `@walletconnect/utils`, `@walletconnect/sign-client`
- `react-native-webview` (only if no remaining consumer)
- `react-native-branch` (deep links via own scheme)
- `react-native-awesome-card-io`
- `aws-sdk` (verify no blockchain provider uses it)

Then: `rm -rf node_modules ios/Pods && npm install && (cd ios && pod install)`. Rebuild Android + iOS.

**Keep:**
- `@react-native-firebase/messaging` (future-proofing)
- `@haskkor/react-native-pincode` (PIN-code is part of MVP)
- `react-native-keychain` (key storage)
- All `bitcoinjs-lib`, `ethers`, `web3` and per-chain SDKs.

### 8.2 Validation checkpoints (after each step)

1. `npm run android` / `npx react-native run-ios` — app launches.
2. Create seed → check balances render on at least ETH + BTC + BSC.
3. Send a transaction on a testnet — confirms.
4. If green: commit. If red: revert last commit, debug.

### 8.3 Expected impact

- LOC: 109k → ~70k (35% reduction).
- npm deps: ~150 → ~120.
- Cold-start time: improved (fewer daemons boot).

## 9. Backend: `gravy-prices`

### 9.1 Service

- **Host:** existing DigitalOcean droplet `167.172.181.34` (Frankfurt).
- **Runtime:** Node.js 20 + Express (matches Taler ID's stack; PM2-managed).
- **Process name:** `gravy-prices` under PM2.
- **Internal port:** `127.0.0.1:8095`.
- **Public URL:** subdomain `prices.gravy.app` (preferred, requires DNS) or path `id.taler.tirol/gravy-prices/` (fallback, no DNS work).
- **TLS:** Let's Encrypt via certbot; auto-renew.
- **State:** stateless. In-memory LRU cache only.

### 9.2 Endpoints

| Method | Path | Purpose | Cache |
|--|--|--|--|
| `GET` | `/prices?currencies=USD,EUR,RUB` | All 26 native coins, includes 24h % change | 60 s |
| `GET` | `/price/:coinId?vs=USD` | Single coin | 60 s |
| `POST` | `/swap/quote` `{chainId, fromToken, toToken, amount}` | 1inch quote pass-through | 10 s |
| `POST` | `/swap/build` `{chainId, fromToken, toToken, amount, slippage, fromAddress}` | 1inch swap build (unsigned tx calldata) | no cache |
| `GET` | `/swap/tokens?chainId=<n>` | Supported token list per chain | 24 h |
| `GET` | `/healthz` | Liveness for monitoring | — |

### 9.3 Price aggregation cascade

`/prices` and `/price/:coinId` use a primary-with-fallback chain:

```
CoinGecko (primary, free Demo tier)
   │ on error / 429 / >2s timeout
   ▼
Binance public API (fallback, free, 1200 req/min weight)
   │ on error
   ▼
CryptoCompare (secondary fallback, 100k/month free)
```

A static `coinMappings.js` table maps Gravy currency codes (`BTC`, `BNB_SMART`, …) to each provider's coin ID conventions.

### 9.4 Secrets (`.env` on DO)

```
COINGECKO_API_KEY=          # optional (Demo tier)
ONEINCH_API_KEY=            # required (portal.1inch.dev)
BINANCE_API_KEY=            # optional (raises rate limit; unauthenticated works)
CRYPTOCOMPARE_API_KEY=      # optional
RATE_LIMIT_PER_IP=60        # requests/minute
```

Backup `.env` to local 1Password vault. Losing keys = re-issue from each provider (no user impact, ~1 hour total).

### 9.5 Monitoring

Register `gravy-prices` as a new box in the existing `taler-monitor` system:
1. SSH into `monitor.taler.tirol`, generate push/poll tokens: `cd /opt/taler-monitor && sudo -u monitor ./scripts/gen-token.sh gravy-prices "Gravy Prices Backend"`.
2. Deploy agent to DO via `./boxes/_lib/deploy.sh root@167.172.181.34` (already deployed for other Taler services; just add tokens for this service).
3. `/etc/taler-monitor/push.env` adds `SYSTEMD_UNITS=""`, `DOCKER_CONTAINERS=""`, `HTTP_CHECKS="https://prices.gravy.app/healthz"`.

Telegram alerts route to existing `@taleridbot` group.

## 10. CoinGecko integration

Mobile flow:
1. `app/daemons/rates/RatesDaemon.js` (existing Trustee daemon, repurposed) polls `https://prices.gravy.app/prices?currencies=USD,EUR,RUB` every 60 s.
2. Response → Redux `rates` slice (existing, unchanged).
3. All UI components that show fiat value (`app/modules/Account/elements/...`, balance row, send confirm screen) already consume `rates` via selectors — no UI changes needed.

**Fallback:**
- If `gravy-prices` is unreachable for >3 polls, mobile falls back to calling CoinGecko directly (`https://api.coingecko.com/api/v3/simple/price?...`) and continues.
- If CoinGecko also fails: use last cached rates from `AsyncStorage` (TTL 24 h) and mark "stale" in UI (small grey indicator).
- If no cache: show "—" in fiat columns. Send/swap still work using crypto amounts.

**Coverage caveat:** fiat values shown only for **native coins** of each chain (BTC, ETH, BNB, MATIC, etc.). ERC-20 tokens display the token balance only; no fiat conversion in MVP.

## 11. DEX module (1inch)

### 11.1 Provider abstraction

Define a `SwapProvider` interface in `app/services/Api/SwapClient/` so a different provider (0x, Paraswap) can be swapped in by changing one constant:

```ts
interface SwapProvider {
  quote(chainId, fromToken, toToken, amount): Promise<Quote>;
  build(chainId, fromToken, toToken, amount, slippage, fromAddress): Promise<UnsignedTx>;
  tokens(chainId): Promise<Token[]>;
  needsApproval(chainId, token, amount, owner): Promise<{ needed: boolean; spender: string }>;
}
```

Initial implementation: `OneInchProvider` that calls our backend's `/swap/*` (which proxies to 1inch).

### 11.2 Mobile flow

```
User opens Swap tab
   │
   ▼
SwapScreen      — pick "From" / "To" tokens, enter amount, see "≈ X USD"
   │  taps "Get quote"
   ▼
QuoteScreen     — rate, network fee, slippage tolerance (1% default),
                  price impact (warn if >3%), needsApproval indicator
   │  taps "Swap"
   ▼  (if ERC-20 approval needed: ApprovalScreen → user signs approve tx → wait 1 conf)
   ▼
Signing         — backend returns unsigned tx { to, data, value, gas, gasPrice }
                  app signs locally with private key from Keychain
                  broadcasts via crypto/blockchains/eth/EthTransferProcessor
   │
   ▼
PendingScreen   — pending → confirmed (poll every 5 s for receipt) → success
                  on confirm: return to SwapScreen with cleared fields,
                  refresh balances
```

### 11.3 Supported chains

| Chain | chainId | Native | Stables in MVP |
|--|--|--|--|
| Ethereum | 1 | ETH | USDT, USDC, DAI, WETH, WBTC |
| BNB Smart Chain | 56 | BNB | USDT, USDC, BUSD, WBNB |
| Polygon | 137 | MATIC | USDT, USDC, DAI, WMATIC |
| Arbitrum | 42161 | ETH | USDT, USDC, WETH |
| Optimism | 10 | ETH | USDT, USDC, WETH |
| Base | 8453 | ETH | USDC, WETH |

Token list per chain fetched from `/swap/tokens?chainId=<n>` and cached 24 h locally.

### 11.4 Security & key handling

- All transactions signed **on-device** with private keys from `BlocksoftKeysStorage` (Keychain/Keystore). Keys never leave the device.
- Backend (`gravy-prices`) only proxies quote/build requests — never sees keys, never signs.
- Slippage: default 1%, user can choose 0.5% / 1% / 3% / custom. Warning if >5%.
- Price impact: warning toast if >3%, block button if >10% (user can override).
- MEV protection: not in MVP (would require 1inch Fusion integration, more complex).

### 11.5 Fee structure

- **0% Gravy fee.** No `referrerAddress` / `fee` parameter passed to 1inch.
- User pays only on-chain gas (estimated by 1inch). 1inch itself does not charge a percentage fee unless a referrer is configured.
- Architecturally trivial to flip on later by adding `referrerAddress=<gravy_treasury>` and `fee=<bps>` to the build request.

### 11.6 Out of MVP

- Custom token import by contract address
- Cross-chain swaps
- Limit orders
- 1inch Fusion (gasless, MEV-protected)
- Bridges (ETH ↔ Polygon native bridge)

## 12. Secrets to replace (mobile)

| File | What | Action |
|--|--|--|
| `ios/.../GoogleService-Info.plist` | Firebase config | New Firebase project `gravy-wallet`; download new file |
| `android/app/google-services.json` | Firebase config | Same Firebase project; download new file |
| `app/config/changeable.prod.js` | Telegram bot token (error reporting), trustee.deals API keys, Sumsub key | Remove entirely (no Telegram/Sentry in MVP) |
| `app/config/branch.js` | Branch.io key | Delete file; uninstall `react-native-branch`; deep links via `gravy://` scheme |
| `ios/.../Info.plist` Sentry DSN | Sentry DSN | Remove (no Sentry in MVP) |
| All `trustee.deals` URLs | API endpoints | Replaced by `prices.gravy.app/*` |

## 13. Build & signing

### 13.1 Android

- One-time setup: generate `gravy-release.keystore` with `keytool`; store in `android/app/` (gitignored); back up to local 1Password.
- `android/gradle.properties` (gitignored): `GRAVY_RELEASE_STORE_PASSWORD`, `GRAVY_RELEASE_KEY_PASSWORD`, `GRAVY_RELEASE_KEY_ALIAS`.
- `android/app/build.gradle`: `signingConfigs.release` block + flavorDimensions `default` with productFlavors `dev` and `prod`.
- Build:
  ```bash
  cd android && ./gradlew assembleDevRelease       # → app-dev-release.apk
  cd android && ./gradlew assembleProdRelease      # → app-prod-release.apk
  ```

### 13.2 iOS

- Apple Team `MG58MDUNZ2` (GsmSoft GmbH).
- ASC API Key `J3P22V4URD` reused from Taler ID (works for any app under the team).
- App Store Connect: create two app entries — "Gravy Wallet" (`app.gravywallet`) and "Gravy Wallet Dev" (`app.gravywallet.dev`).
- Provisioning auto-managed in Xcode (signing cert "Apple Distribution: GsmSoft GmbH").
- Build:
  ```bash
  cd ios && pod install && cd ..
  xcodebuild -workspace ios/GravyWallet.xcworkspace \
    -scheme GravyWallet -configuration Release \
    -archivePath build/GravyWallet.xcarchive archive
  xcodebuild -exportArchive -archivePath build/GravyWallet.xcarchive \
    -exportPath build/ipa -exportOptionsPlist ios/ExportOptions.plist
  xcrun altool --upload-app --type ios -f build/ipa/*.ipa \
    --apiKey J3P22V4URD --apiIssuer 44b87272-3052-40ea-a48a-6c6f88a2df11
  ```
- Post-upload script sets Russian "What to Test" notes via ASC API (adapted from Taler ID's `set_testflight_notes.py`).

### 13.3 Versioning

- SemVer `MAJOR.MINOR.PATCH` + monotonic build number (e.g. `1.0.0+1`, `1.0.1+2`).
- `scripts/version-bump.sh` updates `android/app/build.gradle` (versionName, versionCode) and `ios/.../Info.plist` (CFBundleShortVersionString, CFBundleVersion) in one go.

## 14. Distribution

- **iOS:** TestFlight (internal + external testers up to 10k). No App Store submission in MVP.
- **Android:** sideload APK hosted alongside `gravy-prices` on the DO server `167.172.181.34`. Same DNS decision applies as Section 9.1:
  - **Preferred** (with own DNS): `https://gravy.app/download/gravy.apk` and `gravy-dev.apk`, served from `/var/www/gravy/downloads/`.
  - **Fallback** (no DNS yet): `https://id.taler.tirol/gravy/download/...` via path on existing Taler ID domain.
- Simple landing HTML page with QR codes for each download (mirroring Taler ID's `https://id.taler.tirol/`).
- `scripts/deploy-apk.sh` does scp → server + `sudo cp` into the appropriate `/var/www/.../downloads/` + chmod.

## 15. Testing strategy

### 15.1 MVP testing

- **Unit tests:** keep any that exist in Trustee under `__tests__/`; run with `npm test` on each phase commit. Don't write new ones in MVP — codebase is volatile during pruning.
- **No E2E tests in MVP.** App surface changes daily during phases 1-4. Add E2E in Phase 6 or post-MVP.

### 15.2 Per-release manual smoke test

Before each TestFlight upload or APK publish:

1. Fresh install → create new seed → backup phrase displayed correctly → re-import via seed → balances reappear
2. Imported seed → balances render for at least BTC + ETH + BSC + SOL + TRX
3. Send testnet ETH (0.001) → confirms on Etherscan
4. Swap 0.001 ETH → USDC on Polygon (mainnet, real money — small) → confirms, USDC appears in balance
5. Cold start with no internet → app opens without crash, shows cached balances + "offline" indicator
6. PIN-code lock activates after background → unlock works
7. Settings → wipe wallet → confirms → restart → seed setup screen shown

### 15.3 Per-phase smoke test

After each Phase (Section 5):
- App launches
- Seed import works
- One balance is visible
- One send transaction confirms (testnet)

If any fails: revert last commit before continuing.

## 16. Open risks

| Risk | Likelihood | Mitigation |
|--|--|--|
| Trustee's 6-month-old build doesn't compile on current RN tooling | Medium | Phase 0 explicitly verifies green build before any changes; fix in Phase 0 if needed |
| 5 BlockSoftLab-forked npm deps break on RN upgrade | Medium (no upgrade in MVP) | Stay on RN 0.73.6 for MVP; revisit forks during a later RN upgrade |
| 1inch API rate limit (free tier: 1 RPS) hits during user testing | Low (cached at backend) | `/swap/quote` cached 10 s; bump to paid tier if real traffic warrants |
| CoinGecko free tier (30 req/min) insufficient even with caching | Low (only N backend pollers, not N×users) | Cascade to Binance + CryptoCompare already designed in 9.3 |
| Apple rejects "Gravy Wallet" name (trademark / similar app) | Low-medium | Check ASC name availability in Phase 0; have backup names ready (e.g., "Gravy Crypto", "GravyHub") |
| Apple rejects crypto wallet during TestFlight review | Very low (TestFlight allows non-custodial wallets) | TestFlight only; defer App Store fight to post-MVP |
| Lost Android release keystore = lost ability to update Google Play app | High impact if it happens | Keystore backed up to 1Password day one; never store only on one machine |
| Trustee's hardcoded BlockSoftLab Telegram bot tokens leak via fork git history | Medium | `git filter-repo` before first push; repo is private regardless |
| ERC-20 token approve gas cost surprises user (separate tx) | Medium UX cost | QuoteScreen shows "Approve + Swap" as two-step flow with both gas estimates upfront |
| Solana, BTC, XMR users expect swap but only EVM supports it | Medium UX cost | Swap tab disabled / "Coming soon" on non-EVM chains, clearly communicated |

## 17. Future (post-MVP)

Not designed here, but tracked for orientation:

- Cross-chain swaps (LiFi or Squid)
- Solana swaps (Jupiter)
- THORChain integration for native BTC ↔ ETH swaps (huge differentiator for UTXO-heavy Trustee chain set)
- WalletConnect v2 reactivation (was in Trustee, we cut it; can come back via the same library)
- NFT viewer (cut from Trustee; can come back)
- Custom ERC-20 token import
- Limit orders, 1inch Fusion
- Optional Gravy swap fee (architecturally already accounted for)
- Google Play submission
- Push notifications for confirmed transactions
- Sentry / Telegram error reporting
- Multi-account / multi-seed support (Trustee already supports — verify after prune)
