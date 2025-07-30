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

import React, { useEffect } from "react";
import { useSearchParams } from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import className from "classnames";

import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { IconButton } from "@docspace/shared/components/icon-button";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import {
  GENERAL_LINK_HEADER_KEY,
  LINKS_LIMIT_COUNT,
} from "@docspace/shared/constants";
import FilesFilter from "@docspace/shared/api/files/filter";

import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import { useLoader } from "../../helpers/useLoader";

import User from "./sub-components/User";
import MembersList from "./sub-components/MembersList";
import EmptyContainer from "./sub-components/EmptyContainer";
import LinkRow from "./sub-components/LinkRow";

import { MembersProps } from "./Members.types";
import styles from "./Members.module.scss";

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
  setLinkParams,
  setEditLinkPanelIsVisible,
  getPrimaryLink,
  setExternalLink,

  isMembersPanelUpdating,
  setPublicRoomKey,
  setAccessSettingsIsVisible,
  templateAvailable,
  isRootFolder,
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

  const [searchParams, setSearchParams] = useSearchParams();

  const { showLoading } = useLoader({
    isFirstLoading,
  });

  useEffect(() => {
    if (isMembersPanelUpdating) return;
    scrollToTop();
  }, [isMembersPanelUpdating, scrollToTop]);

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      setLinkParams!({ roomId: infoPanelSelection!.id, isEdit: false });
      setEditLinkPanelIsVisible!(true);
    } else {
      getPrimaryLink!(infoPanelSelection!.id).then((link) => {
        setExternalLink!(link, searchParams, setSearchParams, isCustomRoom);

        const typeLink = link as {
          sharedTo: { shareLink: string; requestToken: string };
        };

        const shareLink = typeLink.sharedTo.shareLink;

        copyShareLink(shareLink);

        toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));

        const filterObj = FilesFilter.getFilter(window.location);

        if (isPublicRoomType && filterObj && !filterObj.key && !isRootFolder) {
          setPublicRoomKey!(typeLink.sharedTo.requestToken);
          setSearchParams((prev) => {
            prev.set("key", typeLink.sharedTo.requestToken);
            return prev;
          });
        }
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

    if (
      isPublicRoomType &&
      infoPanelSelection?.security.EditAccess &&
      !searchValue &&
      !isTemplate
    ) {
      if (!isArchiveFolder || primaryLink) {
        publicRoomItems.push(
          <div className={styles.linksBlock} key={GENERAL_LINK_HEADER_KEY}>
            <Text fontSize="14px" fontWeight={600} lineHeight="16px">
              {isFormRoom ? t("Common:PublicLink") : t("Common:SharedLinks")}
            </Text>

            {!isArchiveFolder && !isFormRoom ? (
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
                      ? additionalLinks.length >= LINKS_LIMIT_COUNT
                      : false
                  }
                  title={t("Files:AddNewLink")}
                />

                {additionalLinks &&
                additionalLinks.length >= LINKS_LIMIT_COUNT ? (
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
            isPrimaryLink
            isShareLink
            roomId={infoPanelSelection!.id}
            isPublicRoomType={isPublicRoom!}
            isFormRoom={isFormRoom!}
            isCustomRoom={isCustomRoom!}
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
      infoPanelSelection.security.EditAccess &&
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
                  productName: t("Common:ProductName"),
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
                >
                  {t("Files:AccessSettings")}
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
          <div className={styles.publicRoomBarContainer}>
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

    const { primaryLink, additionalLinks, setExternalLink, setPublicRoomKey } =
      publicRoomStore;

    const { isArchiveFolderRoot } = treeFoldersStore;
    const {
      setLinkParams,
      setEditLinkPanelIsVisible,
      setTemplateAccessSettingsVisible: setAccessSettingsIsVisible,
    } = dialogsStore;

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
      setLinkParams,
      setEditLinkPanelIsVisible,
      getPrimaryLink: filesStore.getPrimaryLink,
      setExternalLink,

      isMembersPanelUpdating,
      setIsMembersPanelUpdating,
      currentId: id,
      setPublicRoomKey,
      setAccessSettingsIsVisible,
      templateAvailable: templateAvailableToEveryone,
      isRootFolder,
    };
  },
)(observer(Members));
