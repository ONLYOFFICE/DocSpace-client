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


import { useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { useEncryption } from "@docspace/shared/context/encryption";
import PadlockIcon from "PUBLIC_DIR/images/icons/16/padlock.react.svg";

import KeyStatePopover from "./KeyStatePopover";

type KeyStateIndicatorProps = {
  /** The open folder is a private room or lies inside one. */
  isPrivate: boolean;
  className?: string;
  syncEncryptedRoom?: () => void;
  userId?: string;
};

/**
 * The state of the user's key in the header of a private room, and the key
 * actions it opens.
 * Spec: private-rooms/key-management, "Key state is shown in the header of a private room"
 */
const KeyStateIndicator = ({
  isPrivate,
  className,
  syncEncryptedRoom,
  userId,
}: KeyStateIndicatorProps) => {
  const { t } = useTranslation(["Common"]);
  const { isUnlocked, hasConfiguredKey, keysLoaded, requireIdentity, lock } =
    useEncryption();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const buttonRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  if (!isPrivate || !keysLoaded || !hasConfiguredKey) return null;

  const label = isUnlocked ? t("Common:KeyUnlocked") : t("Common:KeyLocked");
  const showPopover = isPopoverOpen && isUnlocked;

  const closePopover = (returnFocus: boolean) => {
    setIsPopoverOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const onClick = () => {
    if (isUnlocked) {
      setIsPopoverOpen((open) => !open);
      return;
    }

    void requireIdentity().then((identity) => {
      if (identity) syncEncryptedRoom?.();
    });
  };

  const onLock = () => {
    lock();
    closePopover(true);
    toastr.success(t("Common:EncryptionLocked"));
  };

  return (
    <span ref={anchorRef} className={className}>
      <Button
        ref={buttonRef}
        size={ButtonSize.extraSmall}
        icon={<PadlockIcon aria-hidden="true" data-testid="key_state_icon" />}
        label={label}
        onClick={onClick}
        aria-haspopup={isUnlocked ? "dialog" : undefined}
        aria-expanded={isUnlocked ? showPopover : undefined}
        testId="key_state_indicator"
      />
      {showPopover ? (
        <KeyStatePopover
          anchorRef={anchorRef}
          onClose={closePopover}
          onLock={onLock}
          userId={userId}
        />
      ) : null}
    </span>
  );
};

export default inject<TStore>(({ filesStore, userStore }) => ({
  syncEncryptedRoom: filesStore.syncEncryptedRoom,
  userId: userStore.user?.id ? String(userStore.user.id) : undefined,
}))(observer(KeyStateIndicator));
