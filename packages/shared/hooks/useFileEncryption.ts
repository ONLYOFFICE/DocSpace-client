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

import { useCallback, useMemo, useState } from "react";

import { RoomsType } from "../enums";
import type { FileEncryptionMetadata } from "../services/encryption/types";
import {
  encryptionService,
  type EncryptFileResult,
  type EncryptFileForRecipientsResult,
} from "../services/encryption/encryptionService";
import { useEncryption } from "../context/EncryptionContext";

export type EncryptionRecipient = {
  userId: string;
  publicKeyBase64: string;
};

export type UseFileEncryptionOptions = {
  publicKeyBase64?: string;
  userId?: string;
};

export type UseFileEncryptionResult = {
  isReady: boolean;
  encryptionEnabled: boolean;
  currentUserId: string | null;
  isEncrypting: boolean;
  encryptFileForUpload: (
    file: File,
    recipientPublicKey?: string,
    recipientUserId?: string,
  ) => Promise<EncryptFileResult>;
  encryptFileForRecipients: (
    file: File,
    recipients: EncryptionRecipient[],
  ) => Promise<EncryptFileForRecipientsResult>;
  encryptFileForPrivateRoom: (
    file: File,
    roomMembers: EncryptionRecipient[],
  ) => Promise<EncryptFileForRecipientsResult>;
  decryptDownloadedFile: (
    encryptedData: ArrayBuffer,
    metadata: FileEncryptionMetadata,
  ) => Promise<Blob>;
  shouldEncrypt: (roomType?: RoomsType, isPrivateRoom?: boolean) => boolean;
  canDecrypt: (metadata: FileEncryptionMetadata) => boolean;
  createKeyForNewRecipient: (
    metadata: FileEncryptionMetadata,
    newRecipientPublicKey: string,
    newRecipientUserId: string,
  ) => Promise<{ userId: string; publicKeyId: string; privateKeyEnc: string }>;
  requestUnlock: () => Promise<CryptoKey | null>;
  prepareFilesForEncryptedUpload: (
    files: File[],
    roomMembers: EncryptionRecipient[],
  ) => Promise<
    Array<{
      originalFile: File;
      encryptedBlob: Blob;
      metadata: FileEncryptionMetadata;
    }>
  >;
};

export function useFileEncryption(
  options: UseFileEncryptionOptions = {},
): UseFileEncryptionResult {
  const { publicKeyBase64, userId } = options;
  const encryption = useEncryption();
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { isUnlocked, hasConfiguredKey, getSecretKey, requireUnlock } =
    encryption;

  const isReady = useMemo(() => {
    return Boolean(isUnlocked && hasConfiguredKey && publicKeyBase64 && userId);
  }, [isUnlocked, hasConfiguredKey, publicKeyBase64, userId]);

  const encryptionEnabled = useMemo(() => {
    return Boolean(hasConfiguredKey);
  }, [hasConfiguredKey]);

  const requestUnlock = useCallback(async (): Promise<CryptoKey | null> => {
    return requireUnlock();
  }, [requireUnlock]);

  const encryptFileForUpload = useCallback(
    async (
      file: File,
      recipientPublicKey?: string,
      recipientUserId?: string,
    ): Promise<EncryptFileResult> => {
      if (!isUnlocked || !hasConfiguredKey) {
        throw new Error("Encryption not ready - please unlock your keys first");
      }

      const targetPublicKey = recipientPublicKey || publicKeyBase64;
      const targetUserId = recipientUserId || userId;

      if (!targetPublicKey) {
        throw new Error("Public key not available");
      }

      if (!targetUserId) {
        throw new Error("User ID not available");
      }

      return encryptionService.encryptFile(file, targetPublicKey, targetUserId);
    },
    [isUnlocked, hasConfiguredKey, publicKeyBase64, userId],
  );

  const encryptFileForRecipients = useCallback(
    async (
      file: File,
      recipients: Array<{ userId: string; publicKeyBase64: string }>,
    ): Promise<EncryptFileForRecipientsResult> => {
      if (!isUnlocked || !hasConfiguredKey) {
        throw new Error("Encryption not ready - please unlock your keys first");
      }

      if (publicKeyBase64 && userId) {
        const currentUserIncluded = recipients.some((r) => r.userId === userId);
        if (!currentUserIncluded) {
          recipients = [...recipients, { userId, publicKeyBase64 }];
        }
      }

      return encryptionService.encryptFileForRecipients(file, recipients);
    },
    [isUnlocked, hasConfiguredKey, publicKeyBase64, userId],
  );

  const decryptDownloadedFile = useCallback(
    async (
      encryptedData: ArrayBuffer,
      metadata: FileEncryptionMetadata,
    ): Promise<Blob> => {
      const privateKey = await getSecretKey();

      if (!privateKey) {
        throw new Error("Private key not available - please unlock your keys");
      }

      if (userId) {
        return encryptionService.decryptFile(
          encryptedData,
          metadata,
          privateKey,
          userId,
        );
      }

      return encryptionService.decryptFileAnyKey(
        encryptedData,
        metadata,
        privateKey,
      );
    },
    [getSecretKey, userId],
  );

  const shouldEncrypt = useCallback(
    (roomType?: RoomsType, isPrivateRoom = false): boolean => {
      if (!encryptionEnabled) return false;
      if (!isReady) return false;
      if (isPrivateRoom) return true;
      if (roomType === RoomsType.Private) return true;
      return false;
    },
    [encryptionEnabled, isReady],
  );

  const canDecrypt = useCallback(
    (metadata: FileEncryptionMetadata): boolean => {
      if (!metadata.encrypted) return true;
      if (!isUnlocked || !hasConfiguredKey) return false;

      if (userId) {
        return encryptionService.canUserDecrypt(metadata, userId);
      }

      return metadata.encryptedKeys.length > 0;
    },
    [isUnlocked, hasConfiguredKey, userId],
  );

  const createKeyForNewRecipient = useCallback(
    async (
      metadata: FileEncryptionMetadata,
      newRecipientPublicKey: string,
      newRecipientUserId: string,
    ): Promise<{
      userId: string;
      publicKeyId: string;
      privateKeyEnc: string;
    }> => {
      const privateKey = await getSecretKey();

      if (!privateKey) {
        throw new Error("Private key not available - please unlock your keys");
      }

      if (!userId) {
        throw new Error("Current user ID not available");
      }

      return encryptionService.createKeyForRecipient(
        metadata,
        privateKey,
        userId,
        newRecipientPublicKey,
        newRecipientUserId,
      );
    },
    [getSecretKey, userId],
  );

  const encryptFileForPrivateRoom = useCallback(
    async (
      file: File,
      roomMembers: EncryptionRecipient[],
    ): Promise<EncryptFileForRecipientsResult> => {
      if (!isUnlocked || !hasConfiguredKey) {
        throw new Error("Encryption not ready - please unlock your keys first");
      }

      let recipients = [...roomMembers];
      if (publicKeyBase64 && userId) {
        const currentUserIncluded = recipients.some((r) => r.userId === userId);
        if (!currentUserIncluded) {
          recipients = [...recipients, { userId, publicKeyBase64 }];
        }
      }

      recipients = recipients.filter(
        (r) => r.publicKeyBase64 && r.publicKeyBase64.length > 0,
      );

      if (recipients.length === 0) {
        throw new Error(
          "No valid recipients with encryption keys found for this room",
        );
      }

      setIsEncrypting(true);
      try {
        return await encryptionService.encryptFileForRecipients(
          file,
          recipients,
        );
      } finally {
        setIsEncrypting(false);
      }
    },
    [isUnlocked, hasConfiguredKey, publicKeyBase64, userId],
  );

  const prepareFilesForEncryptedUpload = useCallback(
    async (
      files: File[],
      roomMembers: EncryptionRecipient[],
    ): Promise<
      Array<{
        originalFile: File;
        encryptedBlob: Blob;
        metadata: FileEncryptionMetadata;
      }>
    > => {
      if (!isUnlocked || !hasConfiguredKey) {
        throw new Error("Encryption not ready - please unlock your keys first");
      }

      setIsEncrypting(true);
      try {
        const results = await Promise.all(
          files.map(async (file) => {
            const { encryptedBlob, metadata } = await encryptFileForPrivateRoom(
              file,
              roomMembers,
            );
            return {
              originalFile: file,
              encryptedBlob,
              metadata,
            };
          }),
        );
        return results;
      } finally {
        setIsEncrypting(false);
      }
    },
    [isUnlocked, hasConfiguredKey, encryptFileForPrivateRoom],
  );

  return {
    isReady,
    encryptionEnabled,
    currentUserId: userId || null,
    isEncrypting,
    encryptFileForUpload,
    encryptFileForRecipients,
    encryptFileForPrivateRoom,
    decryptDownloadedFile,
    shouldEncrypt,
    canDecrypt,
    createKeyForNewRecipient,
    requestUnlock,
    prepareFilesForEncryptedUpload,
  };
}

export default useFileEncryption;
