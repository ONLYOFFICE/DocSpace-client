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

import { useCallback, useState } from "react";

import { getRoomMembers } from "../api/rooms";
import type { TUser } from "../api/people/types";
import { RoomsType } from "../enums";
import type { FileEncryptionMetadata } from "../services/encryption/types";
import {
  useFileEncryption,
  type EncryptionRecipient,
  type UseFileEncryptionOptions,
} from "./useFileEncryption";

export type TUserWithEncryption = TUser & {
  publicKey?: string;
};

export type EncryptedUploadFile = {
  originalFile: File;
  encryptedBlob: Blob;
  metadata: FileEncryptionMetadata;
  fileName: string;
  originalSize: number;
  encryptedSize: number;
};

export type PrepareUploadResult = {
  encryptedFiles: EncryptedUploadFile[];
  failedFiles: Array<{ file: File; error: string }>;
  recipients: EncryptionRecipient[];
};

export type UsePrivateRoomEncryptionOptions = UseFileEncryptionOptions & {
  onEncryptionStart?: () => void;
  onEncryptionComplete?: () => void;
  onProgress?: (percent: number) => void;
};

export type UsePrivateRoomEncryptionResult = {
  isReady: boolean;
  isEncrypting: boolean;
  isFetchingMembers: boolean;
  error: string | null;
  isPrivateRoom: (roomType?: RoomsType, isPrivate?: boolean) => boolean;
  getRoomRecipients: (
    roomId: string | number,
  ) => Promise<EncryptionRecipient[]>;
  prepareFilesForUpload: (
    files: File[],
    roomId: string | number,
  ) => Promise<PrepareUploadResult>;
  encryptFileForRoom: (
    file: File,
    roomId: string | number,
  ) => Promise<EncryptedUploadFile>;
  encryptFileWithRecipients: (
    file: File,
    recipients: EncryptionRecipient[],
  ) => Promise<EncryptedUploadFile>;
  requestUnlock: () => Promise<CryptoKey | null>;
  clearError: () => void;
};

export function usePrivateRoomEncryption(
  options: UsePrivateRoomEncryptionOptions = {},
): UsePrivateRoomEncryptionResult {
  const {
    onEncryptionStart,
    onEncryptionComplete,
    onProgress,
    ...baseOptions
  } = options;

  const fileEncryption = useFileEncryption(baseOptions);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isReady, isEncrypting, requestUnlock, encryptFileForPrivateRoom } =
    fileEncryption;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isPrivateRoom = useCallback(
    (roomType?: RoomsType, isPrivate?: boolean): boolean => {
      return roomType === RoomsType.CustomRoom && isPrivate === true;
    },
    [],
  );

  const getRoomRecipients = useCallback(
    async (roomId: string | number): Promise<EncryptionRecipient[]> => {
      setIsFetchingMembers(true);
      setError(null);

      try {
        const response = await getRoomMembers(roomId, {});
        const members = response.items || [];

        const recipients: EncryptionRecipient[] = members
          .filter((member) => {
            const user = member.sharedTo as TUserWithEncryption;
            return user && user.id && user.publicKey;
          })
          .map((member) => {
            const user = member.sharedTo as TUserWithEncryption;
            return {
              userId: user.id,
              publicKeyBase64: user.publicKey!,
            };
          });

        return recipients;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch room members for encryption";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsFetchingMembers(false);
      }
    },
    [],
  );

  const encryptFileWithRecipients = useCallback(
    async (
      file: File,
      recipients: EncryptionRecipient[],
    ): Promise<EncryptedUploadFile> => {
      if (!isReady) {
        throw new Error("Encryption not ready - please unlock your keys first");
      }

      const { encryptedBlob, metadata } = await encryptFileForPrivateRoom(
        file,
        recipients,
      );

      return {
        originalFile: file,
        encryptedBlob,
        metadata,
        fileName: file.name,
        originalSize: file.size,
        encryptedSize: encryptedBlob.size,
      };
    },
    [isReady, encryptFileForPrivateRoom],
  );

  const encryptFileForRoom = useCallback(
    async (
      file: File,
      roomId: string | number,
    ): Promise<EncryptedUploadFile> => {
      if (!isReady) {
        const key = await requestUnlock();
        if (!key) {
          throw new Error("Encryption keys must be unlocked to upload files");
        }
      }

      const recipients = await getRoomRecipients(roomId);

      if (recipients.length === 0) {
        throw new Error(
          "No room members with encryption keys found. All room members must have encryption configured.",
        );
      }

      return encryptFileWithRecipients(file, recipients);
    },
    [isReady, requestUnlock, getRoomRecipients, encryptFileWithRecipients],
  );

  const prepareFilesForUpload = useCallback(
    async (
      files: File[],
      roomId: string | number,
    ): Promise<PrepareUploadResult> => {
      setError(null);

      if (!isReady) {
        const key = await requestUnlock();
        if (!key) {
          throw new Error("Encryption keys must be unlocked to upload files");
        }
      }

      onEncryptionStart?.();

      try {
        const recipients = await getRoomRecipients(roomId);

        if (recipients.length === 0) {
          throw new Error(
            "No room members with encryption keys found. All room members must have encryption configured.",
          );
        }

        const encryptedFiles: EncryptedUploadFile[] = [];
        const failedFiles: Array<{ file: File; error: string }> = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          try {
            const encrypted = await encryptFileWithRecipients(file, recipients);
            encryptedFiles.push(encrypted);
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : "Encryption failed";
            failedFiles.push({ file, error: errorMessage });
          }

          onProgress?.(Math.round(((i + 1) / totalFiles) * 100));
        }

        return {
          encryptedFiles,
          failedFiles,
          recipients,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to prepare files for encrypted upload";
        setError(errorMessage);
        throw err;
      } finally {
        onEncryptionComplete?.();
      }
    },
    [
      isReady,
      requestUnlock,
      getRoomRecipients,
      encryptFileWithRecipients,
      onEncryptionStart,
      onEncryptionComplete,
      onProgress,
    ],
  );

  return {
    isReady,
    isEncrypting,
    isFetchingMembers,
    error,
    isPrivateRoom,
    getRoomRecipients,
    prepareFilesForUpload,
    encryptFileForRoom,
    encryptFileWithRecipients,
    requestUnlock,
    clearError,
  };
}

export default usePrivateRoomEncryption;
