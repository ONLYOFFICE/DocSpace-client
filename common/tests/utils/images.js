// Copyright 2024 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const fs = require("fs");

const findImagesIntoFiles = (fileList, imageList) => {
  const imgCollection = [];
  const usedImages = [];

  imageList.forEach((i) => {
    if (
      i.path.indexOf("flags") > -1 ||
      i.path.indexOf("thirdparties") > -1 ||
      i.path.indexOf("notifications") > -1 ||
      i.path.indexOf("errors") > -1 ||
      i.path.indexOf("folder") > -1
    )
      return usedImages.push(i.fileName);

    imgCollection.push(i.fileName);
  });

  fileList.forEach(({ path: filePath }) => {
    const data = fs.readFileSync(filePath, "utf8");

    imgCollection.forEach((i) => {
      const contentImg = `/${i}`;

      const idx = data.indexOf(contentImg);
      const idx2 = data.indexOf(`${i}`);

      if (idx > -1 || idx2 > -1) {
        usedImages.push(i);
      }
    });
  });

  return usedImages.filter(
    (i, index) => usedImages.findIndex((usedImg) => usedImg === i) === index
  );
};

module.exports = { findImagesIntoFiles };
