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

"use client";

import isNull from "lodash/isNull";
import isUndefined from "lodash/isUndefined";
import { useState, useCallback, useMemo, useTransition } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import InfoSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { ButtonSize, Button } from "../../components/button";
import PublicRoomBar from "../../components/public-room-bar";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import {
  FillingRoleSelector,
  type IRole,
} from "../../components/filling-role-selector";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import PeopleSelector from "../../selectors/People";
import type {
  HeaderProps,
  TAccessRight,
  TOnSubmit,
} from "../../components/selector/Selector.types";

import styles from "./StartFillingPanel.module.scss";
import { getAccessOptions } from "../../utils/getAccessOptions";
import { RoomsType, ShareAccessRights } from "../../enums";

import type {
  Invitation,
  IStartFillingPanelProps,
} from "./StartFillingPanel.types";
import { Header } from "./StartFillingPanel.helpers";

const StartFillingPanel = ({
  user,
  fileId,
  roomId,
  settings,
  inviteUserToRoom,
  setStartFillingPanelVisible,
  withBorder,
  canEditRoom = false,
  ...props
}: IStartFillingPanelProps) => {
  const [infoBarVisible, setInfoBarVisible] = useLocalStorage(
    `start-filling-panel-${user.id}`,
    true,
  );
  const { t } = useTranslation("Common");
  const [currentRoleIndex, setCurrentRoleIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();

  const accessOptions = useMemo(
    () =>
      getAccessOptions(
        t,
        RoomsType.VirtualDataRoom,
        false,
        true,
        user.isOwner,
        user.isAdmin,
        settings.standalone,
      ),
    [t, settings, user],
  );

  const selectedAccessRight = useMemo(
    () =>
      accessOptions.find(
        (option) =>
          "access" in option && option.access === ShareAccessRights.FormFilling,
      ) ?? accessOptions[accessOptions.length - 1],
    [accessOptions],
  );

  const [roles, setRoles] = useState<IRole[]>(() => props.roles);

  const [isRoleSelectorVisible, setIsRoleSelectorVisible] = useState(false);
  const [isInvitePanelVisible, setIsInvitePanelVisible] = useState(false);

  const closeUsersPanel = useCallback(() => {
    setIsRoleSelectorVisible(false);
  }, []);
  const closeStartFillingPanel = useCallback(() => {
    setStartFillingPanelVisible(false);
  }, [setStartFillingPanelVisible]);

  const closeInvitePanel = useCallback(() => {
    setIsInvitePanelVisible(false);
  }, []);

  const openInvitePanel = useCallback(() => {
    if (!canEditRoom) return;

    setIsInvitePanelVisible(true);
  }, [canEditRoom]);

  const onSubmit = async () => {
    startTransition(async () => {
      await props
        .onSubmit({
          formId: fileId,
          roles: roles.map((role) => ({
            userId: role.user!.id,
            roleName: role.name,
            roleColor: role.color.split("#")[1],
            roomId: Number(roomId),
          })),
        })
        .catch((err) => {
          console.log(err);
        });
      startTransition(() => {
        closeStartFillingPanel();
      });
    });
  };

  const onSelectUser: TOnSubmit = useCallback(
    (item) => {
      if (item.length === 0) return;

      const selectedUser = item[0];

      const { avatar, id, displayName } = selectedUser;

      if (id && displayName) {
        setRoles((prev) => {
          if (currentRoleIndex === -1) return prev;

          const role = prev[currentRoleIndex];
          const newRole = {
            ...role,
            user: {
              id: id.toString(),
              avatar,
              displayName,
            },
          };
          return prev.map((x, i) => (i === currentRoleIndex ? newRole : x));
        });
      }
      setIsRoleSelectorVisible(false);
    },
    [currentRoleIndex, setRoles],
  );

  const inviteUsers: TOnSubmit = async (selectedItems, access) => {
    if (isNull(access) || selectedItems.length === 0) return;

    const invitations = selectedItems.reduce<Invitation[]>((acc, item) => {
      if (isUndefined(item.id)) return acc;

      const temp = {
        id: item.id,
        access: access.access,
      };

      return [...acc, temp];
    }, []);

    await inviteUserToRoom(roomId, invitations).catch((err) => {
      console.log(err);
    });

    setIsInvitePanelVisible(false);
  };

  const onSelect = (roleId: number) => {
    setCurrentRoleIndex(roleId);
    setIsRoleSelectorVisible(true);
  };

  const checkIfUserInvited = useCallback(() => false, []);

  const removeUserFromRole = (roleIdx: number) => {
    setRoles((prev) => {
      if (roleIdx === -1) return prev;

      const role = prev[roleIdx];
      const newRole = {
        ...role,
        user: null,
      };
      return prev.map((x, i) => (i === roleIdx ? newRole : x));
    });
  };

  const disabledSubmit = roles.some((role) => !role.user);

  const headerProps = useMemo(
    () =>
      ({
        headerLabel: t("Common:AssignToRole"),
        withoutBackButton: false,
        withoutBorder: false,
        isCloseable: true,
        onBackClick: closeUsersPanel,
        onCloseClick: () => {
          closeUsersPanel();
          closeStartFillingPanel();
        },
      }) satisfies HeaderProps,
    [closeUsersPanel, closeStartFillingPanel, t],
  );

  const invitePanelSelectorHeader = useMemo(
    () =>
      ({
        headerLabel: t("Common:ListAccounts"),
        withoutBackButton: false,
        withoutBorder: true,
        isCloseable: true,
        onBackClick: closeInvitePanel,
        onCloseClick: () => {
          closeInvitePanel();
          closeUsersPanel();
          closeStartFillingPanel();
        },
      }) satisfies HeaderProps,
    [closeInvitePanel, closeUsersPanel, closeStartFillingPanel, t],
  );

  return (
    <ModalDialog
      visible
      withBodyScroll
      withBorder={withBorder}
      onClose={closeStartFillingPanel}
      displayType={ModalDialogType.aside}
      containerVisible={isRoleSelectorVisible || isInvitePanelVisible}
      withoutPadding
    >
      <ModalDialog.Container>
        {isRoleSelectorVisible && !isInvitePanelVisible ? (
          <PeopleSelector
            roomId={roomId}
            useAside
            withHeader
            withGuests
            onlyRoomMembers
            withCancelButton
            alwaysShowFooter
            onSubmit={onSelectUser}
            onCancel={closeUsersPanel}
            onClose={closeUsersPanel}
            submitButtonLabel={t("Common:SelectAction")}
            cancelButtonLabel={t("Common:CancelButton")}
            disableDisabledUsers={false}
            disableSubmitButton={false}
            checkIfUserInvited={checkIfUserInvited}
            injectedElement={
              <Header
                t={t}
                canEditRoom={canEditRoom}
                className={styles.header}
                roleName={roles[currentRoleIndex]?.name ?? ""}
                openInvitePanel={openInvitePanel}
              />
            }
            headerProps={headerProps}
          />
        ) : null}

        {isInvitePanelVisible ? (
          <PeopleSelector
            roomId={roomId}
            useAside
            withHeader
            withGuests
            isMultiSelect
            alwaysShowFooter
            withAccessRights
            accessRights={accessOptions as TAccessRight[]}
            selectedAccessRight={selectedAccessRight as TAccessRight}
            onAccessRightsChange={() => {}}
            onSubmit={inviteUsers}
            onClose={closeInvitePanel}
            submitButtonLabel={t("Common:AddToRoom")}
            disableDisabledUsers={false}
            disableSubmitButton={false}
            headerProps={invitePanelSelectorHeader}
          />
        ) : null}
      </ModalDialog.Container>
      <ModalDialog.Header>{t("Common:StartFilling")}</ModalDialog.Header>
      <ModalDialog.Body>
        <section className={styles.container}>
          {infoBarVisible ? (
            <>
              <PublicRoomBar
                headerText={t("Common:FillingStatusBarTitle")}
                bodyText={t("Common:FillingStatusBarDescription")}
                iconName={InfoSvgUrl}
                onClose={() => setInfoBarVisible(false)}
              />
              <hr className={styles.divider} />
            </>
          ) : null}
          <p
            className={classNames(styles.title, {
              [styles.titleMargin]: !infoBarVisible,
            })}
          >
            {t("Common:RolesFromTheForm")}
          </p>
          <FillingRoleSelector
            roles={roles}
            onSelect={onSelect}
            removeUserFromRole={removeUserFromRole}
            currentUserId={user.id}
          />
        </section>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="shared_move-to-archived-modal_submit"
          key="OKButton"
          label={t("Common:Start")}
          size={ButtonSize.normal}
          primary
          scale
          isDisabled={disabledSubmit}
          onClick={onSubmit}
          isLoading={isPending}
        />
        <Button
          id="shared_move-to-archived-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={closeStartFillingPanel}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default StartFillingPanel;
