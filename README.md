# Image Tinder

A Tinder-style web app for reviewing a folder of images. Swipe right to keep, left to delete. Runs locally on your Mac.

## Quick Start

```bash
cd /Users/samuel/image-tinder
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser, paste your image folder path, and start reviewing.

## Controls

| Action | Keyboard | Mouse/Touch | Button |
|--------|----------|-------------|--------|
| Keep | Right arrow | Swipe right | Green check |
| Delete | Left arrow | Swipe left | Red X |
| Skip | Space | — | Blue skip |
| Undo | U | — | Yellow undo |

## What Happens When You Delete

Images are moved to a `.image-tinder-trash/` subfolder inside your image directory. Nothing is permanently deleted. You can restore images with Undo or manually move them back from Finder.

## Supported Formats

JPG, JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, SVG, TIFF

## Project Structure

```
image-tinder/
├── server.js           # Express backend (API + static serving)
├── public/
│   └── index.html      # Frontend (card stack UI, swipe gestures)
└── package.json
```

## Stopping

Ctrl+C in the terminal where it's running, or:

```bash
kill $(lsof -ti:3000)
```
