const fs = require('fs');
const path = require('path');

const htaccessSource = path.join(__dirname, '.htaccess');
const htaccessDest = path.join(__dirname, 'dist', '.htaccess');

if (fs.existsSync(htaccessSource)) {
  fs.copyFileSync(htaccessSource, htaccessDest);
}

