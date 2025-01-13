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

import { EmployeeType, ShareAccessRights } from "@docspace/shared/enums";
import Filter from "@docspace/shared/api/people/filter";
import { isDesktop, isMobile } from "@docspace/shared/utils";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import PeopleSelector from "@docspace/shared/selectors/People";
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { TSelectorItem } from "@docspace/shared/components/selector";
import {
  getRoomMembers,
  updateRoomMemberRole,
} from "@docspace/shared/api/rooms";
import { TRoom } from "@docspace/shared/api/rooms/types";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";

import {
  StyledBlock,
  StyledSubHeader,
  StyledToggleButton,
  StyledDescription,
  StyledBody,
  StyledTemplateAccessSettingsContainer,
  StyledTemplateAccessSettingsHeader,
  StyledTemplateAccessSettingsBody,
  StyledTemplateAccessSettingsFooter,
} from "./StyledInvitePanel";

import ItemsList from "./sub-components/ItemsList";
import InviteInput from "./sub-components/InviteInput";

const PEOPLE_TAB_ID = "0";

type TemplateAccessSettingsContainer =
  | {
      isContainer: true;
      usersPanelIsVisible: boolean;
      setUsersPanelIsVisible: (visible: boolean) => void;
      onClosePanels: VoidFunction;
      onCloseAccessSettings: VoidFunction;
    }
  | {
      isContainer?: undefined;
      usersPanelIsVisible?: undefined;
      setUsersPanelIsVisible?: undefined;
      onClosePanels?: undefined;
      onCloseAccessSettings?: undefined;
    };

type TemplateAccessSettingsPanelProps = {
  t: TTranslation;
  tReady: boolean;
  templateItem: TRoom;
  // templateEventVisible: VoidFunction;
  visible: boolean;
  setIsVisible: (visible: boolean) => void;
  setInfoPanelIsMobileHidden: (visible: boolean) => void;
  // onCreateRoomFromTemplate: (item: object) => void;
} & TemplateAccessSettingsContainer;

const TemplateAccessSettingsPanel = ({
  t,
  tReady,
  visible,
  setIsVisible,
  templateItem,
  setInfoPanelIsMobileHidden,
  // onCreateRoomFromTemplate,
  // templateEventVisible,
  isContainer,
  usersPanelIsVisible,
  setUsersPanelIsVisible,
  onClosePanels,
  onCloseAccessSettings,
}: TemplateAccessSettingsPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [inviteItems, setInviteItems] = useState([]);

  const [hasErrors, setHasErrors] = useState(false);

  const [scrollAllPanelContent, setScrollAllPanelContent] = useState(false);
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [selectedTab, setSelectedTab] = useState(PEOPLE_TAB_ID);

  const templateId = templateItem?.id;

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

  // const onClickBack = () => {
  //   onClose();
  //   if (templateItem && !templateEventVisible) {
  //     onCreateRoomFromTemplate({ ...templateItem, isEdit: true });
  //   }
  // };

  const onCloseUsersPanel = () => {
    if (isContainer) setUsersPanelIsVisible(false);
    else setAddUsersPanelVisible(false);
  };

  const setPanelVisible = (isVisible: boolean) => {
    if (isContainer) setUsersPanelIsVisible(isVisible);
    else setAddUsersPanelVisible(isVisible);
  };

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLTextAreaElement;

      if (target?.id === "InvitePanelWrapper") onClose();
    },
    [onClose],
  );

  const getTemplateMembers = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const templateMembersData = await getRoomMembers(templateId, {});

      if (templateMembersData?.items?.length) {
        const convertedItems = templateMembersData.items.map(
          ({ access, isOwner, sharedTo }) => {
            return { access, isOwner, ...sharedTo };
          },
        );
        setInviteItems(convertedItems);
      }
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTemplateMembers();
  }, []);

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

    const invitations = inviteItems
      .filter((i) => !i.isOwner)
      .map((inviteItem) => {
        return {
          id: inviteItem.id,
          access: inviteItem.access ?? ShareAccessRights.RoomManager,
        };
      });

    updateRoomMemberRole(templateId, {
      invitations,
      notify: false,
      sharingMessage: "",
    })
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  // const removeExist = (items: TSelectorItem[]) => {
  //   const obj1 = {};
  //   const filtered = items.filter((x) => {
  //     if (obj1[x.id]) return false;
  //     obj1[x.id] = true;
  //     return true;
  //   });

  //   if (items.length > filtered.length) toastr.warning(t("UsersAlreadyAdded"));

  //   return filtered;
  // };

  const onSubmitItems = (users: TSelectorItem[]) => {
    const items = [...inviteItems, ...users];

    // const filtered = removeExist(items);
    // setInviteItems(filtered);
    setInviteItems(items);

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

  const roomType = templateItem?.roomType;
  const hasInvitedUsers = !!inviteItems.length;

  const filter = Filter.getDefault();
  filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];

  const invitedUsers = useMemo(
    () => inviteItems.map((item) => item.id),
    [inviteItems],
  );

  const TemplateAccessSettingsContent = (
    <StyledTemplateAccessSettingsContainer>
      <StyledTemplateAccessSettingsHeader>
        <IconButton
          className="arrow-button"
          iconName={ArrowPathReactSvgUrl}
          size={17}
          onClick={onCloseAccessSettings}
          isFill
          isClickable
        />
        <Text
          fontSize="21px"
          fontWeight={700}
          className="header-component"
          noSelect
        >
          {t("Files:AccessSettings")}
        </Text>
        <IconButton
          size={17}
          className="close-button"
          iconName={CrossReactSvgUrl}
          onClick={onClosePanels}
          isClickable
          isStroke
        />
      </StyledTemplateAccessSettingsHeader>
      <StyledTemplateAccessSettingsBody>
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
            inviteItems={inviteItems}
            setInviteItems={setInviteItems}
            roomType={roomType}
            addUsersPanelVisible={usersPanelIsVisible}
            setAddUsersPanelVisible={setPanelVisible}
            isMobileView={isMobileView}
            isDisabled={isAvailable}
            roomId={templateId}
            // removeExist={removeExist}
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
      </StyledTemplateAccessSettingsBody>

      <StyledTemplateAccessSettingsFooter>
        <Button
          className="send-invitation"
          scale
          size={ButtonSize.normal}
          isDisabled={hasErrors || !hasInvitedUsers || isLoading}
          primary
          label={t("Common:SaveButton")}
          onClick={onSubmit}
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          isDisabled={isLoading}
          onClick={onCloseUsersPanel}
          label={t("Common:CancelButton")}
        />
      </StyledTemplateAccessSettingsFooter>
    </StyledTemplateAccessSettingsContainer>
  );

  return !isContainer ? (
    <ModalDialog
      visible={visible}
      displayType={ModalDialogType.aside}
      onClose={onClose}
      withBodyScroll
      isLoading={!tReady}
      // isBackButton={true} // TODO: Templates
      // onBackClick={onClickBack} // TODO: Templates
      onSubmit={onSubmit}
      withForm
      containerVisible={addUsersPanelVisible}
    >
      <ModalDialog.Container>
        {addUsersPanelVisible ? (
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
            roomId={templateId}
            disableInvitedUsers={invitedUsers}
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
        ) : null}
      </ModalDialog.Container>

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
              inviteItems={inviteItems}
              setInviteItems={setInviteItems}
              roomType={roomType}
              addUsersPanelVisible={
                isContainer ? usersPanelIsVisible : addUsersPanelVisible
              }
              setAddUsersPanelVisible={setAddUsersPanelVisible}
              isMobileView={isMobileView}
              isDisabled={isAvailable}
              roomId={templateId}
              // removeExist={removeExist}
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
          isLoading={isLoading}
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
  ) : (
    TemplateAccessSettingsContent
  );
};

export default inject(
  ({ dialogsStore, infoPanelStore, filesStore, filesActionsStore }: TStore) => {
    const { setIsMobileHidden: setInfoPanelIsMobileHidden } = infoPanelStore;
    const { selection, bufferSelection } = filesStore;
    const { onCreateRoomFromTemplate } = filesActionsStore;
    const {
      templateAccessSettingsVisible,
      setTemplateAccessSettingsVisible,
      templateEventVisible,
    } = dialogsStore;

    return {
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
