const { join } = require("path");
const { readdirSync, readFileSync, writeFileSync } = require("fs");
const crypto = require("crypto");

function generateChecksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || "md5")
    .update(str, "utf8")
    .digest(encoding || "hex");
}

const dstPath = join(__dirname, "../../packages", "runtime.json");
const scriptsDir = join(__dirname, "../../public/scripts");

const getFileList = (dirName) => {
  let files = [];

  const items = readdirSync(dirName, { withFileTypes: true });

  for (const item of items) {
    if (item.name == ".DS_Store") continue;

    if (item.isDirectory()) {
      files = [...files, ...getFileList(join(dirName, item.name))];
    } else {
      files.push({ path: join(dirName, item.name), name: item.name });
    }
  }

  return files;
};

const files = getFileList(scriptsDir);

const date = new Date();
const dateString = `${date.getFullYear()}${
  date.getMonth() + 1
}${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

const data = {
  date: dateString,
  checksums: {},
};

files.forEach((file) => {
  try {
    let content = readFileSync(file.path);
    let checksum = generateChecksum(content);
    data.checksums[file.name] = checksum;
  } catch (e) {
    console.error("Unable to generateChecksum file ", file.path, e);
  }
});

writeFileSync(dstPath, JSON.stringify(data, null, 2));
