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


import {
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { DropDown } from "@onlyoffice/apps-ui-kit/components/drop-down";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { useIsMobile } from "@onlyoffice/apps-ui-kit/hooks/use-is-mobile";
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
  const isMobileView = useIsMobile();
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
  // The menu stays hidden until it has placed itself, and a hidden element
  // takes no focus: the focus moves in on the first frame it is shown.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const focusOnMount = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
    if (!node) return;
    let frames = 0;
    const moveFocus = () => {
      node.focus();
      if (document.activeElement !== node && node.isConnected && frames < 30) {
        frames += 1;
        requestAnimationFrame(moveFocus);
      }
    };
    moveFocus();
  }, []);

  // Escape closes the popover wherever the focus is, since a pick in the
  // preset list leaves it on the page, and before the page's own Escape
  // handlers move it. An open preset list keeps its Escape.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (contentRef.current?.querySelector('[aria-expanded="true"]')) return;
      e.preventDefault();
      e.stopPropagation();
      onClose(true);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

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
      isMobileView={isMobileView}
      eventTypes={["mousedown"]}
      clickOutsideAction={onClickOutside}
      className={styles.popover}
      dataTestId="key_state_popover"
    >
      <div
        ref={focusOnMount}
        className={styles.content}
        tabIndex={-1}
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
