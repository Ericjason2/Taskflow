// Root entry point forwarding to server/index.js
// Guarantees compatibility across all deployment platforms (Railway, Render, Heroku)
// whether root directory is set to project root or /server
const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
if (fs.existsSync(serverDir) && fs.existsSync(path.join(serverDir, 'index.js'))) {
  process.chdir(serverDir);
  require('./index.js');
} else {
  require('./index.js');
}
