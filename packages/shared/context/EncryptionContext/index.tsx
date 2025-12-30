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

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { SecretStorageService } from "../../services/encryption/secretStorage";
import { decryptPrivateKey } from "../../services/encryption/keyManagement";
import type { SerializedKeyPair } from "../../services/encryption/types";

export type EncryptionContextValue = {
  isUnlocked: boolean;
  hasConfiguredKey: boolean;
  isUnlocking: boolean;
  unlockError: string | null;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  getSecretKey: () => Promise<CryptoKey | null>;
  requireUnlock: () => Promise<CryptoKey | null>;
  clearError: () => void;
};

type EncryptionProviderProps = {
  children: ReactNode;
  userKeys: SerializedKeyPair | null;
  PassphraseDialog?: React.ComponentType<PassphraseDialogProps>;
};

export type PassphraseDialogProps = {
  visible: boolean;
  isLoading: boolean;
  error: string | null;
  onSubmit: (passphrase: string) => Promise<void>;
  onCancel: () => void;
};

const EncryptionContext = createContext<EncryptionContextValue | null>(null);

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({
  children,
  userKeys,
  PassphraseDialog,
}) => {
  // State
  const [isUnlocked, setIsUnlocked] = useState(
    SecretStorageService.hasDecryptedKey(),
  );
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showPassphraseDialog, setShowPassphraseDialog] = useState(false);
  const [pendingResolve, setPendingResolve] = useState<
    ((key: CryptoKey | null) => void) | null
  >(null);

  const hasConfiguredKey = !!userKeys?.publicKey && !!userKeys?.privateKeyEnc;

  useEffect(() => {
    setIsUnlocked(SecretStorageService.hasDecryptedKey());
  }, [userKeys]);

  useEffect(() => {
    if (!showPassphraseDialog) {
      setUnlockError(null);
    }
  }, [showPassphraseDialog]);

  const unlock = useCallback(
    async (passphrase: string): Promise<boolean> => {
      if (!userKeys?.privateKeyEnc) {
        console.warn("Cannot unlock: no encryption keys configured");
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

        return true;
      } catch (error) {
        SecretStorageService.markDecryptionAttempted();
        const errorMessage =
          error instanceof Error ? error.message : "Decryption failed";
        setUnlockError(errorMessage);
        console.warn("Unlock failed:", error);
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

  const clearError = useCallback(() => {
    setUnlockError(null);
  }, []);

  const getSecretKey = useCallback(async (): Promise<CryptoKey | null> => {
    return SecretStorageService.getCachedKey();
  }, []);

  const requireUnlock = useCallback((): Promise<CryptoKey | null> => {
    if (isUnlocked) {
      return SecretStorageService.getCachedKey();
    }

    if (!hasConfiguredKey) {
      return Promise.resolve(null);
    }

    if (!PassphraseDialog) {
      console.warn(
        "Cannot prompt for passphrase: no PassphraseDialog component provided",
      );
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      setPendingResolve(() => resolve);
      setShowPassphraseDialog(true);
    });
  }, [isUnlocked, hasConfiguredKey, PassphraseDialog]);

  const handlePassphraseSubmit = useCallback(
    async (passphrase: string): Promise<void> => {
      const success = await unlock(passphrase);

      if (success) {
        const key = await SecretStorageService.getCachedKey();
        pendingResolve?.(key);
        setShowPassphraseDialog(false);
        setPendingResolve(null);
      }
    },
    [unlock, pendingResolve],
  );

  const handlePassphraseCancel = useCallback(() => {
    SecretStorageService.markDecryptionAttempted();
    pendingResolve?.(null);
    setShowPassphraseDialog(false);
    setPendingResolve(null);
    setUnlockError(null);
  }, [pendingResolve]);

  const value = useMemo<EncryptionContextValue>(
    () => ({
      isUnlocked,
      hasConfiguredKey,
      isUnlocking,
      unlockError,
      unlock,
      lock,
      getSecretKey,
      requireUnlock,
      clearError,
    }),
    [
      isUnlocked,
      hasConfiguredKey,
      isUnlocking,
      unlockError,
      unlock,
      lock,
      getSecretKey,
      requireUnlock,
      clearError,
    ],
  );

  return (
    <EncryptionContext.Provider value={value}>
      {children}
      {PassphraseDialog && (
        <PassphraseDialog
          visible={showPassphraseDialog}
          isLoading={isUnlocking}
          error={unlockError}
          onSubmit={handlePassphraseSubmit}
          onCancel={handlePassphraseCancel}
        />
      )}
    </EncryptionContext.Provider>
  );
};

export const useEncryption = (): EncryptionContextValue => {
  const context = useContext(EncryptionContext);

  if (!context) {
    throw new Error(
      "useEncryption must be used within an EncryptionProvider. " +
        "Wrap your app with <EncryptionProvider>.",
    );
  }

  return context;
};

export const useEncryptionOptional = (): EncryptionContextValue | null => {
  return useContext(EncryptionContext);
};

export function withEncryption<P extends object>(
  Component: React.ComponentType<P & { encryption: EncryptionContextValue }>,
): React.FC<Omit<P, "encryption">> {
  const WithEncryption = (props: Omit<P, "encryption">) => {
    const encryption = useEncryption();
    return <Component {...(props as P)} encryption={encryption} />;
  };

  WithEncryption.displayName = `withEncryption(${Component.displayName || Component.name || "Component"})`;

  return WithEncryption;
}

export default EncryptionProvider;
