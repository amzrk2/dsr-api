const fs = require('fs');
const path = require('path');

function stringifyJSON(filePath) {
  if (!filePath.match(/\.js$/)) {
    if (filePath.endsWith('/')) {
      filePath = filePath.concat('index.js');
    } else {
      filePath = filePath.concat('/index.js');
    }
  }
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path.resolve(__dirname, filePath))) {
      const file = require(filePath);
      if (typeof file === 'object') {
        let json;
        try {
          console.log(`Processing '${filePath}'`);
          json = JSON.stringify(file);
        } catch (e) {
          return reject(e);
        }
        try {
          filePath = filePath.replace(/\.js$/, '.json');
          fs.writeFileSync(path.resolve(__dirname, filePath), json, 'utf8');
          return resolve(filePath);
        } catch {
          return reject(e);
        }
      } else {
        return reject('JS file format error');
      }
    } else {
      return reject('File not exist');
    }
  });
}

const process = [];
async function add(path) {
  process.push(stringifyJSON(path));
}

(async function () {
  /* DSRToolS */
  add('./dsr-tools/ffxiv'); // FFXIV
  add('./dsr-tools/home'); // Home
  add('./dsr-tools/minecraft'); // MC

  try {
    await Promise.all(process);
    console.log('Process done.');
  } catch (e) {
    console.error(e);
  }
})();
