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

"use client";

import React from "react";
import { observer } from "mobx-react";

import {
  EncryptionProvider,
  type PassphraseDialogProps,
} from "@docspace/shared/context/encryption";
import { PassphraseDialog } from "@docspace/shared/dialogs/passphrase-dialog";
import { KeyChangeDialog } from "@docspace/shared/dialogs/key-change-dialog";

import { useEncryptionIdentityStore } from "./EncryptionIdentityStore";
import GhostStateToastEffect from "../_components/private-shell/GhostStateToastEffect";
import DeviceSetupHintEffect from "../_components/private-shell/DeviceSetupHintEffect";
import BroadcastLockSync from "../_components/private-shell/BroadcastLockSync";
import AbortOnLockEffect from "../_components/private-shell/AbortOnLockEffect";
import FilenameRecoveryEffect from "../_components/private-shell/FilenameRecoveryEffect";
import BackfillEncryptedRoomEffect from "../_components/private-shell/BackfillEncryptedRoomEffect";
import { DisclosureBanner } from "../_components/private-shell/DisclosureBanner";

const PassphraseDialogAdapter: React.FC<PassphraseDialogProps> = ({
  visible,
  isLoading,
  error,
  onSubmit,
  onCancel,
}) => {
  const handleForgotPassphrase = React.useCallback(() => {
    onCancel();
    window.open("/profile/keys-management", "_blank");
  }, [onCancel]);

  return (
    <PassphraseDialog
      visible={visible}
      isLoading={isLoading}
      error={error}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isNewPassphrase={false}
      onForgotPassphrase={handleForgotPassphrase}
    />
  );
};

type EncryptionShellProps = { children: React.ReactNode };

const EncryptionShellInner: React.FC<EncryptionShellProps> = ({ children }) => {
  const identityStore = useEncryptionIdentityStore();
  const userKeys = identityStore.userKeys;

  return (
    <EncryptionProvider
      userKeys={userKeys}
      PassphraseDialog={PassphraseDialogAdapter}
      KeyChangeDialog={KeyChangeDialog}
    >
      <GhostStateToastEffect />
      <DeviceSetupHintEffect />
      <BroadcastLockSync />
      <AbortOnLockEffect />
      <FilenameRecoveryEffect />
      <BackfillEncryptedRoomEffect />
      <DisclosureBanner />
      {children}
    </EncryptionProvider>
  );
};

export const EncryptionShell = observer(EncryptionShellInner);

export default EncryptionShell;
