// (c) Copyright Ascensio System SIA 2009-2026
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

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { EncryptionService, encryptionService } from "../encryptionService";
import { generateRSAKeyPair, exportPublicKey } from "../keyManagement";
import type { FileEncryptionMetadata } from "../types";

// Test helpers
const createMockFile = (
  content: string | Uint8Array,
  name: string,
  type = "text/plain",
): File => {
  const data =
    typeof content === "string" ? new TextEncoder().encode(content) : content;
  // Convert Uint8Array to ArrayBuffer for proper BlobPart typing
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
  const file = new File([new Blob([buffer], { type })], name, { type });
  const mockFile = file as unknown as {
    arrayBuffer: () => Promise<ArrayBuffer>;
    text: () => Promise<string>;
  };
  mockFile.arrayBuffer = () =>
    Promise.resolve(
      data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      ) as ArrayBuffer,
    );
  mockFile.text = () =>
    Promise.resolve(
      typeof content === "string" ? content : new TextDecoder().decode(content),
    );
  return file;
};

const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });

const blobToText = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

const createRandomBytes = (size: number): Uint8Array => {
  const result = new Uint8Array(size);
  for (let i = 0; i < size; i += 65536) {
    crypto.getRandomValues(result.subarray(i, Math.min(i + 65536, size)));
  }
  return result;
};

const createNonEncryptedMetadata = (): FileEncryptionMetadata => ({
  encrypted: false,
  version: 1,
  encryptionAlgorithm: "AES-256-GCM",
  keyEncryptionAlgorithm: "RSA-OAEP-SHA256",
  encryptedKeys: [],
  iv: "",
  encryptedAt: new Date().toISOString(),
});

describe("EncryptionService", () => {
  let service: EncryptionService;
  let keyPair: CryptoKeyPair;
  let publicKey: string;

  beforeAll(async () => {
    keyPair = await generateRSAKeyPair();
    publicKey = await exportPublicKey(keyPair.publicKey);
  });

  beforeEach(() => {
    service = new EncryptionService();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("encryptFile", () => {
    it("should encrypt file with correct metadata", async () => {
      const file = createMockFile("Hello, World!", "test.txt");
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "user1",
      );

      expect(encryptedBlob.size).toBeGreaterThan(file.size);
      expect(metadata.encrypted).toBe(true);
      expect(metadata.version).toBe(1);
      expect(metadata.encryptionAlgorithm).toBe("AES-256-GCM");
      expect(metadata.keyEncryptionAlgorithm).toBe("RSA-OAEP-SHA256");
      expect(metadata.encryptedKeys).toHaveLength(1);
      expect(metadata.encryptedKeys[0].userId).toBe("user1");
      expect(metadata.iv).toBeDefined();
    });

    it("should produce different ciphertext for same file (random IV)", async () => {
      const file = createMockFile("Same content", "test.txt");
      const r1 = await service.encryptFile(file, publicKey, "user");
      const r2 = await service.encryptFile(file, publicKey, "user");

      const d1 = new Uint8Array(await blobToArrayBuffer(r1.encryptedBlob));
      const d2 = new Uint8Array(await blobToArrayBuffer(r2.encryptedBlob));
      expect(d1).not.toEqual(d2);
      expect(r1.metadata.iv).not.toBe(r2.metadata.iv);
    });

    it.each([
      ["empty", "", "text/plain"],
      [
        "binary",
        new Uint8Array([0, 127, 128, 255]),
        "application/octet-stream",
      ],
      ["large", createRandomBytes(50 * 1024), "application/octet-stream"],
    ])("should handle %s file", async (_name, content, type) => {
      const file = createMockFile(content, "test.bin", type);
      const { metadata } = await service.encryptFile(file, publicKey, "user");
      expect(metadata.encrypted).toBe(true);
    });
  });

  describe("encryptFileForRecipients", () => {
    it("should encrypt for multiple recipients who can all decrypt", async () => {
      const kp1 = await generateRSAKeyPair();
      const kp2 = await generateRSAKeyPair();
      const recipients = [
        {
          userId: "user1",
          publicKeyBase64: await exportPublicKey(kp1.publicKey),
        },
        {
          userId: "user2",
          publicKeyBase64: await exportPublicKey(kp2.publicKey),
        },
      ];

      const originalContent = "Shared secret";
      const file = createMockFile(originalContent, "shared.txt");
      const { encryptedBlob, metadata } =
        await service.encryptFileForRecipients(file, recipients);

      expect(metadata.encryptedKeys).toHaveLength(2);
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      // Both users can decrypt
      const d1 = await service.decryptFile(
        encryptedData,
        metadata,
        kp1.privateKey,
        "user1",
      );
      const d2 = await service.decryptFile(
        encryptedData,
        metadata,
        kp2.privateKey,
        "user2",
      );
      expect(await blobToText(d1)).toBe(originalContent);
      expect(await blobToText(d2)).toBe(originalContent);
    });

    it("should throw for empty recipients", async () => {
      const file = createMockFile("Test", "test.txt");
      await expect(service.encryptFileForRecipients(file, [])).rejects.toThrow(
        "At least one recipient is required",
      );
    });
  });

  describe("decryptFile", () => {
    it("should decrypt encrypted file correctly", async () => {
      const originalContent = "Secret message!";
      const file = createMockFile(originalContent, "secret.txt");
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "user",
      );

      const decrypted = await service.decryptFile(
        await blobToArrayBuffer(encryptedBlob),
        metadata,
        keyPair.privateKey,
        "user",
      );
      expect(await blobToText(decrypted)).toBe(originalContent);
    });

    it("should decrypt binary data correctly", async () => {
      const originalData = new Uint8Array([0, 1, 2, 255, 254, 128, 127]);
      const file = createMockFile(
        originalData,
        "binary.bin",
        "application/octet-stream",
      );
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "user",
      );

      const decrypted = await service.decryptFile(
        await blobToArrayBuffer(encryptedBlob),
        metadata,
        keyPair.privateKey,
        "user",
      );
      expect(new Uint8Array(await blobToArrayBuffer(decrypted))).toEqual(
        originalData,
      );
    });

    it.each([
      [
        "non-encrypted file",
        createNonEncryptedMetadata(),
        "File is not encrypted",
      ],
      [
        "no access",
        { ...createNonEncryptedMetadata(), encrypted: true },
        "You do not have access",
      ],
    ])("should throw for %s", async (_name, meta, errorMsg) => {
      await expect(
        service.decryptFile(
          new ArrayBuffer(100),
          meta,
          keyPair.privateKey,
          "user",
        ),
      ).rejects.toThrow(errorMsg);
    });

    it("should throw with wrong private key", async () => {
      const file = createMockFile("Secret", "test.txt");
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "user",
      );
      const wrongKp = await generateRSAKeyPair();

      await expect(
        service.decryptFile(
          await blobToArrayBuffer(encryptedBlob),
          metadata,
          wrongKp.privateKey,
          "user",
        ),
      ).rejects.toThrow("Failed to decrypt file key");
    });
  });

  describe("decryptFileAnyKey", () => {
    it("should try all keys until one works", async () => {
      const kp1 = await generateRSAKeyPair();
      const kp2 = await generateRSAKeyPair();
      const recipients = [
        {
          userId: "user1",
          publicKeyBase64: await exportPublicKey(kp1.publicKey),
        },
        {
          userId: "user2",
          publicKeyBase64: await exportPublicKey(kp2.publicKey),
        },
      ];

      const originalContent = "Shared content";
      const file = createMockFile(originalContent, "shared.txt");
      const { encryptedBlob, metadata } =
        await service.encryptFileForRecipients(file, recipients);

      const decrypted = await service.decryptFileAnyKey(
        await blobToArrayBuffer(encryptedBlob),
        metadata,
        kp2.privateKey,
      );
      expect(await blobToText(decrypted)).toBe(originalContent);
    });

    it("should throw when no key matches", async () => {
      const file = createMockFile("Secret", "test.txt");
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "user",
      );
      const wrongKp = await generateRSAKeyPair();

      await expect(
        service.decryptFileAnyKey(
          await blobToArrayBuffer(encryptedBlob),
          metadata,
          wrongKp.privateKey,
        ),
      ).rejects.toThrow("Failed to decrypt file - no valid key found");
    });
  });

  describe("createKeyForRecipient", () => {
    it("should allow new recipient to decrypt file", async () => {
      const newUserKp = await generateRSAKeyPair();
      const originalContent = "Share with new user";
      const file = createMockFile(originalContent, "file.txt");
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "owner",
      );

      const newKey = await service.createKeyForRecipient(
        metadata,
        keyPair.privateKey,
        "owner",
        await exportPublicKey(newUserKp.publicKey),
        "newuser",
      );

      const updatedMetadata = {
        ...metadata,
        encryptedKeys: [...metadata.encryptedKeys, newKey],
      };
      const decrypted = await service.decryptFile(
        await blobToArrayBuffer(encryptedBlob),
        updatedMetadata,
        newUserKp.privateKey,
        "newuser",
      );
      expect(await blobToText(decrypted)).toBe(originalContent);
    });

    it("should throw if current user has no access", async () => {
      const kp2 = await generateRSAKeyPair();
      const file = createMockFile("Data", "file.txt");
      const { metadata } = await service.encryptFile(file, publicKey, "user1");

      await expect(
        service.createKeyForRecipient(
          metadata,
          kp2.privateKey,
          "user2",
          await exportPublicKey(kp2.publicKey),
          "new",
        ),
      ).rejects.toThrow("You do not have access");
    });
  });

  describe("canUserDecrypt", () => {
    it("should return correct access status", async () => {
      const file = createMockFile("Data", "test.txt");
      const { metadata } = await service.encryptFile(file, publicKey, "user1");

      expect(service.canUserDecrypt(metadata, "user1")).toBe(true);
      expect(service.canUserDecrypt(metadata, "user2")).toBe(false);
      expect(
        service.canUserDecrypt(createNonEncryptedMetadata(), "anyone"),
      ).toBe(true);
    });
  });

  describe("getAuthorizedUsers", () => {
    it("should return list of authorized users", async () => {
      const kp1 = await generateRSAKeyPair();
      const kp2 = await generateRSAKeyPair();
      const recipients = [
        {
          userId: "alice",
          publicKeyBase64: await exportPublicKey(kp1.publicKey),
        },
        {
          userId: "bob",
          publicKeyBase64: await exportPublicKey(kp2.publicKey),
        },
      ];

      const file = createMockFile("Data", "test.txt");
      const { metadata } = await service.encryptFileForRecipients(
        file,
        recipients,
      );

      const users = service.getAuthorizedUsers(metadata);
      expect(users).toHaveLength(2);
      expect(users).toContain("alice");
      expect(users).toContain("bob");
    });

    it("should return empty array for non-encrypted files", () => {
      expect(service.getAuthorizedUsers(createNonEncryptedMetadata())).toEqual(
        [],
      );
    });
  });

  describe("isValidMetadata", () => {
    it("should return true for valid metadata", async () => {
      const file = createMockFile("Data", "test.txt");
      const { metadata } = await service.encryptFile(file, publicKey, "user");
      expect(service.isValidMetadata(metadata)).toBe(true);
    });

    it.each([
      [null, "null"],
      [undefined, "undefined"],
      ["string", "string"],
      [{}, "empty object"],
      [{ encrypted: true }, "missing fields"],
      [
        {
          encrypted: "true",
          version: 1,
          encryptionAlgorithm: "AES-256-GCM",
          keyEncryptionAlgorithm: "RSA-OAEP-SHA256",
          encryptedKeys: [],
          iv: "",
          encryptedAt: "",
        },
        "wrong type",
      ],
    ])("should return false for %s", (input, _description) => {
      expect(service.isValidMetadata(input)).toBe(false);
    });
  });

  describe("getKeyFingerprint", () => {
    it("should return 16-char hex fingerprint", async () => {
      const fingerprint = await service.getKeyFingerprint(publicKey);
      expect(fingerprint).toMatch(/^[0-9A-F]{16}$/);
    });
  });

  describe("singleton export", () => {
    it("should export singleton instance", () => {
      expect(encryptionService).toBeInstanceOf(EncryptionService);
    });
  });

  describe("integration", () => {
    it("should handle complete workflow with recipient management", async () => {
      const ownerKp = await generateRSAKeyPair();
      const user1Kp = await generateRSAKeyPair();
      const user2Kp = await generateRSAKeyPair();

      const recipients = [
        {
          userId: "owner",
          publicKeyBase64: await exportPublicKey(ownerKp.publicKey),
        },
        {
          userId: "user1",
          publicKeyBase64: await exportPublicKey(user1Kp.publicKey),
        },
      ];

      const originalContent = "Important document!";
      const file = createMockFile(originalContent, "doc.txt");
      let { encryptedBlob, metadata } = await service.encryptFileForRecipients(
        file,
        recipients,
      );
      const encryptedData = await blobToArrayBuffer(encryptedBlob);

      // Owner and user1 can decrypt
      expect(
        await blobToText(
          await service.decryptFile(
            encryptedData,
            metadata,
            ownerKp.privateKey,
            "owner",
          ),
        ),
      ).toBe(originalContent);
      expect(
        await blobToText(
          await service.decryptFile(
            encryptedData,
            metadata,
            user1Kp.privateKey,
            "user1",
          ),
        ),
      ).toBe(originalContent);

      // Add user2
      const user2Key = await service.createKeyForRecipient(
        metadata,
        ownerKp.privateKey,
        "owner",
        await exportPublicKey(user2Kp.publicKey),
        "user2",
      );
      metadata = {
        ...metadata,
        encryptedKeys: [...metadata.encryptedKeys, user2Key],
      };

      // Now user2 can decrypt
      expect(
        await blobToText(
          await service.decryptFile(
            encryptedData,
            metadata,
            user2Kp.privateKey,
            "user2",
          ),
        ),
      ).toBe(originalContent);
      expect(service.getAuthorizedUsers(metadata)).toHaveLength(3);
    });

    it.each([
      { name: "empty.txt", content: new Uint8Array([]), type: "text/plain" },
      {
        name: "text.txt",
        content: new TextEncoder().encode("Hello"),
        type: "text/plain",
      },
      {
        name: "binary.bin",
        content: new Uint8Array([0, 127, 128, 255]),
        type: "application/octet-stream",
      },
    ])("should round-trip $name", async ({ content, name, type }) => {
      const file = createMockFile(content, name, type);
      const { encryptedBlob, metadata } = await service.encryptFile(
        file,
        publicKey,
        "user",
      );
      const decrypted = await service.decryptFile(
        await blobToArrayBuffer(encryptedBlob),
        metadata,
        keyPair.privateKey,
        "user",
      );
      expect(
        Array.from(new Uint8Array(await blobToArrayBuffer(decrypted))),
      ).toEqual(Array.from(content));
    });
  });
});
