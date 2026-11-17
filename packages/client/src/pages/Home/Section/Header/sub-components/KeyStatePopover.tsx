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


import { type RefObject, useCallback, useEffect, useId, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { DropDown } from "@onlyoffice/apps-ui-kit/components/drop-down";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { getDeviceUnlockWrittenAt } from "@docspace/shared/services/encryption/device-unlock-store";

import { AutoLockSetting } from "SRC_DIR/components/AutoLockSetting/AutoLockSetting";

import styles from "./KeyStatePopover.module.scss";

const KEYS_MANAGEMENT_PATH = "/profile/keys-management";

type KeyStatePopoverProps = {
  /** The indicator the popover opens from. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Closes the popover; `returnFocus` sends the focus back to the indicator. */
  onClose: (returnFocus: boolean) => void;
  onLock: () => void;
  userId?: string;
};

/**
 * The key actions of an unlocked key, opened from the key state indicator.
 * Spec: private-rooms/key-management, "Key state indicator leads to the key actions"
 */
const KeyStatePopover = ({
  anchorRef,
  onClose,
  onLock,
  userId,
}: KeyStatePopoverProps) => {
  const { t } = useTranslation(["Common"]);
  const navigate = useNavigate();
  const lockNoteId = useId();
  const [isDeviceRemembered, setIsDeviceRemembered] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    void getDeviceUnlockWrittenAt(userId).then((writtenAt) => {
      if (!cancelled) setIsDeviceRemembered(writtenAt !== null);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);
  // The menu mounts its content after it has placed itself, so the focus
  // moves in when the content appears.
  const focusOnMount = useCallback((node: HTMLDivElement | null) => {
    node?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // An open list inside takes its own Escape first.
    if (e.key !== "Escape" || e.defaultPrevented) return;
    e.preventDefault();
    e.stopPropagation();
    onClose(true);
  };

  const onClickOutside = (e: Event) => {
    if (anchorRef.current?.contains(e.target as Node)) return;
    onClose(false);
  };

  const onOpenKeysManagement = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose(false);
    navigate(KEYS_MANAGEMENT_PATH);
  };

  return (
    <DropDown
      open
      role="dialog"
      ariaLabel={t("Common:KeyUnlocked")}
      forwardedRef={anchorRef}
      directionX="left"
      directionY="bottom"
      manualWidth="320px"
      eventTypes={["mousedown"]}
      clickOutsideAction={onClickOutside}
      dataTestId="key_state_popover"
    >
      <div
        ref={focusOnMount}
        className={styles.content}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <Text fontSize="14px" fontWeight={600}>
          {t("Common:KeyUnlocked")}
        </Text>
        <AutoLockSetting inPlace />
        <div className={styles.actions}>
          <Button
            size={ButtonSize.small}
            label={t("Common:LockNow")}
            onClick={onLock}
            aria-describedby={isDeviceRemembered ? lockNoteId : undefined}
            testId="key_state_lock_now"
          />
          <Link
            type={LinkType.page}
            href={KEYS_MANAGEMENT_PATH}
            fontSize="13px"
            fontWeight={600}
            isHovered
            onClick={onOpenKeysManagement}
            dataTestId="key_state_keys_management_link"
          >
            {t("Common:KeysManagement")}
          </Link>
        </div>
        {isDeviceRemembered ? (
          <Text
            id={lockNoteId}
            fontSize="12px"
            color="var(--text-secondary)"
            dataTestId="key_state_lock_note"
          >
            {t("Common:LockNowForgetsDevice")}
          </Text>
        ) : null}
      </div>
    </DropDown>
  );
};

export default KeyStatePopover;
