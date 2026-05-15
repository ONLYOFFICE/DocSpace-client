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

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import {
  SecretStorage,
  registerUnlockHandler,
  unregisterUnlockHandler,
} from "../../services/encryption/secret-storage";
import {
  registerKeyMismatchHandler,
  unregisterKeyMismatchHandler,
  type KeyMismatchInfo,
  type KeyMismatchDecision,
} from "../../services/encryption/tofu-store";
import { unlockWithPassphrase } from "../../services/encryption/identity";
import type {
  IdentityKeyPair,
  SerializedIdentity,
} from "../../services/encryption/types";

// React context for the unlocked X25519 identity. `userKeys` carries the
// serialized envelope plus the userId required to verify cache ownership.

export type EncryptionUserKeys = SerializedIdentity & { userId: string };

export type EncryptionContextValue = {
  isUnlocked: boolean;
  hasConfiguredKey: boolean;
  isUnlocking: boolean;
  unlockError: string | null;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  getIdentity: () => IdentityKeyPair | null;
  /** Prompts via the registered PassphraseDialog if cache is empty. */
  requireIdentity: () => Promise<IdentityKeyPair | null>;
  resolveKeyMismatch: (info: KeyMismatchInfo) => Promise<KeyMismatchDecision>;
  clearError: () => void;
};

type EncryptionProviderProps = {
  children: ReactNode;
  userKeys: EncryptionUserKeys | null;
  PassphraseDialog?: React.ComponentType<PassphraseDialogProps>;
  KeyChangeDialog?: React.ComponentType<KeyChangeDialogModalProps>;
};

export type PassphraseDialogProps = {
  visible: boolean;
  isLoading: boolean;
  error: string | null;
  onSubmit: (passphrase: string) => Promise<void>;
  onCancel: () => void;
};

export type KeyChangeDialogModalProps = {
  visible: boolean;
  displayName?: string;
  userId: string;
  knownPublicKey: string;
  newPublicKey: string;
  knownFirstSeenAt: number;
  knownLastSeenAt: number;
  onAccept: () => void;
  onRefuse: () => void;
};

const EncryptionContext = createContext<EncryptionContextValue | null>(null);

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({
  children,
  userKeys,
  PassphraseDialog,
  KeyChangeDialog,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showPassphraseDialog, setShowPassphraseDialog] = useState(false);
  const pendingResolveRef = useRef<
    ((kp: IdentityKeyPair | null) => void) | null
  >(null);

  const [keyChangeRequest, setKeyChangeRequest] =
    useState<KeyMismatchInfo | null>(null);
  const keyChangeResolveRef = useRef<
    ((d: KeyMismatchDecision) => void) | null
  >(null);

  const hasConfiguredKey = !!userKeys?.publicKey && !!userKeys?.privateKeyEnc;

  useEffect(() => {
    if (!hasConfiguredKey || !userKeys?.userId) {
      setIsUnlocked(false);
      setShowPassphraseDialog(false);
      pendingResolveRef.current?.(null);
      pendingResolveRef.current = null;
      SecretStorage.lock();
      return;
    }
    setIsUnlocked(SecretStorage.hasUnlocked(userKeys.userId));
  }, [hasConfiguredKey, userKeys?.publicKey, userKeys?.userId]);

  useEffect(() => {
    if (!showPassphraseDialog) {
      setUnlockError(null);
    }
  }, [showPassphraseDialog]);

  const unlock = useCallback(
    async (passphrase: string): Promise<boolean> => {
      if (!userKeys?.privateKeyEnc || !userKeys?.userId) {
        setUnlockError("No encryption keys configured");
        return false;
      }
      setIsUnlocking(true);
      setUnlockError(null);
      try {
        const kp = await unlockWithPassphrase(
          {
            publicKey: userKeys.publicKey,
            privateKeyEnc: userKeys.privateKeyEnc,
          },
          passphrase,
        );
        SecretStorage.cacheUnlocked(userKeys.userId, kp);
        setIsUnlocked(true);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Decryption failed";
        setUnlockError(message);
        return false;
      } finally {
        setIsUnlocking(false);
      }
    },
    [userKeys],
  );

  const lock = useCallback(() => {
    SecretStorage.lock();
    setIsUnlocked(false);
  }, []);

  const clearError = useCallback(() => {
    setUnlockError(null);
  }, []);

  const getIdentity = useCallback((): IdentityKeyPair | null => {
    if (!userKeys?.userId) return null;
    return SecretStorage.getCached(userKeys.userId);
  }, [userKeys?.userId]);

  const requireIdentity = useCallback(async (): Promise<IdentityKeyPair | null> => {
    if (!userKeys?.userId) return null;

    const cached = SecretStorage.getCached(userKeys.userId);
    if (cached) return cached;

    if (!hasConfiguredKey) return null;
    if (!PassphraseDialog) {
      if (typeof console !== "undefined") {
        console.warn(
          "Cannot prompt for passphrase: no PassphraseDialog component provided",
        );
      }
      return null;
    }

    setIsUnlocked(false);
    return new Promise<IdentityKeyPair | null>((resolve) => {
      pendingResolveRef.current = resolve;
      setShowPassphraseDialog(true);
    });
  }, [hasConfiguredKey, PassphraseDialog, userKeys?.userId]);

  useEffect(() => {
    registerUnlockHandler(async () => {
      return requireIdentity();
    });
    return () => {
      unregisterUnlockHandler();
    };
  }, [requireIdentity]);

  // Auto-lock on tab visibility hidden.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const handler = () => {
      if (document.visibilityState === "hidden") {
        SecretStorage.lock();
        setIsUnlocked(false);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
    };
  }, []);

  const resolveKeyMismatch = useCallback(
    async (info: KeyMismatchInfo): Promise<KeyMismatchDecision> => {
      if (!KeyChangeDialog) {
        if (typeof console !== "undefined") {
          console.warn(
            "Encryption key mismatch detected but no KeyChangeDialog was provided; refusing.",
          );
        }
        return "refuse";
      }
      // Concurrent prompt: refuse the in-flight one and show the new.
      if (keyChangeResolveRef.current) {
        keyChangeResolveRef.current("refuse");
        keyChangeResolveRef.current = null;
      }
      return new Promise<KeyMismatchDecision>((resolve) => {
        keyChangeResolveRef.current = resolve;
        setKeyChangeRequest(info);
      });
    },
    [KeyChangeDialog],
  );

  useEffect(() => {
    registerKeyMismatchHandler(resolveKeyMismatch);
    return () => {
      unregisterKeyMismatchHandler();
    };
  }, [resolveKeyMismatch]);

  const handleKeyChangeAccept = useCallback(() => {
    keyChangeResolveRef.current?.("accept");
    keyChangeResolveRef.current = null;
    setKeyChangeRequest(null);
  }, []);

  const handleKeyChangeRefuse = useCallback(() => {
    keyChangeResolveRef.current?.("refuse");
    keyChangeResolveRef.current = null;
    setKeyChangeRequest(null);
  }, []);

  const handlePassphraseSubmit = useCallback(
    async (passphrase: string): Promise<void> => {
      const success = await unlock(passphrase);
      if (success && userKeys?.userId) {
        const kp = SecretStorage.getCached(userKeys.userId);
        pendingResolveRef.current?.(kp);
        pendingResolveRef.current = null;
        setShowPassphraseDialog(false);
      }
    },
    [unlock, userKeys?.userId],
  );

  const handlePassphraseCancel = useCallback(() => {
    pendingResolveRef.current?.(null);
    pendingResolveRef.current = null;
    setShowPassphraseDialog(false);
    setUnlockError(null);
  }, []);

  const value = useMemo<EncryptionContextValue>(
    () => ({
      isUnlocked,
      hasConfiguredKey,
      isUnlocking,
      unlockError,
      unlock,
      lock,
      getIdentity,
      requireIdentity,
      resolveKeyMismatch,
      clearError,
    }),
    [
      isUnlocked,
      hasConfiguredKey,
      isUnlocking,
      unlockError,
      unlock,
      lock,
      getIdentity,
      requireIdentity,
      resolveKeyMismatch,
      clearError,
    ],
  );

  return (
    <EncryptionContext.Provider value={value}>
      {children}
      {PassphraseDialog && showPassphraseDialog && (
        <PassphraseDialog
          visible
          isLoading={isUnlocking}
          error={unlockError}
          onSubmit={handlePassphraseSubmit}
          onCancel={handlePassphraseCancel}
        />
      )}
      {KeyChangeDialog && keyChangeRequest && (
        <KeyChangeDialog
          visible
          userId={keyChangeRequest.userId}
          displayName={keyChangeRequest.displayName}
          knownPublicKey={keyChangeRequest.knownKey}
          newPublicKey={keyChangeRequest.newKey}
          knownFirstSeenAt={keyChangeRequest.knownFirstSeenAt}
          knownLastSeenAt={keyChangeRequest.knownLastSeenAt}
          onAccept={handleKeyChangeAccept}
          onRefuse={handleKeyChangeRefuse}
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
