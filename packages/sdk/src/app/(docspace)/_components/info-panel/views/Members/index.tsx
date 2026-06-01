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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { FolderType, RoomsType } from "@docspace/shared/enums";

import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TGroup } from "@docspace/shared/api/groups/types";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import { isDesktop } from "@docspace/shared/utils";
import { GENERAL_LINK_HEADER_KEY } from "@docspace/shared/constants";
import { createExternalLink, getPrimaryLink } from "@docspace/shared/api/rooms";
import { EditGroupMembers } from "@docspace/shared/dialogs/edit-group-members-dialog";
import MembersList from "@docspace/shared/components/share/sub-components/List";

import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import PlusReactSvgUrl from "PUBLIC_DIR/images/plus.react.svg?url";

import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import InvitePanel from "@/app/(rooms)/_components/invite-panel";

import type { UseMembersReturn } from "./useMembers";
import User from "./sub-components/User";
import LinkRow from "./sub-components/LinkRow";
import EmptyContainer from "./sub-components/EmptyContainer";
import RoomHeader from "./sub-components/RoomHeader";
import styles from "./Members.module.scss";

type MembersViewProps = {
  selection: TFile | TFolder;
  membersData: UseMembersReturn;
};

const TooltipContent = ({ content }: { content: React.ReactNode }) => (
  <Text fontSize="12px">{content}</Text>
);

const Members = observer(({ selection, membersData }: MembersViewProps) => {
  const { t } = useTranslation(["Common"]);
  const docsUserStore = useDocsUserStore();
  const selfId = docsUserStore.user?.id;

  const [invitePanelVisible, setInvitePanelVisible] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [editGroup, setEditGroup] = React.useState<TGroup | null>(null);

  const room = selection as unknown as TRoom;
  const folder = selection as TFolder;

  const roomType = room.roomType;
  const isPublicRoom = roomType === RoomsType.PublicRoom;
  const isFormRoom = roomType === RoomsType.FormRoom;
  const isCustomRoom = roomType === RoomsType.CustomRoom;
  const isPublicRoomType =
    (isPublicRoom || isFormRoom || isCustomRoom) && !room.private;
  const hasEditAccess = Boolean(room.security?.EditAccess);
  const isTemplate = room.rootFolderType === FolderType.RoomTemplates;
  const isArchiveFolder = false;

  const {
    searchValue,
    handleSearchMembers,
    members,
    fetchMoreMembers,
    changeUserRole,
    total,
    isMembersPanelUpdating,
    setIsMembersPanelUpdating,
    primaryLink,
    setPrimaryLink,
    additionalLinks,
    setAdditionalLinks,
  } = membersData;

  React.useEffect(() => {
    setShowSearch(false);
  }, [selection.id]);

  const onSearchClose = React.useCallback(() => {
    setShowSearch(false);
    handleSearchMembers("");
  }, [handleSearchMembers]);

  const onAddNewLink = async () => {
    try {
      if (isPublicRoom || primaryLink) {
        const link = await createExternalLink(selection.id);
        setAdditionalLinks((prev) => [...prev, link]);
      } else {
        const link = await getPrimaryLink(selection.id);
        setPrimaryLink(link);
      }
      toastr.success(t("Common:RoomLinkSuccessfullyCreatedAndCopied"));
    } catch (error) {
      toastr.error(error as Error);
      console.error(error);
    }
  };

  const getPublicRoomItems = () => {
    const publicRoomItems: React.ReactNode[] = [];

    const countCanCreateLink = Math.max(
      0,
      (room?.shareSettings?.ExternalLink ?? 0) +
        (room?.shareSettings?.PrimaryExternalLink ?? 0) -
        1,
    );

    const canAddLink = (room?.shareSettings?.ExternalLink ?? 0) > 0;

    if (
      isPublicRoomType &&
      room?.security?.EditAccess &&
      !searchValue &&
      !isTemplate
    ) {
      if (!isArchiveFolder || primaryLink) {
        publicRoomItems.push(
          <div
            className={styles.linksBlock}
            key={GENERAL_LINK_HEADER_KEY}
            data-testid="info_panel_members_links_block"
          >
            <Text
              fontSize="14px"
              fontWeight={600}
              lineHeight="16px"
              color="var(--info-panel-subtitle-color)"
            >
              {isFormRoom ? t("Common:PublicLink") : t("Common:SharedLinks")}
            </Text>

            {!isArchiveFolder && canAddLink ? (
              <div
                data-tooltip-id="emailTooltip"
                data-tooltip-content={t(
                  "Common:MaximumNumberOfExternalLinksCreated",
                )}
              >
                <IconButton
                  className="link-to-viewing-icon"
                  iconName={LinksToViewingIconUrl}
                  onClick={onAddNewLink}
                  size={16}
                  isDisabled={
                    additionalLinks
                      ? additionalLinks.length >= countCanCreateLink
                      : false
                  }
                  title={t("Common:RoomAddNewLink")}
                  dataTestId="info_panel_members_add_new_link_button"
                />

                {additionalLinks &&
                additionalLinks.length >= countCanCreateLink ? (
                  <Tooltip
                    float={isDesktop()}
                    id="emailTooltip"
                    getContent={TooltipContent}
                    place="bottom"
                  />
                ) : null}
              </div>
            ) : null}
          </div>,
        );
      }

      if (primaryLink && !searchValue) {
        publicRoomItems.push(
          <div data-share key="general-link">
            <LinkRow
              link={primaryLink}
              selection={folder}
              t={t}
              onLinkUpdate={(updated) => setPrimaryLink(updated)}
              onLinkRemoved={() => setPrimaryLink(null)}
            />
          </div>,
        );
      }

      if (additionalLinks && additionalLinks.length && !searchValue) {
        additionalLinks.forEach((link) => {
          publicRoomItems.push(
            <div data-share key={link?.sharedTo?.id}>
              <LinkRow
                link={link}
                selection={folder}
                t={t}
                onLinkUpdate={(updated) =>
                  setAdditionalLinks((prev) =>
                    prev.map((l) =>
                      l.sharedTo.id === updated.sharedTo.id ? updated : l,
                    ),
                  )
                }
                onLinkRemoved={() =>
                  setAdditionalLinks((prev) =>
                    prev.filter((l) => l.sharedTo.id !== link.sharedTo.id),
                  )
                }
              />
            </div>,
          );
        });
      } else if (!isArchiveFolder && !primaryLink && !searchValue) {
        publicRoomItems.push(
          <div
            key="create-additional-link"
            className={classNames("additional-link", styles.createLinkRow)}
            onClick={onAddNewLink}
            data-share
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onAddNewLink()}
            data-testid="info_panel_members_create_additional_link"
          >
            <div className={styles.createLinkIcon}>
              <IconButton size={12} iconName={PlusReactSvgUrl} isDisabled />
            </div>

            <Link
              noHover
              type={LinkType.action}
              fontSize="14px"
              fontWeight={600}
              className="external-row-link"
            >
              {t("Common:RoomCreateNewLink")}
            </Link>
          </div>,
        );
      }
    }

    return publicRoomItems;
  };

  const getContent = () => {
    if (!members) return <InfoPanelViewLoader view="members" />;

    const [currentMember] = members.administrators.filter(
      (member) => member.id === selfId,
    );

    const { administrators, users, expected, groups, guests } = members;

    const membersList = [
      ...administrators,
      ...groups,
      ...users,
      ...guests,
      ...expected,
    ];

    const adminsTitleCount = administrators.length ? 1 : 0;
    const usersTitleCount = users.length ? 1 : 0;
    const expectedTitleCount = expected.length ? 1 : 0;
    const groupsTitleCount = groups.length ? 1 : 0;
    const guestsTitleCount = guests.length ? 1 : 0;

    const headersCount = searchValue
      ? 0
      : adminsTitleCount +
        usersTitleCount +
        expectedTitleCount +
        groupsTitleCount +
        guestsTitleCount;

    const publicRoomItems = getPublicRoomItems();

    const showPublicRoomBar =
      ((primaryLink && !isArchiveFolder) || isPublicRoom) &&
      room?.security?.EditAccess &&
      !searchValue &&
      !isTemplate;

    const publicRoomItemsLength = publicRoomItems.length;

    if (!membersList.length) {
      return <EmptyContainer />;
    }

    return (
      <>
        {showPublicRoomBar ? (
          <div
            className={styles.publicRoomBarContainer}
            data-testid="info_panel_members_public_room_bar_container"
          >
            <PublicRoomBar
              headerText={
                isFormRoom
                  ? t("Common:RoomMembersAvailableViaSharedLink")
                  : t("Common:RoomMembersAvailableViaExternalLink")
              }
              bodyText={
                isFormRoom
                  ? t("Common:RoomFormBarDescription")
                  : t("Common:RoomPublicBarDescription")
              }
            />
          </div>
        ) : null}

        <MembersList
          loadNextPage={fetchMoreMembers}
          hasNextPage={
            !isMembersPanelUpdating
              ? membersList.length - headersCount < total
              : false
          }
          itemCount={total + headersCount + publicRoomItemsLength}
          linksBlockLength={publicRoomItemsLength}
          withoutTitlesAndLinks={!!searchValue}
        >
          {publicRoomItems}
          {membersList.map((user, index) => {
            return (
              <User
                user={user}
                key={
                  user.id ||
                  ("email" in user && user.email) ||
                  ("name" in user && user.name) ||
                  ""
                }
                currentUser={currentMember}
                hasNextPage={
                  !isMembersPanelUpdating
                    ? membersList.length - headersCount < total
                    : false
                }
                searchValue={searchValue}
                room={room}
                changeUserRole={changeUserRole}
                onOpenGroup={setEditGroup}
                index={index + publicRoomItemsLength}
              />
            );
          })}
        </MembersList>
      </>
    );
  };

  return (
    <div className={styles.membersList} data-testid="info_panel_members">
      <RoomHeader
        selection={folder}
        hasEditAccess={hasEditAccess}
        showSearch={showSearch}
        onSearchOpen={() => setShowSearch(true)}
        onSearchClose={onSearchClose}
        setSearchValue={handleSearchMembers}
        onInvite={() => setInvitePanelVisible(true)}
      />

      {getContent()}

      {invitePanelVisible ? (
        <InvitePanel
          visible
          roomId={Number(selection.id)}
          roomType={roomType}
          onClose={() => setInvitePanelVisible(false)}
          onMembersUpdated={() => setIsMembersPanelUpdating(true)}
        />
      ) : null}

      {editGroup ? (
        <EditGroupMembers
          infoPanelSelection={selection}
          group={editGroup}
          visible
          standalone
          setVisible={(visible: boolean) => {
            if (!visible) setEditGroup(null);
          }}
          onClose={() => setEditGroup(null)}
        />
      ) : null}
    </div>
  );
});

export default Members;
