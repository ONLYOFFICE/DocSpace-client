// (c) Copyright Ascensio System SIA 2009-2026
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

import { useCallback, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, toastr } from "@docspace/ui-kit/components";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { isDesktop, isMobile } from "@docspace/shared/utils";
import { ShareAccessRights } from "@docspace/ui-kit/enums";
import { PeopleSelectorProps } from "@docspace/ui-kit/selectors/People/PeopleSelector.types";
import type { AccessSettingsPanelProps } from "./AccessSettingsPanel.types";

import styles from "./AccessSettingsPanel.module.scss";
import InviteInput from "./sub-components/InviteInput";
import ItemsList from "./sub-components/ItemsList";

import {
  getFakeFileSharedUsers,
  getFakeFilesIsAvailable,
  setFakeFilesIsAvailable,
  shareFakeFileToUsers,
} from "@docspace/shared/api/files";

const AccessSettingsPanel = ({
  visible,
  item,
  currentUser,
  setAccessSettingsPanelVisible,
  getFileIcon,
  roomId,
}: AccessSettingsPanelProps) => {
  const handleClose = useCallback(() => {
    setAccessSettingsPanelVisible(false);
  }, [setAccessSettingsPanelVisible]);

  const { t } = useTranslation(["Common", "Files"]);

  const [isLoading, setIsLoading] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [addContactsPanelVisible, setAddContactsPanelVisible] = useState(false);
  const [accessItems, setAccessItems] = useState<TSelectorItem[]>([]);
  const [scrollAllPanelContent, setScrollAllPanelContent] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [isAvailable, setIsAvailable] = useState(false);
  const [prevIsAvailable, setPrevIsAvailable] = useState<boolean>(false);

  const onCheckHeight = () => {
    setScrollAllPanelContent(!isDesktop());
    setIsMobileView(isMobile());
  };

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
    };
  }, [isMobileView]);

  const onChangeAvailable = () => {
    setIsAvailable(!isAvailable);
  };

  const onCloseAccessSelector = () => {
    setAddContactsPanelVisible(false);
  };

  const onSubmitItems = (users: TSelectorItem[]) => {
    const items = [...accessItems, ...users];

    setAccessItems(items);
    onCloseAccessSelector();
  };

  const setAccessItemsAction = (items: TSelectorItem[]) => {
    setAccessItems(items);
  };

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = [];

      if (accessItems.length) {
        const shareUsers = accessItems.map((x) => ({
          access: ShareAccessRights.FullAccess,
          shareTo: x.id?.toString() ?? "",
        }));
        requests.push(shareFakeFileToUsers(item?.id, shareUsers));
      }

      if (prevIsAvailable !== isAvailable) {
        requests.push(setFakeFilesIsAvailable?.(item?.id, isAvailable));
      }

      if (requests.length) {
        await Promise.all(requests);
      }

      setIsLoading(false);

      handleClose();
    } catch (error) {
      console.error("Failed to save access settings:", error);
      toastr.error(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [handleClose, isAvailable, accessItems]);

  const checkIfUserInvited: NonNullable<
    PeopleSelectorProps["checkIfUserInvited"]
  > = (user) => {
    return (
      accessItems.findIndex(
        (x) => x.id === user.id && x.templateAccess !== ShareAccessRights.None, // TODO:
      ) > -1
    );
  };

  const getAccessMembers = async () => {
    if (isLoading) return;

    setModalIsLoading(true);
    Promise.all([
      getFakeFileSharedUsers(item?.id),
      getFakeFilesIsAvailable(item?.id),
    ])
      .then(([members, available]) => {
        if (members?.items?.length) {
          const convertedItems = members.items.map(
            ({ access, isOwner, sharedTo }) => {
              return {
                templateAccess: access,
                templateIsOwner: isOwner,
                ...sharedTo,
              };
            },
          );
          // console.log("setAccessItems", items);
          setAccessItems(convertedItems as unknown as TSelectorItem[]);
        }

        setPrevIsAvailable(available);
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
    getAccessMembers();
  }, []);

  const itemTitle = item?.title || "";
  const fileExst = item && "fileExst" in item ? item?.fileExst : "";
  const icon = fileExst ? getFileIcon?.(fileExst) : undefined;

  const hasInvitedUsers = !!accessItems.length;

  return (
    <ModalDialog
      visible={visible}
      onClose={handleClose}
      displayType={ModalDialogType.aside}
      withBodyScroll
      isLarge
      withoutPadding
      containerVisible={addContactsPanelVisible}
      isLoading={modalIsLoading || isLoading}
    >
      <ModalDialog.Container>
        {addContactsPanelVisible ? (
          <>
            <PeopleSelector
              useAside
              onClose={handleClose!}
              onSubmit={onSubmitItems}
              submitButtonLabel={t("Common:AddButton")}
              disableSubmitButton={false}
              isMultiSelect
              disableDisabledUsers
              withGroups
              roomId={roomId}
              disableInvitedUsers={accessItems.map((item) => String(item.id))}
              checkIfUserInvited={checkIfUserInvited}
              withHeader
              headerProps={{
                headerLabel: t("Common:Contacts"),
                withoutBackButton: false,
                withoutBorder: true,
                isCloseable: true,
                onBackClick: onCloseAccessSelector,
                onCloseClick: onCloseAccessSelector,
              }}
            />
          </>
        ) : null}
      </ModalDialog.Container>

      <ModalDialog.Header>{t("Files:AccessSettings")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.itemRow}>
          {icon && <ReactSVG src={icon} className={styles.icon} />}
          <Text className={styles.itemTitle} truncate>
            {itemTitle}
          </Text>
        </div>

        <div className={styles.block}>
          <Heading className={classNames(styles.subHeader, styles.inline)}>
            {t("Files:FileAvailable")}

            <ToggleButton
              className={styles.toggleButton}
              isChecked={isAvailable}
              onChange={onChangeAvailable}
            />
          </Heading>

          <Text className={styles.description}>
            {t("Files:AllRoomContactsCanView")}
          </Text>
        </div>

        <div
          className={classNames(styles.body, {
            [styles.isDisabled]: isAvailable,
          })}
        >
          <InviteInput
            inviteItems={accessItems}
            setInviteItems={setAccessItemsAction}
            setAddUsersPanelVisible={setAddContactsPanelVisible}
            isDisabled={isAvailable}
            roomId={roomId}
          />

          <Heading
            className={classNames(styles.subHeader, "invite-input-text")}
            style={{ margin: "21px 0px 15px" }}
          >
            {item.isFolder
              ? t("Files:AccessToFolder")
              : t("Files:AccessToFile")}
          </Heading>
          {hasInvitedUsers ? (
            <ItemsList
              t={t}
              inviteItems={accessItems}
              setInviteItems={setAccessItemsAction}
              scrollAllPanelContent={scrollAllPanelContent}
              isDisabled={isAvailable}
              currentUserId={currentUser?.id}
            />
          ) : null}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:SaveButton")}
          onClick={handleSave}
          isLoading={isLoading}
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={handleClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ dialogsStore, userStore, filesSettingsStore, infoPanelStore }: TStore) => {
    const {
      accessSettingsPanelVisible,
      accessSettingsPanelItem,
      setAccessSettingsPanelVisible,
    } = dialogsStore;

    const { user } = userStore;
    const { getFileIcon } = filesSettingsStore;
    const { infoPanelRoomSelection } = infoPanelStore;

    return {
      visible: accessSettingsPanelVisible,
      item: accessSettingsPanelItem,
      currentUser: user,
      setAccessSettingsPanelVisible,
      getFileIcon,
      roomId: infoPanelRoomSelection?.id,
    };
  },
)(observer(AccessSettingsPanel));
