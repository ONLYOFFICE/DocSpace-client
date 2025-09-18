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

import { useEffect } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMacOs } from "react-device-detect";
import { Heading } from "@docspace/shared/components/heading";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import Base from "@docspace/shared/themes/base";

import { StyledHotkeysPanel } from "./StyledHotkeys";
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
    className: "hotkey-key-description",
  };
  const keyTextStyles = {
    ...textStyles,
    ...{ color: theme.hotkeys.key.color, className: "hotkeys-key" },
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
        <StyledHotkeysPanel>
          <Heading className="hotkeys_sub-header">
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
              <Heading className="hotkeys_sub-header">
                {t("HotkeysCreatingObjects")}
              </Heading>
              <CreationBlock
                t={t}
                textStyles={textStyles}
                keyTextStyles={keyTextStyles}
                AltKey={AltKey}
              />
              <Heading className="hotkeys_sub-header">
                {t("HotkeysUploadingObjects")}
              </Heading>
              <UploadBlock
                t={t}
                textStyles={textStyles}
                keyTextStyles={keyTextStyles}
              />
            </>
          ) : null}
          <Heading className="hotkeys_sub-header">
            {t("HotkeysSelection")}
          </Heading>
          <SelectionBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
            AltKey={AltKey}
          />
          <Heading className="hotkeys_sub-header">{t("HotkeysMove")}</Heading>
          <MoveBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
          />
          <Heading className="hotkeys_sub-header">
            {t("HotkeysActions")}
          </Heading>
          <ActionsBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
          />
          <Heading className="hotkeys_sub-header">
            {t("HotkeysApplicationActions")}
          </Heading>
          <ApplicationActionsBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
          />
          <Heading className="hotkeys_sub-header">
            {t("HotkeysActionsInPreview")}
          </Heading>
          <PreviewActionsBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
          />
        </StyledHotkeysPanel>
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
