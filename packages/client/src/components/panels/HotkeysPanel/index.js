// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useRef } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { Heading } from "@docspace/shared/components/heading";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { StyledHotkeysPanel, StyledScrollbar } from "./StyledHotkeys";
import SelectionBlock from "./SelectionBlock";
import MoveBlock from "./MoveBlock";
import ActionsBlock from "./ActionsBlock";
import ApplicationActionsBlock from "./ApplicationActionsBlock";
import PreviewActionsBlock from "./PreviewActionsBlock";
import NavigationBlock from "./NavigationBlock";
import CreationBlock from "./CreationBlock";
import UploadBlock from "./UploadBlock";
import { isMacOs } from "react-device-detect";
import Base from "@docspace/shared/themes/base";

const HotkeyPanel = ({
  visible,
  setHotkeyPanelVisible,
  t,
  theme,
  tReady,
  isVisitor,
}) => {
  const scrollRef = useRef(null);

  const onClose = () => setHotkeyPanelVisible(false);
  const textStyles = {
    fontSize: "13px",
    fontWeight: 600,
    className: "hotkey-key-description",
    noSelect: true,
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
    scrollRef.current && scrollRef?.current?.contentElement.focus();
    document.addEventListener("keyup", onKeyPress);

    return () => document.removeEventListener("keyup", onKeyPress);
  });

  return (
    <StyledHotkeysPanel>
      <Backdrop
        onClick={onClose}
        visible={visible}
        isAside={true}
        zIndex={210}
      />
      <Aside
        className="hotkeys-panel"
        visible={visible}
        onClose={onClose}
        withoutBodyScroll={true}
      >
        <div className="hotkeys_header">
          <Heading className="hotkeys_heading">{t("Common:Hotkeys")}</Heading>
        </div>
        <StyledScrollbar ref={scrollRef}>
          <Heading className="hotkeys_sub-header">
            {t("HotkeysNavigation")}
          </Heading>
          <NavigationBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            AltKey={AltKey}
          />
          {!isVisitor && (
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
          )}
          <Heading className="hotkeys_sub-header">
            {t("HotkeysSelection")}
          </Heading>
          <SelectionBlock
            t={t}
            textStyles={textStyles}
            keyTextStyles={keyTextStyles}
            CtrlKey={CtrlKey}
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
        </StyledScrollbar>
      </Aside>
    </StyledHotkeysPanel>
  );
};

HotkeyPanel.defaultProps = { theme: Base };

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
    observer(HotkeyPanel),
  ),
);
