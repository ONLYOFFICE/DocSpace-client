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

import { useEffect, useState, useMemo, useRef } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
import { DeviceType } from "@docspace/shared/enums";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { isDesktop, isMobile, size } from "@docspace/shared/utils";

import {
  StyledBlock,
  StyledHeading,
  StyledInvitePanel,
  StyledButtons,
  StyledControlContainer,
  StyledCrossIconMobile,
  StyledSubHeader,
  StyledToggleButton,
  StyledDescription,
  StyledBody,
} from "./StyledInvitePanel";

import ItemsList from "./sub-components/ItemsList";
import InviteInput from "./sub-components/InviteInput";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { IconButton } from "@docspace/shared/components/icon-button";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";

const TemplateAccessSettingsPanel = ({
  t,
  item,
  visible,
  setIsVisible,
  setInfoPanelIsMobileHidden,
  currentDeviceType,
  onCreateRoomFromTemplate,
  templateEventVisible,
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [inviteItems, setInviteItems] = useState([]);

  const [hasErrors, setHasErrors] = useState(false);

  const [scrollAllPanelContent, setScrollAllPanelContent] = useState(false);
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const zIndex = 311;

  useEffect(() => {
    const hasErrors = inviteItems.some((item) => !!item.errors?.length);

    setHasErrors(hasErrors);
  }, [inviteItems]);

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  useEffect(() => {
    isMobileView && window.addEventListener("mousedown", onMouseDown);
  }, [isMobileView]);

  const onMouseDown = (e) => {
    if (e.target.id === "InvitePanelWrapper") onClose();
  };

  const onCheckHeight = () => {
    setScrollAllPanelContent(!isDesktop());
    setIsMobileView(isMobile());
  };

  const onAvailableChange = () => {
    setIsAvailable(!isAvailable);
  };

  const onArrowClick = () => {
    onClose();
    if (item && !templateEventVisible) {
      onCreateRoomFromTemplate({ ...item, isEdit: true });
    }
  };

  const onClose = () => {
    setInfoPanelIsMobileHidden(false);
    setIsVisible(false);
  };

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const roomType = 2; //TODO: Templates
  // const roomType = -1;
  const hasInvitedUsers = !!inviteItems.length;

  const bodyInvitePanel = useMemo(() => {
    return (
      <>
        <StyledBlock noPadding>
          <StyledSubHeader inline>
            {t("Files:TemplateAvailable")}

            <StyledToggleButton
              className="invite-via-link"
              isChecked={isAvailable}
              onChange={onAvailableChange}
            />
          </StyledSubHeader>
          <StyledDescription>
            {t("Files:TemplateAvailableDescription")}
          </StyledDescription>
        </StyledBlock>
        <StyledBody isDisabled={isAvailable}>
          <InviteInput
            t={t}
            onClose={onClose}
            inviteItems={inviteItems}
            setInviteItems={setInviteItems}
            roomType={roomType}
            addUsersPanelVisible={addUsersPanelVisible}
            setAddUsersPanelVisible={setAddUsersPanelVisible}
            isMobileView={isMobileView}
            isDisabled={isAvailable}
          />
          <StyledSubHeader className="invite-input-text">
            {t("Files:AccessToTemplate")}
          </StyledSubHeader>
          {hasInvitedUsers && (
            <ItemsList
              t={t}
              inviteItems={inviteItems}
              setInviteItems={setInviteItems}
              scrollAllPanelContent={scrollAllPanelContent}
              isDisabled={isAvailable}
            />
          )}
        </StyledBody>
      </>
    );
  }, [
    t,
    roomType,
    onClose,
    setHasErrors,
    scrollAllPanelContent,
    hasInvitedUsers,
  ]);

  const invitePanelNode = (
    <>
      <StyledBlock
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <IconButton
          size={17}
          iconName={ArrowPathReactSvgUrl}
          className="sharing_panel-arrow"
          onClick={onArrowClick}
        />
        <StyledHeading>{t("Files:AccessSettings")}</StyledHeading>
      </StyledBlock>
      {
        <>
          {scrollAllPanelContent ? (
            <div className="invite-panel-body">
              <Scrollbar>{bodyInvitePanel}</Scrollbar>
            </div>
          ) : (
            bodyInvitePanel
          )}

          <StyledButtons>
            <Button
              className="send-invitation"
              scale={true}
              size={"normal"}
              isDisabled={hasErrors || !hasInvitedUsers}
              primary
              onClick={() => console.log("onSave")} //TODO: Templates
              label={t("Common:SaveButton")}
            />
            <Button
              className="cancel-button"
              scale={true}
              size={"normal"}
              onClick={onClose}
              label={t("Common:CancelButton")}
            />
          </StyledButtons>
        </>
      }
    </>
  );

  const invitePanelComponent = (
    <StyledInvitePanel
      id="InvitePanelWrapper"
      hasInvitedUsers={hasInvitedUsers}
      scrollAllPanelContent={scrollAllPanelContent}
      addUsersPanelVisible={addUsersPanelVisible}
    >
      {isMobileView ? (
        <div className="invite_panel">
          <StyledControlContainer onClick={onClose}>
            <StyledCrossIconMobile />
          </StyledControlContainer>
          {invitePanelNode}
        </div>
      ) : (
        <>
          <Backdrop
            onClick={onClose}
            visible={visible}
            isAside={true}
            zIndex={currentDeviceType === DeviceType.mobile ? 11 : zIndex}
          />
          <Aside
            className="invite_panel"
            visible={visible}
            onClose={onClose}
            withoutBodyScroll
            zIndex={zIndex}
          >
            {invitePanelNode}
          </Aside>
        </>
      )}
    </StyledInvitePanel>
  );

  const renderPortalInvitePanel = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={invitePanelComponent}
        appendTo={rootElement}
        visible={visible}
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortalInvitePanel()
    : invitePanelComponent;
};

export default inject(
  ({
    settingsStore,
    peopleStore,
    dialogsStore,
    infoPanelStore,
    filesStore,
    filesActionsStore,
  }) => {
    const { theme, currentDeviceType } = settingsStore;
    const { getUsersByQuery } = peopleStore.usersStore;
    const { setIsMobileHidden: setInfoPanelIsMobileHidden } = infoPanelStore;
    const { selection, bufferSelection } = filesStore;
    const { onCreateRoomFromTemplate } = filesActionsStore;
    const {
      templateAccessSettingsVisible,
      setTemplateAccessSettingsVisible,
      templateEventVisible,
    } = dialogsStore;

    const item = selection.length
      ? selection[0]
      : bufferSelection
        ? bufferSelection
        : null;

    return {
      getUsersByQuery,
      theme,
      visible: templateAccessSettingsVisible,
      setIsVisible: setTemplateAccessSettingsVisible,
      setInfoPanelIsMobileHidden,
      currentDeviceType,
      item,
      onCreateRoomFromTemplate,
      templateEventVisible,
    };
  },
)(
  withTranslation([
    "InviteDialog",
    "SharingPanel",
    "Translations",
    "Common",
    "InfoPanel",
    "PeopleSelector",
  ])(observer(TemplateAccessSettingsPanel)),
);
