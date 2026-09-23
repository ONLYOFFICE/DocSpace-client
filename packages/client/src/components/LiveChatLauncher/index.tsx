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

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { zendeskAPI } from "@onlyoffice/apps-ui-kit/components/article/zendesk/Zendesk.utils";
import SupportIcon from "PUBLIC_DIR/images/support.react.svg";
import CrossIcon from "PUBLIC_DIR/images/icons/12/cross.react.svg";

import styles from "./LiveChatLauncher.module.scss";

/** What ProfileActionsStore's menu actions take - a plain i18next `t`. */
type TTranslation = (
  key: string,
  options?: Record<string, string | number>,
) => string;

type LiveChatLauncherProps = {
  /**
   * The create button holds the same corner, so the launcher steps aside by
   * its width to sit next to it instead of on top of it.
   */
  withFloatingButton: boolean;
  isInfoPanelVisible: boolean;
  /**
   * Switches live chat off - the same action the profile menu toggle runs.
   * The launcher is only on screen while live chat is on, so the toggle can
   * only ever turn it off from here.
   */
  onLiveChatClick: (t: TTranslation) => void;
};

/**
 * The Support button.
 *
 * Zendesk ships a launcher of its own, but it is an iframe the vendor sizes
 * and places: it could only be nudged with offsets added to a margin of its
 * own, which is how it ended up a different size and off the line the create
 * button stands on. ui-kit's loader keeps that launcher hidden and this button
 * opens the chat instead, so the corner is laid out by the same stylesheet
 * variables as everything else in it.
 */
const LiveChatLauncher = ({
  withFloatingButton,
  isInfoPanelVisible,
  onLiveChatClick,
}: LiveChatLauncherProps) => {
  const { t } = useTranslation(["Common"]);

  const onClick = useCallback(() => {
    // The widget is hidden, and `open` does nothing while it is: showing it
    // first is what brings the chat up. The loader hides it again on close.
    zendeskAPI.addChanges("webWidget", "show");
    zendeskAPI.addChanges("webWidget", "open");
  }, []);

  const onClose = useCallback(() => {
    onLiveChatClick(t);
  }, [onLiveChatClick, t]);

  return (
    <div
      className={styles.launcher}
      data-with-floating-button={withFloatingButton ? "true" : "false"}
      data-with-info-panel={isInfoPanelVisible ? "true" : "false"}
      data-testid="live-chat-launcher"
    >
      <button
        type="button"
        className={styles.button}
        data-testid="live-chat-launcher-button"
        onClick={onClick}
      >
        <SupportIcon className={styles.icon} />
        {t("Common:Support")}
      </button>

      {/* Without this, switching live chat off means remembering that the
          toggle lives in the profile menu. */}
      <button
        type="button"
        className={styles.close}
        aria-label={t("Common:CloseButton")}
        data-testid="live-chat-launcher-close"
        onClick={onClose}
      >
        <CrossIcon />
      </button>
    </div>
  );
};

export default LiveChatLauncher;
