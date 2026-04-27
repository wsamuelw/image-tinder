const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let selectedDir = null;
let images = [];
let currentIndex = 0;
let keptCount = 0;
let deletedCount = 0;
const trashDirName = '.image-tinder-trash';

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.heic', '.heif', '.bmp', '.svg', '.tiff', '.tif'
]);

function isImage(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && isImage(e.name))
    .map(e => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function getTrashDir() {
  return path.join(selectedDir, trashDirName);
}

// Select a directory and scan for images
app.post('/api/select-directory', (req, res) => {
  const dirPath = req.body.path;
  if (!dirPath) return res.status(400).json({ error: 'No path provided' });

  const resolved = path.resolve(dirPath);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    return res.status(400).json({ error: 'Invalid directory' });
  }

  selectedDir = resolved;
  images = scanDirectory(selectedDir);
  currentIndex = 0;
  keptCount = 0;
  deletedCount = 0;

  res.json({ total: images.length, directory: selectedDir });
});

// Get current image info
app.get('/api/current', (req, res) => {
  if (!selectedDir) return res.status(400).json({ error: 'No directory selected' });
  if (currentIndex >= images.length) {
    return res.json({ done: true, total: images.length, reviewed: currentIndex });
  }
  res.json({
    filename: images[currentIndex],
    index: currentIndex,
    total: images.length,
    remaining: images.length - currentIndex
  });
});

// Serve an image
app.get('/api/images/:filename', (req, res) => {
  if (!selectedDir) return res.status(400).send('No directory');

  const safeName = path.basename(req.params.filename);
  const filePath = path.join(selectedDir, safeName);

  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');
  res.sendFile(filePath);
});

// Keep image — just advance
app.post('/api/keep', (req, res) => {
  if (!selectedDir) return res.status(400).json({ error: 'No directory' });
  if (currentIndex >= images.length) return res.status(400).json({ error: 'No more images' });

  const filename = images[currentIndex];
  currentIndex++;
  keptCount++;

  res.json({
    action: 'kept',
    filename,
    remaining: images.length - currentIndex,
    done: currentIndex >= images.length
  });
});

// Delete image — move to trash
app.post('/api/delete', (req, res) => {
  if (!selectedDir) return res.status(400).json({ error: 'No directory' });
  if (currentIndex >= images.length) return res.status(400).json({ error: 'No more images' });

  const filename = images[currentIndex];
  const srcPath = path.join(selectedDir, filename);
  const trashDir = getTrashDir();

  if (!fs.existsSync(trashDir)) {
    fs.mkdirSync(trashDir, { recursive: true });
  }

  // Handle duplicate names in trash
  let destName = filename;
  let destPath = path.join(trashDir, destName);
  let counter = 1;
  while (fs.existsSync(destPath)) {
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);
    destName = `${base}_${counter}${ext}`;
    destPath = path.join(trashDir, destName);
    counter++;
  }

  fs.renameSync(srcPath, destPath);
  images.splice(currentIndex, 1);
  deletedCount++;

  res.json({
    action: 'deleted',
    filename,
    trashName: destName,
    remaining: images.length - currentIndex,
    done: currentIndex >= images.length
  });
});

// Undo — move back from trash
app.post('/api/undo', (req, res) => {
  if (!selectedDir) return res.status(400).json({ error: 'No directory' });

  const trashDir = getTrashDir();
  if (!fs.existsSync(trashDir)) {
    return res.status(400).json({ error: 'Nothing to undo' });
  }

  const trashFiles = fs.readdirSync(trashDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
  });

  if (trashFiles.length === 0) {
    return res.status(400).json({ error: 'Trash is empty' });
  }

  // Sort to find the most recently moved file
  const trashEntries = trashFiles.map(f => ({
    name: f,
    mtime: fs.statSync(path.join(trashDir, f)).mtimeMs
  }));
  trashEntries.sort((a, b) => b.mtime - a.mtime);

  const toRestore = trashEntries[0];
  const srcPath = path.join(trashDir, toRestore.name);
  let restoreName = toRestore.name;

  // If a file with this name already exists in the directory, add a suffix
  if (fs.existsSync(path.join(selectedDir, restoreName))) {
    const ext = path.extname(restoreName);
    const base = path.basename(restoreName, ext);
    let counter = 1;
    while (fs.existsSync(path.join(selectedDir, `${base}_${counter}${ext}`))) {
      counter++;
    }
    restoreName = `${base}_${counter}${ext}`;
  }

  const destPath = path.join(selectedDir, restoreName);
  fs.renameSync(srcPath, destPath);
  deletedCount--;

  // Re-insert at current position and re-sort
  images.splice(currentIndex, 0, restoreName);
  images.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  currentIndex = images.indexOf(restoreName);

  res.json({
    action: 'restored',
    filename: restoreName,
    remaining: images.length - currentIndex,
    total: images.length
  });
});

// Skip (don't decide yet)
app.post('/api/skip', (req, res) => {
  if (!selectedDir) return res.status(400).json({ error: 'No directory' });
  if (currentIndex >= images.length) return res.status(400).json({ error: 'No more images' });

  const filename = images[currentIndex];
  // Move to end of queue
  images.splice(currentIndex, 1);
  images.push(filename);

  res.json({
    action: 'skipped',
    filename,
    remaining: images.length - currentIndex,
    total: images.length
  });
});

// Progress/stats
app.get('/api/stats', (req, res) => {
  if (!selectedDir) return res.status(400).json({ error: 'No directory' });

  const trashDir = getTrashDir();
  let deleted = 0;
  if (fs.existsSync(trashDir)) {
    deleted = fs.readdirSync(trashDir).filter(f => isImage(f)).length;
  }

  res.json({
    total: images.length + deletedCount,
    remaining: images.length - currentIndex,
    reviewed: keptCount + deletedCount,
    deleted: deletedCount,
    kept: keptCount
  });
});

app.listen(PORT, () => {
  console.log(`Image Tinder running at http://localhost:${PORT}`);
});
