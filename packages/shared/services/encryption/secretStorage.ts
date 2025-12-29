// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

const ENCRYPTION_KEY_CACHE = "docspace_encryption_private_key";
const DECRYPTION_ATTEMPTED = "docspace_decryption_attempted";
const CACHE_TIMESTAMP = "docspace_encryption_cache_time";

import { getCrypto } from "./keyManagement";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function isSessionStorageAvailable(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const testKey = "__test_storage__";
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const SecretStorageService = {
  async cacheDecryptedKey(privateKey: CryptoKey): Promise<void> {
    if (!isSessionStorageAvailable()) {
      console.warn("sessionStorage not available - key will not be cached");
      return;
    }

    try {
      const subtle = getCrypto();
      const pkcs8 = await subtle.exportKey("pkcs8", privateKey);
      const encoded = arrayBufferToBase64(pkcs8);

      sessionStorage.setItem(ENCRYPTION_KEY_CACHE, encoded);
      sessionStorage.setItem(DECRYPTION_ATTEMPTED, "true");
      sessionStorage.setItem(CACHE_TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.warn("Failed to cache encryption key:", error);
    }
  },

  async getCachedKey(): Promise<CryptoKey | null> {
    if (!isSessionStorageAvailable()) return null;

    try {
      const encoded = sessionStorage.getItem(ENCRYPTION_KEY_CACHE);
      if (!encoded) return null;

      const subtle = getCrypto();
      const pkcs8Bytes = base64ToArrayBuffer(encoded);

      return await subtle.importKey(
        "pkcs8",
        pkcs8Bytes,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt", "unwrapKey"],
      );
    } catch (error) {
      console.warn("Failed to retrieve cached key:", error);
      this.clearCache();
      return null;
    }
  },

  hasDecryptedKey(): boolean {
    if (!isSessionStorageAvailable()) return false;
    return sessionStorage.getItem(ENCRYPTION_KEY_CACHE) !== null;
  },

  hasAttemptedDecryption(): boolean {
    if (!isSessionStorageAvailable()) return false;
    return sessionStorage.getItem(DECRYPTION_ATTEMPTED) === "true";
  },

  getCacheTimestamp(): number | null {
    if (!isSessionStorageAvailable()) return null;
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP);
    return timestamp ? parseInt(timestamp, 10) : null;
  },

  isCacheExpired(maxAgeMs: number = 30 * 60 * 1000): boolean {
    const timestamp = this.getCacheTimestamp();
    if (timestamp === null) return true;
    return Date.now() - timestamp > maxAgeMs;
  },

  markDecryptionAttempted(): void {
    if (!isSessionStorageAvailable()) return;
    sessionStorage.setItem(DECRYPTION_ATTEMPTED, "true");
  },

  clearCache(): void {
    if (!isSessionStorageAvailable()) return;

    const encoded = sessionStorage.getItem(ENCRYPTION_KEY_CACHE);
    if (encoded) {
      try {
        sessionStorage.setItem(
          ENCRYPTION_KEY_CACHE,
          "0".repeat(encoded.length),
        );
      } catch {
        // Ignore errors during cleanup
      }
    }

    sessionStorage.removeItem(ENCRYPTION_KEY_CACHE);
    sessionStorage.removeItem(DECRYPTION_ATTEMPTED);
    sessionStorage.removeItem(CACHE_TIMESTAMP);
  },

  lockEncryption(): void {
    if (!isSessionStorageAvailable()) return;

    const encoded = sessionStorage.getItem(ENCRYPTION_KEY_CACHE);
    if (encoded) {
      try {
        sessionStorage.setItem(
          ENCRYPTION_KEY_CACHE,
          "0".repeat(encoded.length),
        );
      } catch {
        // Ignore
      }
    }

    sessionStorage.removeItem(ENCRYPTION_KEY_CACHE);
    sessionStorage.removeItem(CACHE_TIMESTAMP);
  },

  resetAll(): void {
    if (!isSessionStorageAvailable()) return;
    this.clearCache();
  },
};

export default SecretStorageService;
