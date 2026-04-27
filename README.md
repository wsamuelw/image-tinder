# Image Tinder

> Swipe through your photos like Tinder — keep the good ones, ditch the rest.

A fast, local-first web app for reviewing and sorting large folders of images. Point it at any directory, then swipe right to keep or left to delete. No cloud, no sign-up, no installs beyond Node.js.

## Why?

Got a folder with 1,000+ photos from a trip, a camera dump, or a download binge? Manually sorting them is painful. Image Tinder turns the chore into a quick swipe session — most people clear a few hundred photos in under 10 minutes.

## Features

- **Tinder-style cards** — drag or use arrow keys to swipe images
- **Safe deletion** — deleted images move to a `.image-tinder-trash/` folder, not your system trash
- **Undo** — undo up to 20 actions (even closed the tab? Undo still works)
- **Skip** — not sure? Skip and come back to it
- **Progress tracking** — see kept, deleted, and remaining counts in real time
- **Zero setup** — no installs, no accounts, no config files
- **Works with 10+ formats** — JPG, PNG, GIF, WebP, HEIC, BMP, SVG, TIFF and more

## Demo

<!-- Add a screen recording or GIF here later -->
```
[ Open app ] → [ Paste folder path ] → [ Swipe, swipe, swipe ] → [ Done! ]
```

## Prerequisites

- **Node.js** 16+ — [Download here](https://nodejs.org)
- Any modern browser (Chrome, Firefox, Safari, Edge)

## Setup

```bash
# Clone the repo
git clone https://github.com/wsamuelw/image-tinder.git
cd image-tinder

# Install dependencies (just Express)
npm install

# Start the server
npm start
```

You'll see:

```
Image Tinder running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### 1. Load your images

Type or paste the full path to your image folder and hit **Start Reviewing**.

```
/Users/you/Photos/summer-trip
```

### 2. Review images

Each image appears as a card. Decide what to do:

| Action | Keyboard | Mouse / Touch | Button |
|--------|----------|---------------|--------|
| **Keep** | Right arrow (`→`) | Drag right | Green checkmark |
| **Delete** | Left arrow (`←`) | Drag left | Red X |
| **Skip** | Spacebar | — | Blue skip |
| **Undo** | `U` | — | Yellow undo |

Drag the card past the threshold and it'll throw off-screen with a satisfying animation. Release before the threshold and it snaps back.

### 3. Done

When you've reviewed every image, you'll see a summary of how many you kept vs. deleted. Deleted images are safely tucked away in `.image-tinder-trash/` inside your original folder.

## File Safety

| Action | What happens |
|--------|-------------|
| **Keep** | Nothing — the file stays where it is |
| **Delete** | File moves to `<your-folder>/.image-tinder-trash/` |
| **Undo** | Restores the most recently deleted file back to its original folder |

Nothing is permanently deleted. You can:

- Restore from the app with **Undo** (`U`)
- Manually move files back from Finder
- Delete the `.image-tinder-trash/` folder when you're confident you don't need anything in it

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Build | None — single server, single page |
| Dependencies | [express](https://www.npmjs.com/package/express) (only one) |

## Project Structure

```
image-tinder/
├── server.js            # Express server — API routes + static file serving
├── public/
│   └── index.html       # Single-page app — UI, animations, swipe logic
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Stopping the Server

Press `Ctrl+C` in the terminal, or if it's stuck on a background process:

```bash
kill $(lsof -ti:3000)
```

## License

MIT
