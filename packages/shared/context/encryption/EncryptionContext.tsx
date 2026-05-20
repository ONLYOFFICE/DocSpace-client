/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
import { useTranslation } from "react-i18next";

import {
  SecretStorage,
  registerUnlockHandler,
  unregisterUnlockHandler,
} from "../../services/encryption/secret-storage";
import {
  getAutoLockTimeoutSeconds,
  setAutoLockScope,
} from "../../services/encryption/auto-lock-preference";
import {
  registerKeyMismatchHandler,
  unregisterKeyMismatchHandler,
  type KeyMismatchInfo,
  type KeyMismatchDecision,
} from "../../services/encryption/tofu-store";
import { unlockWithPassphrase } from "../../services/encryption/identity";
import {
  clearEncryptedFilenameCache,
  setFilenameCacheScope,
} from "../../services/encryption/filename-cache";
import { getEncryptionErrorMessage } from "../../services/encryption/error-i18n";
import type {
  IdentityKeyPair,
  SerializedIdentity,
} from "../../services/encryption/types";

export type EncryptionUserKeys = SerializedIdentity & { userId: string };

export type EncryptionContextValue = {
  isUnlocked: boolean;
  hasConfiguredKey: boolean;
  isUnlocking: boolean;
  unlockError: string | null;
  /**
   * Active envelope's public key (base64). Exposed so callers can flag the
   * "current device" key inside lists of multiple registered identities.
   * Null when no envelope is configured for this device.
   */
  publicKey: string | null;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  getIdentity: () => IdentityKeyPair | null;
  /** Prompts via the registered PassphraseDialog if cache is empty. */
  requireIdentity: () => Promise<IdentityKeyPair | null>;
  resolveKeyMismatch: (info: KeyMismatchInfo) => Promise<KeyMismatchDecision>;
  clearError: () => void;
  suspendAutoLock: () => () => void;
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
  const { t } = useTranslation("Common");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showPassphraseDialog, setShowPassphraseDialog] = useState(false);
  const [autoLockSuspendCount, setAutoLockSuspendCount] = useState(0);
  const pendingResolveRef = useRef<
    ((kp: IdentityKeyPair | null) => void) | null
  >(null);

  const suspendAutoLock = useCallback((): (() => void) => {
    setAutoLockSuspendCount((c) => c + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setAutoLockSuspendCount((c) => Math.max(0, c - 1));
    };
  }, []);

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
      setFilenameCacheScope(null);
      setAutoLockScope(null);
      return;
    }
    setIsUnlocked(SecretStorage.hasUnlocked(userKeys.userId));
    setFilenameCacheScope(userKeys.userId);
    setAutoLockScope(userKeys.userId);
  }, [hasConfiguredKey, userKeys?.publicKey, userKeys?.userId]);

  useEffect(() => {
    if (!showPassphraseDialog) {
      setUnlockError(null);
    }
  }, [showPassphraseDialog]);

  const unlock = useCallback(
    async (passphrase: string): Promise<boolean> => {
      if (!userKeys?.privateKeyEnc || !userKeys?.userId) {
        setUnlockError(t("Common:EncryptionKeysNotConfigured"));
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
        setUnlockError(getEncryptionErrorMessage(t, error));
        return false;
      } finally {
        setIsUnlocking(false);
      }
    },
    [userKeys, t],
  );

  const lock = useCallback(() => {
    SecretStorage.lock();
    clearEncryptedFilenameCache();
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

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (autoLockSuspendCount > 0) return undefined;
    const handler = () => {
      if (document.visibilityState === "hidden") {
        SecretStorage.lock();
        clearEncryptedFilenameCache();
        setIsUnlocked(false);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => {
      document.removeEventListener("visibilitychange", handler);
    };
  }, [autoLockSuspendCount]);

  useEffect(() => {
    if (!isUnlocked) return undefined;
    if (autoLockSuspendCount > 0) return undefined;
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const timeoutSeconds = getAutoLockTimeoutSeconds();
    if (timeoutSeconds <= 0) return undefined;
    const timeoutMs = timeoutSeconds * 1000;

    let timerId: ReturnType<typeof setTimeout> | null = null;
    const lockNow = () => {
      SecretStorage.lock();
      clearEncryptedFilenameCache();
      setIsUnlocked(false);
    };
    const resetTimer = () => {
      if (timerId !== null) clearTimeout(timerId);
      timerId = setTimeout(lockNow, timeoutMs);
    };

    const events: Array<keyof DocumentEventMap> = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    for (const ev of events) {
      document.addEventListener(ev, resetTimer, { passive: true });
    }
    resetTimer();

    return () => {
      if (timerId !== null) clearTimeout(timerId);
      for (const ev of events) {
        document.removeEventListener(ev, resetTimer);
      }
    };
  }, [isUnlocked, autoLockSuspendCount]);

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

  const publicKey = userKeys?.publicKey ?? null;

  const value = useMemo<EncryptionContextValue>(
    () => ({
      isUnlocked,
      hasConfiguredKey,
      isUnlocking,
      unlockError,
      publicKey,
      unlock,
      lock,
      getIdentity,
      requireIdentity,
      resolveKeyMismatch,
      clearError,
      suspendAutoLock,
    }),
    [
      isUnlocked,
      hasConfiguredKey,
      isUnlocking,
      unlockError,
      publicKey,
      unlock,
      lock,
      getIdentity,
      requireIdentity,
      resolveKeyMismatch,
      clearError,
      suspendAutoLock,
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
