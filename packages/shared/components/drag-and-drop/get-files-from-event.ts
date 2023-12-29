/* eslint-disable prefer-template */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

function toFileWithPath(file: any, path: any) {
  if (typeof file?.path === "string") return file;

  // on electron, path is already set to the absolute path
  const { webkitRelativePath } = file;
  Object.defineProperty(file, "path", {
    value:
      typeof path === "string"
        ? path
        : // If <input webkitdirectory> is set,
          // the File will have a {webkitRelativePath} property
          // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
          typeof webkitRelativePath === "string" &&
            webkitRelativePath.length > 0
          ? webkitRelativePath
          : file.name,
  });

  return file;
}

const FILES_TO_IGNORE = [
  // Thumbnail cache files for macOS and Windows
  ".DS_Store",
  "Thumbs.db", // Windows
];
/**
 * Convert a DragEvent's DataTrasfer object to a list of File objects
 * NOTE: If some of the items are folders,
 * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
 * @param evt
 */
export default async function getFilesFromEvent(evt: any) {
  return (isDragEvt(evt) && evt.dataTransfer) || evt.clipboardData
    ? getDataTransferFiles(evt.dataTransfer ?? evt.clipboardData, evt.type)
    : getInputFiles(evt);
}

function isDragEvt(value: any) {
  return !!value.dataTransfer;
}

function getInputFiles(evt: any) {
  const files = isInput(evt.target)
    ? evt.target.files
      ? fromList(evt.target.files)
      : []
    : [];
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  return files.map((file) => toFileWithPath(file));
}

function isInput(value: any) {
  return value !== null;
}

async function getDataTransferFiles(dt: any, type: any) {
  // IE11 does not support dataTransfer.items
  // See https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/items#Browser_compatibility
  if (dt.items) {
    const items = fromList(dt.items).filter((item) => item.kind === "file");
    // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
    // only 'dragstart' and 'drop' has access to the data (source node)
    if (type !== "drop" && type !== "paste") {
      return items;
    }
    const files = await Promise.all(items.map(toFilePromises));
    return noIgnoredFiles(flatten(files));
  }
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  return noIgnoredFiles(fromList(dt.files).map((file) => toFileWithPath(file)));
}

function noIgnoredFiles(files: any) {
  return files.filter((file: any) => FILES_TO_IGNORE.indexOf(file.name) === -1);
}

// IE11 does not support Array.from()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
// https://developer.mozilla.org/en-US/docs/Web/API/FileList
// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
function fromList(items: any) {
  const files = [];
  // tslint:disable: prefer-for-of
  for (let i = 0; i < items.length; i++) {
    const file = items[i];
    files.push(file);
  }
  return files;
}

// https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
function toFilePromises(item: any) {
  if (typeof item.webkitGetAsEntry !== "function") {
    return fromDataTransferItem(item);
  }
  const entry = item.webkitGetAsEntry();
  // Safari supports dropping an image node from a different window and can be retrieved using
  // the DataTransferItem.getAsFile() API
  // NOTE: FileSystemEntry.file() throws if trying to get the file
  if (entry && entry.isDirectory) {
    return fromDirEntry(entry);
  }
  return fromDataTransferItem(item);
}

function flatten(items: any) {
  return items.reduce(
    (acc: any, files: any) => [
      ...acc,
      ...(Array.isArray(files) ? flatten(files) : [files]),
    ],
    [],
  );
}

function fromDataTransferItem(item: any) {
  const file = item.getAsFile();
  if (!file) {
    return Promise.reject(`${item} is not a File`);
  }
  // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
  const fwp = toFileWithPath(file);
  return Promise.resolve(fwp);
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
async function fromEntry(entry: any) {
  return entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry);
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
function fromDirEntry(entry: any) {
  const reader = entry.createReader();
  return new Promise((resolve, reject) => {
    const entries: any = [];
    let empty = true;
    function readEntries() {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
      reader.readEntries(
        async (batch: any) => {
          if (!batch.length) {
            // Done reading directory
            try {
              const files = await Promise.all(entries);
              if (empty) {
                files.push([createEmptyDirFile(entry)]);
              }
              resolve(files);
            } catch (err) {
              reject(err);
            }
          } else {
            const items = Promise.all(batch.map(fromEntry));
            entries.push(items);
            // Continue reading
            empty = false;
            readEntries();
          }
        },
        (err: any) => {
          reject(err);
        },
      );
    }
    readEntries();
  });
}

function createEmptyDirFile(entry: any) {
  const file = new File([], entry.name);
  const fwp = toFileWithPath(file, entry.fullPath + "/");

  Object.defineProperty(fwp, "isEmptyDirectory", {
    value: true,
  });
  return fwp;
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
async function fromFileEntry(entry: any) {
  return new Promise((resolve, reject) => {
    entry.file(
      (file: any) => {
        const fwp = toFileWithPath(file, entry.fullPath);
        resolve(fwp);
      },
      (err: any) => {
        reject(err);
      },
    );
  });
}
