import store from "../store";
import api from "@docspace/shared/api";
import { desktopConstants } from "@docspace/shared/utils/common";
import { encryptionUploadDialog as encryptionUploadDialogHelper } from "./encryptionUploadDialog";

export function encryptionUploadDialog(callback) {
  encryptionUploadDialogHelper(
    store.filesSettingsStore.extsWebEncrypt,
    callback
  );
}

export function setEncryptionAccess(file) {
  return api.files.getEncryptionAccess(file.id).then((keys) => {
    let promise = new Promise((resolve, reject) => {
      try {
        window.AscDesktopEditor.cloudCryptoCommand(
          "share",
          {
            cryptoEngineId: desktopConstants.cryptoEngineId,
            file: [file.viewUrl],
            keys: keys,
          },
          (obj) => {
            let file = null;
            if (obj.isCrypto) {
              let bytes = obj.bytes;
              let filename = "temp_name";
              file = new File([bytes], filename);
            }
            resolve(file);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  });
}
