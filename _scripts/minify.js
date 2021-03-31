const fs = require('fs');
const path = require('path');

function minifyJSON(filePath) {
  if (!filePath.match(/\.json$/)) {
    if (filePath.endsWith('/')) {
      filePath = filePath.concat('index.json');
    } else {
      filePath = filePath.concat('/index.json');
    }
  }
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path.resolve(__dirname, filePath))) {
      const file = require(filePath);
      if (typeof file === 'object') {
        let json;
        try {
          json = JSON.stringify(file);
        } catch (e) {
          return reject(e);
        }
        try {
          filePath = filePath.replace(/\.json$/, '.min.json');
          fs.writeFileSync(path.resolve(__dirname, filePath), json, 'utf8');
          return resolve(filePath);
        } catch {
          return reject(e);
        }
      } else {
        return reject('json file parsing error');
      }
    } else {
      return reject('file not exist');
    }
  });
}

const process = [];
async function add(path) {
  process.push(minifyJSON(path));
}

(async function () {
  add('../dsr-tools/ffxiv'); // FFXIV
  add('../dsr-tools/home'); // Home
  add('../dsr-tools/minecraft'); // MC
  add('../dsr-tools/sdv'); // SDV

  try {
    await Promise.all(process);
  } catch (e) {
    console.error(e);
  }
})();
