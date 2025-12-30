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

import { useState, useEffect, useCallback, useMemo } from "react";

import { SecretStorageService } from "../services/encryption/secretStorage";
import {
  decryptPrivateKey,
  getKeyStatus,
} from "../services/encryption/keyManagement";
import type {
  SerializedKeyPair,
  KeyStatus,
} from "../services/encryption/types";

type UseEncryptionStateOptions = {
  userKeys: SerializedKeyPair | null;
  checkInterval?: number;
  maxCacheAge?: number;
};

type UseEncryptionStateReturn = {
  keyStatus: KeyStatus | null;
  isLoadingStatus: boolean;
  isUnlocked: boolean;
  needsPassphrase: boolean;
  isUnlocking: boolean;
  unlockError: string | null;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  hasAttempted: boolean;
  getCachedKey: () => Promise<CryptoKey | null>;
  clearError: () => void;
};

export function useEncryptionState({
  userKeys,
  checkInterval = 5000,
  maxCacheAge = 0,
}: UseEncryptionStateOptions): UseEncryptionStateReturn {
  const [isUnlocked, setIsUnlocked] = useState(
    SecretStorageService.hasDecryptedKey(),
  );
  const [hasAttempted, setHasAttempted] = useState(
    SecretStorageService.hasAttemptedDecryption(),
  );
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const status = await getKeyStatus(userKeys);
        if (mounted) {
          setKeyStatus(status);
        }
      } catch (error) {
        console.warn("Failed to get key status:", error);
        if (mounted) {
          setKeyStatus({ hasKey: false });
        }
      } finally {
        if (mounted) {
          setIsLoadingStatus(false);
        }
      }
    };

    loadStatus();

    return () => {
      mounted = false;
    };
  }, [userKeys]);

  useEffect(() => {
    const checkStatus = () => {
      const hasKey = SecretStorageService.hasDecryptedKey();
      const attempted = SecretStorageService.hasAttemptedDecryption();

      if (maxCacheAge > 0 && hasKey) {
        if (SecretStorageService.isCacheExpired(maxCacheAge)) {
          SecretStorageService.lockEncryption();
          setIsUnlocked(false);
          return;
        }
      }

      setIsUnlocked(hasKey);
      setHasAttempted(attempted);
    };

    checkStatus();

    if (checkInterval > 0) {
      const interval = setInterval(checkStatus, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkInterval, maxCacheAge]);

  const needsPassphrase = useMemo(
    () => (keyStatus?.hasKey ?? false) && !isUnlocked,
    [keyStatus?.hasKey, isUnlocked],
  );

  const unlock = useCallback(
    async (passphrase: string): Promise<boolean> => {
      if (!userKeys?.privateKeyEnc) {
        setUnlockError("No encryption keys configured");
        return false;
      }

      setIsUnlocking(true);
      setUnlockError(null);

      try {
        const privateKey = await decryptPrivateKey(
          userKeys.privateKeyEnc,
          passphrase,
        );

        await SecretStorageService.cacheDecryptedKey(privateKey);
        setIsUnlocked(true);
        setHasAttempted(true);

        return true;
      } catch (error) {
        SecretStorageService.markDecryptionAttempted();
        setHasAttempted(true);

        const errorMessage =
          error instanceof Error ? error.message : "Invalid passphrase";
        setUnlockError(errorMessage);

        return false;
      } finally {
        setIsUnlocking(false);
      }
    },
    [userKeys],
  );

  const lock = useCallback(() => {
    SecretStorageService.lockEncryption();
    setIsUnlocked(false);
  }, []);

  const getCachedKey = useCallback(async (): Promise<CryptoKey | null> => {
    return SecretStorageService.getCachedKey();
  }, []);

  const clearError = useCallback(() => {
    setUnlockError(null);
  }, []);

  return {
    keyStatus,
    isLoadingStatus,
    isUnlocked,
    needsPassphrase,
    isUnlocking,
    unlockError,
    unlock,
    lock,
    hasAttempted,
    getCachedKey,
    clearError,
  };
}

export default useEncryptionState;
