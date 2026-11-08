# Arrowfish Phone - Manual

## 1. Get the engine files
Needs Node.js 18+ on a computer (once):

```bash
node scripts/setup.mjs
```
This creates `www/lib/stockfish.js`, `stockfish.wasm` and `chess.js`. (If you use the GitHub Pages workflow, this runs automatically.)

## 2. Install on your phone

### Option A - PWA (iPhone and Android, easiest)
Host `www/` over **https** (GitHub Pages workflow included), open the URL, then:
- **iPhone/iPad:** Safari -> Share -> **Add to Home Screen**
- **Android:** Chrome -> menu -> **Install app** / **Add to Home screen**

After the first load it works offline.

### Option B - Native Android app (APK)
1. Install Android Studio and Node.js.
2. `npm install`
3. `npm run android` - Android Studio opens.
4. Plug in a phone (USB debugging on) and press **Run**, or **Build -> Build APK(s)**.

### Option C - Native iOS app
Requires a Mac with Xcode (Apple's rule; a free Apple ID works for personal installs).
1. `npm install`
2. `npm run ios` - Xcode opens.
3. Select your team under **Signing & Capabilities**, choose your iPhone, press **Run**.

After changing files in `www/`, run `npm run sync`.

## 3. Using the app
- Tap a piece, then a highlighted square to move. Pawns auto-promote to a queen.
- **Play White/Black** - choose your side (starts a new game).
- **vs Computer / Analysis** - Analysis lets you move both sides and shows the best move for whoever is to move.
- **Arrow** - turn the best-move arrow on or off.
- **Easy / Medium / Hard** - computer strength.
- **Undo** takes back your last move (and the computer's reply). **Flip** turns the board.

## Troubleshooting
- Blank board / nothing happens: `www/lib/` files are missing - run step 1.
- iPhone PWA won't update: delete it from the Home Screen and add it again.
- The app is slow on old phones: choose Easy, or turn the arrow off.

## Fair play
For practice, bots and analysis. Do not use engine help in games against other people.
