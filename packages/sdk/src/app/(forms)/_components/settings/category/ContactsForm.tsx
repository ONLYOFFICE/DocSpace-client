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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import { EmployeeType, ShareAccessRights } from "@docspace/ui-kit/enums";

import { updateRoomMemberRole } from "@docspace/shared/api/rooms";
import { updateUserType } from "@docspace/shared/api/people";
import type { RoomMember } from "@docspace/shared/api/rooms/types";
import type { TUser } from "@docspace/shared/api/people/types";

import { useFormsSettingsStore } from "../../../_store/FormsSettingsStore";
import { useFormsUserStore } from "../../../_store/FormsUserStore";

import styles from "./SettingsPanel.module.scss";

const ALLOWED_ACCESS = new Set([
  ShareAccessRights.FullAccess,
  ShareAccessRights.RoomManager,
  ShareAccessRights.Collaborator,
]);

type ContactsFormProps = {
  inline?: boolean;
  members?: RoomMember[];
  onMembersChange?: () => void;
};

type SelectorTarget = "admin" | "manager" | null;

const ContactsForm = ({
  inline,
  members = [],
  onMembersChange,
}: ContactsFormProps) => {
  const { t } = useTranslation(["Common"]);
  const { roomId } = useFormsSettingsStore();
  const { user: currentUser } = useFormsUserStore();
  const [selectorTarget, setSelectorTarget] =
    React.useState<SelectorTarget>(null);

  const admins = React.useMemo(
    () =>
      members.filter(
        (m) =>
          ALLOWED_ACCESS.has(m.access) &&
          "isAdmin" in m.sharedTo &&
          (m.sharedTo.isAdmin || m.sharedTo.isOwner),
      ),
    [members],
  );

  const managers = React.useMemo(
    () =>
      members.filter(
        (m) =>
          ALLOWED_ACCESS.has(m.access) &&
          "isAdmin" in m.sharedTo &&
          !m.sharedTo.isAdmin &&
          !m.sharedTo.isOwner,
      ),
    [members],
  );

  const disableInvitedUsers = React.useMemo(
    () =>
      [...admins, ...managers]
        .map((m) => ("id" in m.sharedTo ? String(m.sharedTo.id) : ""))
        .filter(Boolean),
    [admins, managers],
  );

  const onAddAdmin = React.useCallback(() => {
    setSelectorTarget("admin");
  }, []);

  const onAddManager = React.useCallback(() => {
    setSelectorTarget("manager");
  }, []);

  const onCloseSelector = React.useCallback(() => {
    setSelectorTarget(null);
  }, []);

  const onRemoveMember = React.useCallback(
    async (userId: string, isAdmin?: boolean) => {
      if (!roomId) return;

      try {
        const promises: Promise<unknown>[] = [
          updateRoomMemberRole(roomId, {
            invitations: [{ id: userId, access: 0 }],
            notify: false,
            force: false,
            sharingMessage: "",
          }),
        ];

        if (isAdmin) {
          promises.push(updateUserType(EmployeeType.RoomAdmin, [userId]));
        }

        await Promise.all(promises);

        onMembersChange?.();
      } catch {
        // silently ignore — member list will refresh on next open
      }
    },
    [roomId, onMembersChange],
  );

  const onSubmitSelector = React.useCallback(
    async (selectedItems: TSelectorItem[]) => {
      if (!roomId || selectedItems.length === 0) return;

      try {
        const isAdmin = selectorTarget === "admin";
        const access = ShareAccessRights.RoomManager;

        const promises: Promise<unknown>[] = [
          updateRoomMemberRole(roomId, {
            invitations: selectedItems.map((item) => ({
              id: item.id,
              access,
            })),
            notify: true,
            message: t("Common:InvitationMessage"),
          }),
        ];

        promises.push(
          updateUserType(
            isAdmin ? EmployeeType.Admin : EmployeeType.RoomAdmin,
            selectedItems.map((item) => String(item.id)),
          ),
        );

        await Promise.all(promises);

        onMembersChange?.();
        setSelectorTarget(null);
      } catch {
        // silently ignore — member list will refresh on next open
      }
    },
    [selectorTarget, roomId, onMembersChange, t],
  );

  return (
    <>
      <div className={inline ? styles.inlineBody : styles.panelBody}>
        <div className={styles.toggleBlock}>
          <div className={styles.toggleHeader}>
            <Text fontSize="16px" fontWeight={700}>
              {t("Common:FormAdmins")}
            </Text>
          </div>
          <Text fontSize="12px" fontWeight={400}>
            {t("Common:FormAdminsDescription")}
          </Text>
          <div className={styles.buttonWrapper}>
            <Button
              label={t("Common:AddButton")}
              size={ButtonSize.small}
              primary
              onClick={onAddAdmin}
            />
          </div>
          {admins.map((member) => {
            const user = member.sharedTo as TUser;
            return (
              <div key={user.id} className={styles.memberRow}>
                <Avatar
                  size={AvatarSize.min}
                  role={AvatarRole.none}
                  source={user.hasAvatar ? user.avatar : ""}
                  userName={user.displayName}
                />
                <div className={styles.memberInfo}>
                  <Text fontSize="13px" fontWeight={600} truncate>
                    {user.displayName}
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight={400}
                    color="var(--text-secondary)"
                    truncate
                  >
                    {user.email}
                  </Text>
                </div>
                {currentUser?.id !== user.id && (
                  <IconButton
                    iconName={CrossReactSvgUrl}
                    size={12}
                    onClick={() => onRemoveMember(String(user.id), true)}
                    title={t("Common:Remove")}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.toggleBlock}>
          <div className={styles.toggleHeader}>
            <Text fontSize="16px" fontWeight={700}>
              {t("Common:FormManagers")}
            </Text>
          </div>
          <Text fontSize="12px" fontWeight={400}>
            {t("Common:FormManagersDescription")}
          </Text>
          <div className={styles.buttonWrapper}>
            <Button
              label={t("Common:AddButton")}
              size={ButtonSize.small}
              primary
              onClick={onAddManager}
            />
          </div>
          {managers.map((member) => {
            const user = member.sharedTo as TUser;
            return (
              <div key={user.id} className={styles.memberRow}>
                <Avatar
                  size={AvatarSize.min}
                  role={AvatarRole.none}
                  source={user.hasAvatar ? user.avatar : ""}
                  userName={user.displayName}
                />
                <div className={styles.memberInfo}>
                  <Text fontSize="13px" fontWeight={600} truncate>
                    {user.displayName}
                  </Text>
                  <Text
                    fontSize="12px"
                    fontWeight={400}
                    color="var(--text-secondary)"
                    truncate
                  >
                    {user.email}
                  </Text>
                </div>
                {currentUser?.id !== user.id && (
                  <IconButton
                    iconName={CrossReactSvgUrl}
                    size={12}
                    onClick={() => onRemoveMember(String(user.id))}
                    title={t("Common:Remove")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectorTarget ? (
        <PeopleSelector
          useAside
          isMultiSelect
          withHeader
          disableInvitedUsers={disableInvitedUsers}
          headerProps={{
            headerLabel:
              selectorTarget === "admin"
                ? t("Common:FormAdmins")
                : t("Common:FormManagers"),
            onCloseClick: onCloseSelector,
            onBackClick: onCloseSelector,
            withoutBackButton: false,
            withoutBorder: false,
          }}
          submitButtonLabel={t("Common:AddButton")}
          disableSubmitButton={false}
          onClose={onCloseSelector}
          onSubmit={onSubmitSelector}
        />
      ) : null}
    </>
  );
};

export default observer(ContactsForm);
