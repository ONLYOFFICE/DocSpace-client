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

import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import className from "classnames";

import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import { GENERAL_LINK_HEADER_KEY } from "@docspace/shared/constants";
import { createExternalLink } from "@docspace/shared/api/rooms";
import MembersList from "@docspace/shared/components/share/sub-components/List";

import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import { useLoader } from "../../helpers/useLoader";

import User from "./sub-components/User";
import EmptyContainer from "./sub-components/EmptyContainer";
import LinkRow from "./sub-components/LinkRow";

import { MembersProps } from "./Members.types";
import styles from "./Members.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const TooltipContent = ({ content }: { content: React.ReactNode }) => (
  <Text fontSize="12px">{content}</Text>
);

const Members = ({
  members,
  total,
  searchValue,
  isFirstLoading,

  fetchMoreMembers,
  changeUserRole,
  scrollToTop,

  infoPanelSelection,
  selfId,
  isPublicRoomType,
  isFormRoom,
  isArchiveFolder,
  isPublicRoom,
  isCustomRoom,

  primaryLink,

  additionalLinks,
  getPrimaryLink,
  setExternalLink,

  isMembersPanelUpdating,
  setAccessSettingsIsVisible,
  templateAvailable,
}: MembersProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "People",
    "PeopleTranslations",
    "Settings",
    "CreateEditRoomDialog",
  ]);

  const { showLoading } = useLoader({
    isFirstLoading,
  });

  useEffect(() => {
    if (isMembersPanelUpdating) return;
    scrollToTop();
  }, [isMembersPanelUpdating, scrollToTop]);

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      const roomId = infoPanelSelection!.id;

      try {
        const link = await createExternalLink(roomId);

        setExternalLink!(link);
      } catch (error) {
        toastr.error(error as Error);
        console.error(error);
      }
    } else {
      getPrimaryLink!(infoPanelSelection!.id).then((link) => {
        setExternalLink!(link);

        const typeLink = link as {
          sharedTo: { shareLink: string; requestToken: string };
        };

        const shareLink = typeLink.sharedTo.shareLink;

        copyShareLink(shareLink);

        toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
      });
    }
  };

  const onOpenAccessSettings = () => {
    setAccessSettingsIsVisible!(true);
  };

  const isTemplate =
    infoPanelSelection?.rootFolderType === FolderType.RoomTemplates;

  const getPublicRoomItems = () => {
    const publicRoomItems = [];

    const countCanCreateLink = Math.max(
      0,
      (infoPanelSelection?.shareSettings?.ExternalLink ?? 0) +
        (infoPanelSelection?.shareSettings?.PrimaryExternalLink ?? 0) -
        1,
    );

    const canAddLink =
      (infoPanelSelection?.shareSettings?.ExternalLink ?? 0) > 0;

    if (
      isPublicRoomType &&
      infoPanelSelection?.security.EditAccess &&
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
            <Text fontSize="14px" fontWeight={600} lineHeight="16px">
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
                  title={t("Files:AddNewLink")}
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
          <LinkRow
            key="general-link"
            link={primaryLink}
            isShareLink
            roomId={infoPanelSelection!.id}
            isPublicRoomType={isPublicRoom!}
            isFormRoom={isFormRoom!}
            isCustomRoom={isCustomRoom!}
            item={infoPanelSelection}
          />,
        );
      }

      if (additionalLinks && additionalLinks.length && !searchValue) {
        additionalLinks.forEach((link) => {
          publicRoomItems.push(
            <LinkRow
              link={link}
              key={link?.sharedTo?.id}
              isShareLink
              roomId={infoPanelSelection!.id}
              isPublicRoomType={isPublicRoom!}
              isFormRoom={isFormRoom!}
              isCustomRoom={isCustomRoom!}
              item={infoPanelSelection}
            />,
          );
        });
      } else if (!isArchiveFolder && !primaryLink && !searchValue) {
        publicRoomItems.push(
          <div
            key="create-additional-link"
            className={className("additional-link", styles.linkRow)}
            onClick={onAddNewLink}
            data-share
            data-testid="info_panel_members_create_additional_link"
          >
            <div className="create-link-icon">
              <IconButton size={12} iconName={PlusIcon} isDisabled />
            </div>

            <Link
              noHover
              type={LinkType.action}
              fontSize="14px"
              fontWeight={600}
              className="external-row-link"
              dataTestId="info_panel_members_create_new_link_text"
            >
              {t("Files:CreateNewLink")}
            </Link>
          </div>,
        );
      }
    }

    return publicRoomItems;
  };

  const getContent = () => {
    if (showLoading) return <InfoPanelViewLoader view="members" />;

    if (!members || !infoPanelSelection) return null;

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
      infoPanelSelection?.security?.EditAccess &&
      !searchValue &&
      !isTemplate;

    const publicRoomItemsLength = publicRoomItems.length;

    const isTemplateOwner =
      infoPanelSelection?.access === ShareAccessRights.None ||
      infoPanelSelection?.access === ShareAccessRights.FullAccess;

    if (isTemplate && templateAvailable) {
      return (
        <PublicRoomBar
          headerText={t("Files:TemplateAvailable")}
          bodyText={
            <>
              <div className="template-access_description">
                {t("Files:TemplateAvailableDescription", {
                  productName: getBrandName("ProductName"),
                })}
              </div>
              {isTemplateOwner ? (
                <Link
                  className="template-access_link"
                  isHovered
                  type={LinkType.action}
                  fontWeight={600}
                  fontSize="13px"
                  onClick={onOpenAccessSettings}
                  dataTestId="info_panel_members_template_access_settings_link"
                >
                  {t("Files:AccessSettingsTitle")}
                </Link>
              ) : null}
            </>
          }
        />
      );
    }

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
                  ? t("Files:RoomAvailableViaSharedLink")
                  : t("Files:RoomAvailableViaExternalLink")
              }
              bodyText={
                isFormRoom
                  ? t("CreateEditRoomDialog:FormRoomBarDescription")
                  : t("CreateEditRoomDialog:PublicRoomBarDescription")
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
                room={infoPanelSelection}
                changeUserRole={changeUserRole}
                index={index + publicRoomItemsLength}
              />
            );
          })}
        </MembersList>
      </>
    );
  };

  if (!infoPanelSelection) return null;

  return getContent();
};

export default inject(
  ({
    userStore,
    filesStore,
    selectedFolderStore,
    publicRoomStore,
    treeFoldersStore,
    dialogsStore,
    infoPanelStore,
  }: TStore) => {
    const {
      infoPanelRoomSelection,

      templateAvailableToEveryone,

      isMembersPanelUpdating,
      setIsMembersPanelUpdating,
      updateInfoPanelMembers,
    } = infoPanelStore;

    const { id: selfId } = userStore.user!;

    const { primaryLink, additionalLinks, setExternalLink } = publicRoomStore;

    const { isArchiveFolderRoot } = treeFoldersStore;
    const { setTemplateAccessSettingsVisible: setAccessSettingsIsVisible } =
      dialogsStore;

    const { id } = selectedFolderStore;

    const roomType = infoPanelRoomSelection?.roomType;

    const isFormRoom = roomType === RoomsType.FormRoom;
    const isPublicRoom = roomType === RoomsType.PublicRoom;
    const isCustomRoom = roomType === RoomsType.CustomRoom;

    const isPublicRoomType = isPublicRoom || isCustomRoom || isFormRoom;

    const { isRootFolder } = selectedFolderStore;

    return {
      infoPanelSelection: { ...infoPanelRoomSelection, isRoom: true },
      selfId,
      isPublicRoomType,
      isFormRoom,
      isCustomRoom,

      updateInfoPanelMembers,
      roomType,
      primaryLink,
      isArchiveFolder: isArchiveFolderRoot,
      isPublicRoom,
      additionalLinks,
      getPrimaryLink: filesStore.getPrimaryLink,
      setExternalLink,

      isMembersPanelUpdating,
      setIsMembersPanelUpdating,
      currentId: id,
      setAccessSettingsIsVisible,
      templateAvailable: templateAvailableToEveryone,
      isRootFolder,
    };
  },
)(observer(Members));
