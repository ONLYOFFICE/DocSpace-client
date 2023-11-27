/* eslint-env browser, node */
import loadImageURL from "./load-image-url";

export default function loadImageFile(imageFile: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
        const image = loadImageURL(e.target.result);
        resolve(image);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsDataURL(imageFile);
  });
}
