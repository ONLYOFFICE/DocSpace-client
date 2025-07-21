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

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";
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
import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { TUser } from "@docspace/shared/api/people/types";
import {
  getRoomMembers,
  getTemplateAvailable,
  setTemplateAvailable,
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
import TemplateAccessSelector from "../../TemplateAccessSelector";
import ItemsList from "./sub-components/ItemsList";
import InviteInput from "./sub-components/InviteInput";

type TemplateAccessSettingsContainer =
  | {
      isContainer: true;
      setUsersPanelIsVisible: (visible: boolean) => void;
      onClosePanels: VoidFunction;
      onCloseAccessSettings: VoidFunction;
      onSetAccessSettings: VoidFunction;
      inviteItems: TSelectorItem[];
      setInviteItems: (inviteItems: TSelectorItem[]) => void;
      updateInfoPanelMembers: undefined;
      templateIsAvailable: boolean;
      setTemplateIsAvailable: (isAvailable: boolean) => void;
    }
  | {
      isContainer?: undefined;
      setUsersPanelIsVisible?: undefined;
      onClosePanels?: undefined;
      onCloseAccessSettings?: undefined;
      onSetAccessSettings?: undefined;
      inviteItems?: undefined;
      setInviteItems?: undefined;
      updateInfoPanelMembers: (t: TTranslation) => void;
      templateIsAvailable: undefined;
      setTemplateIsAvailable: undefined;
    };

type TemplateAccessSettingsPanelProps = {
  t: TTranslation;
  tReady: boolean;
  visible: boolean;
  setIsVisible: (visible: boolean) => void;
  templateItem: TRoom;
  setInfoPanelIsMobileHidden?: (visible: boolean) => void;
} & TemplateAccessSettingsContainer;

const TemplateAccessSettingsPanel = ({
  t,
  tReady,
  visible,
  setIsVisible,
  templateItem,
  setInfoPanelIsMobileHidden,
  isContainer,
  setUsersPanelIsVisible,
  onClosePanels,
  onCloseAccessSettings,
  inviteItems,
  setInviteItems,
  onSetAccessSettings,
  updateInfoPanelMembers,
  templateIsAvailable,
  setTemplateIsAvailable,
}: TemplateAccessSettingsPanelProps) => {
  const [accessItems, setAccessItems] = useState<TSelectorItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(templateIsAvailable ?? false);

  const [scrollAllPanelContent, setScrollAllPanelContent] = useState(false);
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const templateId = templateItem?.id;

  const prevIsAvailable = useRef<boolean>(undefined);

  const setAccessItemsAction = (items: TSelectorItem[]) => {
    if (isContainer) setInviteItems(items);
    else setAccessItems(items);
  };

  const onCheckHeight = () => {
    setScrollAllPanelContent(!isDesktop());
    setIsMobileView(isMobile());
  };

  const onAvailableChange = () => {
    if (isContainer) setTemplateIsAvailable(!templateIsAvailable);
    setIsAvailable(!isAvailable);
  };

  const onClose = useCallback(() => {
    if (setInfoPanelIsMobileHidden) {
      setInfoPanelIsMobileHidden(false);
    }

    setIsVisible(false);
  }, [setInfoPanelIsMobileHidden, setIsVisible]);

  const onBackClick = () => {
    if (addUsersPanelVisible) setAddUsersPanelVisible(false);
  };

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

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    if (isMobileView) window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [isMobileView, onMouseDown]);

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") onClose();
    if (e.key === "Backspace") onCloseAccessSettings?.();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const getTemplateMembers = async () => {
    if (isLoading) return;

    setModalIsLoading(true);
    Promise.all([
      getRoomMembers(templateId, {}),
      getTemplateAvailable(templateId),
    ])
      .then(([members, available]) => {
        if ((members as { items: TUser[] })?.items?.length) {
          const convertedItems = (members as { items: TUser[] }).items.map(
            ({ access, isOwner, sharedTo }) => {
              return {
                templateAccess: access,
                templateIsOwner: isOwner,
                ...sharedTo,
              };
            },
          );
          setAccessItems(convertedItems as TSelectorItem[]);
        }

        prevIsAvailable.current = available as boolean;
        setIsAvailable(available as boolean);
      })
      .catch((error) => {
        toastr.error(error as Error);
      })
      .finally(() => {
        setModalIsLoading(false);
      });
  };

  useEffect(() => {
    if (!isContainer) getTemplateMembers();
  }, [isContainer]);

  useEffect(() => {
    if (isContainer) {
      setAccessItems(inviteItems);
    }
  }, [isContainer, inviteItems]);

  const onSubmit = () => {
    if (isContainer) {
      onSetAccessSettings();
      return;
    }

    setIsLoading(true);

    if (prevIsAvailable.current !== isAvailable) {
      setTemplateAvailable?.(templateId, isAvailable)
        ?.then(() => updateInfoPanelMembers(t))
        .finally(() => {
          setIsLoading(false);
          onClose();
        });

      return;
    }

    const invitations = accessItems
      .filter((i) => !i.templateIsOwner)
      .map((inviteItem) => {
        return {
          id: inviteItem.id,
          access: inviteItem.templateAccess ?? ShareAccessRights.ReadOnly,
        };
      });

    updateRoomMemberRole(templateId, {
      invitations,
      notify: false,
      sharingMessage: "",
    })
      .then(() => updateInfoPanelMembers(t))
      .catch((err) => toastr.error(err))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  const onSubmitItems = (users: TSelectorItem[]) => {
    const items = [...accessItems, ...users];

    setAccessItemsAction(items);
    onCloseUsersPanel();
  };

  const onCloseClick = () => {
    if (isContainer) onClosePanels();
    else onClose();
  };

  const roomType = templateItem?.roomType;
  const hasInvitedUsers = !!accessItems.length;

  const filter = Filter.getDefault();
  filter.role = [EmployeeType.Admin, EmployeeType.RoomAdmin];

  const invitedUsers = useMemo(
    () => accessItems.map((item) => item.id),
    [accessItems],
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
        <Text fontSize="21px" fontWeight={700} className="header-component">
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
      <Scrollbar>
        <StyledTemplateAccessSettingsBody>
          <StyledBlock>
            <StyledSubHeader $inline>
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
              inviteItems={accessItems}
              setInviteItems={setAccessItemsAction}
              roomType={roomType}
              setAddUsersPanelVisible={setPanelVisible}
              isDisabled={isAvailable}
              roomId={templateId}
            />

            <StyledSubHeader className="invite-input-text">
              {t("Files:AccessToTemplate")}
            </StyledSubHeader>
            {hasInvitedUsers ? (
              <ItemsList
                t={t}
                inviteItems={accessItems}
                setInviteItems={setAccessItemsAction}
                scrollAllPanelContent={scrollAllPanelContent}
                isDisabled={isAvailable}
              />
            ) : null}
          </StyledBody>
        </StyledTemplateAccessSettingsBody>
      </Scrollbar>

      <StyledTemplateAccessSettingsFooter>
        <Button
          className="send-invitation"
          scale
          size={ButtonSize.normal}
          isDisabled={!hasInvitedUsers || isLoading}
          primary
          label={t("Common:SaveButton")}
          onClick={onSubmit}
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          isDisabled={isLoading}
          onClick={onCloseAccessSettings}
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
      onBackClick={onBackClick}
      withBodyScroll
      isLoading={!tReady || modalIsLoading}
      onSubmit={onSubmit}
      withForm
      withoutPadding
      containerVisible={addUsersPanelVisible}
    >
      <ModalDialog.Container>
        {addUsersPanelVisible ? (
          <TemplateAccessSelector
            roomId={templateId}
            onSubmit={onSubmitItems}
            onClose={onClosePanels}
            onCloseClick={onCloseClick}
            onBackClick={onCloseUsersPanel}
            disableInvitedUsers={invitedUsers as string[]}
          />
        ) : null}
      </ModalDialog.Container>

      <ModalDialog.Header>{t("Files:AccessSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <>
          <StyledBlock>
            <StyledSubHeader $inline>
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
              inviteItems={accessItems}
              setInviteItems={setAccessItemsAction}
              roomType={roomType}
              setAddUsersPanelVisible={setAddUsersPanelVisible}
              isDisabled={isAvailable}
              roomId={templateId}
            />
            <StyledSubHeader className="invite-input-text">
              {t("Files:AccessToTemplate")}
            </StyledSubHeader>
            {hasInvitedUsers ? (
              <ItemsList
                t={t}
                inviteItems={accessItems}
                setInviteItems={setAccessItemsAction}
                scrollAllPanelContent={scrollAllPanelContent}
                isDisabled={isAvailable}
              />
            ) : null}
          </StyledBody>
        </>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-invitation"
          scale
          size={ButtonSize.normal}
          isLoading={isLoading}
          isDisabled={!hasInvitedUsers || isLoading}
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
  (
    { dialogsStore, infoPanelStore, filesStore }: TStore,
    {
      isContainer = false,
      setIsVisible,
    }: {
      isContainer: boolean;
      setIsVisible: (visible: boolean) => void;
    },
  ) => {
    const {
      setIsMobileHidden: setInfoPanelIsMobileHidden,
      updateInfoPanelMembers,
      infoPanelSelection,
    } = infoPanelStore;
    const { selection, bufferSelection } = filesStore;
    const {
      templateAccessSettingsVisible,
      setTemplateAccessSettingsVisible,
      templateEventVisible,
    } = dialogsStore;

    return {
      setInfoPanelIsMobileHidden,
      templateItem: selection.length
        ? selection[0]
        : (bufferSelection ?? infoPanelSelection),
      templateEventVisible,
      visible: isContainer ? false : templateAccessSettingsVisible,
      setIsVisible: isContainer
        ? setIsVisible
        : setTemplateAccessSettingsVisible,
      updateInfoPanelMembers,
    };
  },
)(
  withTranslation(["Files", "Common", "InfoPanel"])(
    observer(TemplateAccessSettingsPanel),
  ),
);
