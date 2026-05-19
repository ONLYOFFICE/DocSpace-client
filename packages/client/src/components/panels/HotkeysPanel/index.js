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

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMacOs } from "react-device-detect";
import { Heading } from "@docspace/ui-kit/components/heading";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import Base from "@docspace/ui-kit/providers/theme/themes/base";
import styles from "./HotkeysPanel.module.scss";
import SelectionBlock from "./SelectionBlock";
import MoveBlock from "./MoveBlock";
import ActionsBlock from "./ActionsBlock";
import ApplicationActionsBlock from "./ApplicationActionsBlock";
import PreviewActionsBlock from "./PreviewActionsBlock";
import NavigationBlock from "./NavigationBlock";
import CreationBlock from "./CreationBlock";
import UploadBlock from "./UploadBlock";

const HotkeysPanel = ({
  visible,
  setHotkeyPanelVisible,
  t,
  theme = Base,
  tReady,
  isVisitor,
}) => {
  const onClose = () => setHotkeyPanelVisible(false);
  const textStyles = {
    fontSize: "13px",
    fontWeight: 600,
    className: styles.hotkeyKeyDescription,
  };
  const keyTextStyles = {
    ...textStyles,
    ...{ color: theme.hotkeys.key.color, className: styles.hotkeysKey },
  };

  const CtrlKey = isMacOs ? "⌘" : "Ctrl";
  const AltKey = isMacOs ? "⌥" : "Alt";

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);

    return () => document.removeEventListener("keyup", onKeyPress);
  });

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
    >
      <ModalDialog.Header>{t("Common:Hotkeys")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div>
          <Heading className={styles.hotkeysSubHeader}>
            {t("HotkeysNavigation")}
          </Heading>
          <NavigationBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            AltKey={AltKey}
          />
          {!isVisitor ? (
            <>
              <Heading className={styles.hotkeysSubHeader}>
                {t("HotkeysCreatingObjects")}
              </Heading>
              <CreationBlock
                t={t}
                textStyles={textStyles}
                keyTextStyles={keyTextStyles}
                AltKey={AltKey}
              />
              <Heading className={styles.hotkeysSubHeader}>
                {t("HotkeysUploadingObjects")}
              </Heading>
              <UploadBlock
                t={t}
                textStyles={textStyles}
                keyTextStyles={keyTextStyles}
              />
            </>
          ) : null}
          <Heading className={styles.hotkeysSubHeader}>
            {t("HotkeysSelection")}
          </Heading>
          <SelectionBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
            AltKey={AltKey}
          />
          <Heading className={styles.hotkeysSubHeader}>
            {t("HotkeysMove")}
          </Heading>
          <MoveBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
          />
          <Heading className={styles.hotkeysSubHeader}>
            {t("HotkeysActions")}
          </Heading>
          <ActionsBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
          />
          <Heading className={styles.hotkeysSubHeader}>
            {t("HotkeysApplicationActions")}
          </Heading>
          <ApplicationActionsBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
          />
          <Heading className={styles.hotkeysSubHeader}>
            {t("HotkeysActionsInPreview")}
          </Heading>
          <PreviewActionsBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
          />
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default inject(({ settingsStore, publicRoomStore, userStore }) => {
  const { hotkeyPanelVisible, setHotkeyPanelVisible, theme } = settingsStore;

  return {
    visible: hotkeyPanelVisible,
    setHotkeyPanelVisible,
    theme,
    isVisitor: userStore?.user?.isVisitor || publicRoomStore.isPublicRoom,
  };
})(
  withTranslation(["HotkeysPanel", "Article", "Common", "Files"])(
    observer(HotkeysPanel),
  ),
);
