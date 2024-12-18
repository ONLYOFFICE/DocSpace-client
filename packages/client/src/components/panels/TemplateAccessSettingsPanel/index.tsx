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

import { useEffect, useState, useCallback, useMemo } from "react";
import { observer, inject } from "mobx-react";
import { Trans, withTranslation } from "react-i18next";
import { TTranslation } from "@docspace/shared/types";

import { EmployeeType } from "@docspace/shared/enums";
import Filter from "@docspace/shared/api/people/filter";
import { isDesktop, isMobile } from "@docspace/shared/utils";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import PeopleSelector from "@docspace/shared/selectors/People";

import {
  StyledBlock,
  StyledSubHeader,
  StyledToggleButton,
  StyledDescription,
  StyledBody,
} from "./StyledInvitePanel";

import ItemsList from "./sub-components/ItemsList";
import InviteInput from "./sub-components/InviteInput";

const PEOPLE_TAB_ID = "0";

type TemplateAccessSettingsPanelProps = {
  t: TTranslation;
  tReady: boolean;
  templateItem: object | null;
  templateEventVisible: VoidFunction;
  visible: boolean;
  setIsVisible: (visible: boolean) => void;
  setInfoPanelIsMobileHidden: (visible: boolean) => void;
  onCreateRoomFromTemplate: (item: object) => void;
};

const TemplateAccessSettingsPanel = ({
  t,
  tReady,
  visible,
  setIsVisible,
  templateItem,
  setInfoPanelIsMobileHidden,
  onCreateRoomFromTemplate,
  templateEventVisible,
}: TemplateAccessSettingsPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [inviteItems, setInviteItems] = useState([]);

  const [hasErrors, setHasErrors] = useState(false);

  const [scrollAllPanelContent, setScrollAllPanelContent] = useState(false);
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [selectedTab, setSelectedTab] = useState(PEOPLE_TAB_ID);

  useEffect(() => {
    const hasError = inviteItems.some(
      (inviteItem) => !!inviteItem.errors?.length,
    );

    setHasErrors(hasError);
  }, [inviteItems]);

  const onCheckHeight = () => {
    setScrollAllPanelContent(!isDesktop());
    setIsMobileView(isMobile());
  };

  const onAvailableChange = () => {
    setIsAvailable(!isAvailable);
  };

  const onClose = useCallback(() => {
    setInfoPanelIsMobileHidden(false);
    setIsVisible(false);
  }, [setInfoPanelIsMobileHidden, setIsVisible]);

  const onClickBack = () => {
    onClose();
    if (templateItem && !templateEventVisible) {
      onCreateRoomFromTemplate({ ...templateItem, isEdit: true });
    }
  };
  const onCloseUsersPanel = () => {
    setAddUsersPanelVisible(false);
  };

  const onClosePanels = () => {
    onClose();
    onCloseUsersPanel();
  };

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLTextAreaElement;

      if (target?.id === "InvitePanelWrapper") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [onMouseDown]);

  useEffect(() => {
    if (isMobileView) window.addEventListener("mousedown", onMouseDown);
  }, [isMobileView, onMouseDown]);

  const onKeyPress = (e: KeyboardEvent) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const onSubmit = () => {
    setIsLoading(true);
    toastr.success("onSubmit");
    console.log("onSave"); // TODO: Templates
    setIsLoading(false);
  };

  const removeExist = (items) => {
    const filtered = items.reduce((unique, o) => {
      !unique.some((obj) =>
        obj.isGroup ? obj.id === o.id : obj.email === o.email,
      ) && unique.push(o);

      return unique;
    }, []);

    if (items.length > filtered.length) toastr.warning(t("UsersAlreadyAdded"));

    return filtered;
  };

  const onSubmitItems = (users) => {
    console.log("addItems", users);

    const items = [...users, ...inviteItems];

    const filtered = removeExist(items);

    setInviteItems(filtered);
    // setInputValue("");
    // setUsersList([]);
    onCloseUsersPanel();
  };

  const getSelectedTab = (id: string) => setSelectedTab(id);

  const infoText =
    selectedTab === PEOPLE_TAB_ID ? (
      <Trans
        t={t}
        ns="Files"
        i18nKey="AddUsersOrGroupsInfo"
        values={{ productName: t("Common:ProductName") }}
        components={{ 1: <strong /> }}
      />
    ) : (
      <Trans
        t={t}
        ns="Files"
        i18nKey="AddUsersOrGroupsInfoGroups"
        values={{ productName: t("Common:ProductName") }}
        components={{ 1: <strong /> }}
      />
    );

  //////////
  const roomType = 2; // TODO: Templates
  // const roomType = -1;
  const hasInvitedUsers = !!inviteItems.length;

  const filter = new Filter();
  filter.role = [EmployeeType.Admin, EmployeeType.User]; // 1(EmployeeType.User) - RoomAdmin | 3(EmployeeType.Admin) - DocSpaceAdmin

  const invitedUsers = useMemo(
    () => inviteItems.map((item) => item.id),
    [inviteItems],
  );

  return (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
      isLoading={!tReady}
      isBackButton={true} // TODO: Templates
      onBackClick={onClickBack}
      onSubmit={onSubmit}
      withForm
      containerVisible={addUsersPanelVisible}
    >
      {addUsersPanelVisible ? (
        <ModalDialog.Container>
          <PeopleSelector
            useAside
            onClose={onClosePanels}
            onSubmit={onSubmitItems}
            submitButtonLabel={t("Common:AddButton")}
            disableSubmitButton={false}
            isMultiSelect
            disableDisabledUsers
            withGroups
            withInfo
            infoText={infoText}
            withoutBackground={isMobileView}
            withBlur={!isMobileView}
            withInfoBadge
            roomId={36} // TODO: Templates
            disableInvitedUsers={invitedUsers}
            // withGuests
            withHeader
            filter={filter}
            headerProps={{
              headerLabel: t("Common:Contacts"),
              withoutBackButton: false,
              withoutBorder: true,
              isCloseable: true,
              onBackClick: onCloseUsersPanel,
              onCloseClick: onClosePanels,
            }}
            setActiveTab={getSelectedTab}
          />
        </ModalDialog.Container>
      ) : (
        <></>
      )}

      <ModalDialog.Header>{t("Files:AccessSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <>
          <StyledBlock>
            <StyledSubHeader inline>
              {t("Files:TemplateAvailable")}

              <StyledToggleButton
                className="invite-via-link"
                isChecked={isAvailable}
                onChange={onAvailableChange}
              />
            </StyledSubHeader>
            <StyledDescription>
              {t("Files:TemplateAvailableDescription", {
                productName: t("Common:ProductName"),
              })}
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
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-invitation"
          scale
          size={ButtonSize.normal}
          isDisabled={hasErrors || !hasInvitedUsers || isLoading}
          primary
          label={t("Common:SaveButton")}
          type="submit"
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          isDisabled={isLoading}
          onClick={onClose}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    infoPanelStore,
    filesStore,
    filesActionsStore,
  }: TStore) => {
    const { theme } = settingsStore;
    const { setIsMobileHidden: setInfoPanelIsMobileHidden } = infoPanelStore;
    const { selection, bufferSelection } = filesStore;
    const { onCreateRoomFromTemplate } = filesActionsStore;
    const {
      templateAccessSettingsVisible,
      setTemplateAccessSettingsVisible,
      templateEventVisible,
    } = dialogsStore;

    return {
      theme,
      visible: templateAccessSettingsVisible,
      setIsVisible: setTemplateAccessSettingsVisible,
      setInfoPanelIsMobileHidden,
      templateItem: selection.length ? selection[0] : bufferSelection,
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
