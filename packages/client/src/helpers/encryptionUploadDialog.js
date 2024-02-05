import { desktopConstants } from "@docspace/shared/utils/common";

export function encryptionUploadDialog(extsWebEncrypt, callback) {
  const filter = extsWebEncrypt.map((f) => "*" + f).join(" ");

  const data = {
    cryptoEngineId: desktopConstants.cryptoEngineId,
    filter: filter,
  };

  window.AscDesktopEditor.cloudCryptoCommand("upload", data, function (obj) {
    let bytes = obj.bytes;
    let filename = obj.name;
    let file = new File([bytes], filename);

    if (typeof callback == "function") {
      callback(file, obj.isCrypto !== false);
    }
  });
}
