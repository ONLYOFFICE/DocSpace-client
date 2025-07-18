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

import { use, useEffect } from "react";
import { useSearchParams } from "react-router";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { IconButton } from "@docspace/shared/components/icon-button";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import {
  GENERAL_LINK_HEADER_KEY,
  LINKS_LIMIT_COUNT,
} from "@docspace/shared/constants";
import FilesFilter from "@docspace/shared/api/files/filter";
import { createExternalLink } from "@docspace/shared/api/rooms";

import { LinkType } from "SRC_DIR/helpers/constants";

import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";

import MembersHelper from "../../helpers/MembersHelper";

import MembersList from "./sub-components/MembersList";
import EmptyContainer from "./sub-components/EmptyContainer";
import LinkRow from "./sub-components/LinkRow";
import {
  LinksBlock,
  StyledLinkRow,
  StyledPublicRoomBarContainer,
} from "./sub-components/Styled";

import User from "./User";

const TooltipContent = ({ content }) => <Text fontSize="12px">{content}</Text>;

const Members = ({
  t,
  selfId,
  isAdmin,
  infoPanelSelection,
  setIsScrollLocked,
  isPublicRoomType,
  membersFilter,
  infoPanelMembers,
  updateInfoPanelMembers,
  primaryLink,
  isArchiveFolder,
  isPublicRoom,
  isFormRoom,
  additionalLinks,
  getPrimaryLink,
  setExternalLink,
  withPublicRoomBlock,
  fetchMoreMembers,
  membersIsLoading,
  searchValue,
  isMembersPanelUpdating,
  setPublicRoomKey,
  setAccessSettingsIsVisible,
  templateAvailable,
  isRootFolder,
  isCustomRoom,
}) => {
  const withoutTitlesAndLinks = !!searchValue;
  const membersHelper = new MembersHelper({ t });

  const scrollContext = use(ScrollbarContext);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    updateInfoPanelMembers(t);
  }, [infoPanelSelection, searchValue]);

  useEffect(() => {
    if (isMembersPanelUpdating) return;
    scrollContext?.parentScrollbar?.scrollToTop();
  }, [isMembersPanelUpdating]);

  const loadNextPage = async () => {
    await fetchMoreMembers(t, withoutTitlesAndLinks);
  };

  if (membersIsLoading) return <InfoPanelViewLoader view="members" />;
  if (!infoPanelMembers) return null;

  const [currentMember] = infoPanelMembers.administrators.filter(
    (member) => member.id === selfId,
  );

  const { administrators, users, expected, groups, guests } = infoPanelMembers;

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

  const headersCount = withoutTitlesAndLinks
    ? 0
    : adminsTitleCount +
      usersTitleCount +
      expectedTitleCount +
      groupsTitleCount +
      guestsTitleCount;

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      const roomId = infoPanelSelection.id;

      try {
        await createExternalLink(
          roomId,
          ShareAccessRights.ReadOnly,
          LinkType.External,
          true,
        );
      } catch (error) {
        toastr.error(error);
        console.error(error);
      }

      return;
    }

    getPrimaryLink(infoPanelSelection.id).then((link) => {
      setExternalLink(link, searchParams, setSearchParams, isCustomRoom);
      copyShareLink(link.sharedTo.shareLink);
      toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));

      const filterObj = FilesFilter.getFilter(window.location);

      if (isPublicRoomType && !filterObj.key && !isRootFolder) {
        setPublicRoomKey(link.sharedTo.requestToken);
        setSearchParams((prev) => {
          prev.set("key", link.sharedTo.requestToken);
          return prev;
        });
      }
    });
  };

  const onOpenAccessSettings = () => {
    setAccessSettingsIsVisible(true);
  };

  const publicRoomItems = [];

  const isTemplate =
    infoPanelSelection?.rootFolderType === FolderType.RoomTemplates;

  if (
    isPublicRoomType &&
    withPublicRoomBlock &&
    !withoutTitlesAndLinks &&
    !isTemplate
  ) {
    if (!isArchiveFolder || primaryLink) {
      publicRoomItems.push(
        <LinksBlock key={GENERAL_LINK_HEADER_KEY}>
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
                isDisabled={additionalLinks.length >= LINKS_LIMIT_COUNT}
                title={t("Files:AddNewLink")}
              />

              {additionalLinks.length >= LINKS_LIMIT_COUNT ? (
                <Tooltip
                  float={isDesktop()}
                  id="emailTooltip"
                  getContent={TooltipContent}
                  place="bottom"
                />
              ) : null}
            </div>
          ) : null}
        </LinksBlock>,
      );
    }

    if (primaryLink && !withoutTitlesAndLinks) {
      publicRoomItems.push(
        <LinkRow
          key="general-link"
          link={primaryLink}
          setIsScrollLocked={setIsScrollLocked}
          isShareLink
          isPrimaryLink
        />,
      );
    }

    if (additionalLinks.length && !withoutTitlesAndLinks) {
      additionalLinks.forEach((link) => {
        publicRoomItems.push(
          <LinkRow
            link={link}
            key={link?.sharedTo?.id}
            setIsScrollLocked={setIsScrollLocked}
            isShareLink
          />,
        );
      });
    } else if (!isArchiveFolder && !primaryLink && !withoutTitlesAndLinks) {
      publicRoomItems.push(
        <StyledLinkRow
          key="create-additional-link"
          className="additional-link"
          onClick={onAddNewLink}
          isShareLink
        >
          <div className="create-link-icon">
            <IconButton size={12} iconName={PlusIcon} isDisabled />
          </div>

          <Link
            noHover
            type="action"
            fontSize="14px"
            fontWeight={600}
            className="external-row-link"
          >
            {t("Files:CreateNewLink")}
          </Link>
        </StyledLinkRow>,
      );
    }
  }

  const showPublicRoomBar =
    ((primaryLink && !isArchiveFolder) || isPublicRoom) &&
    withPublicRoomBlock &&
    !withoutTitlesAndLinks &&
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
                type="action"
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
        <StyledPublicRoomBarContainer>
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
        </StyledPublicRoomBarContainer>
      ) : null}

      <MembersList
        loadNextPage={loadNextPage}
        hasNextPage={
          !isMembersPanelUpdating
            ? membersList.length - headersCount < membersFilter.total
            : null
        }
        itemCount={membersFilter.total + headersCount + publicRoomItemsLength}
        showPublicRoomBar={showPublicRoomBar}
        linksBlockLength={publicRoomItemsLength}
        withoutTitlesAndLinks={withoutTitlesAndLinks}
      >
        {publicRoomItems}
        {membersList.map((user, index) => {
          return (
            <User
              t={t}
              user={user}
              key={user.id || user.email} // user.email for users added via email
              showTooltip={isAdmin}
              index={index + publicRoomItemsLength}
              membersHelper={membersHelper}
              currentMember={currentMember}
              hasNextPage={
                !isMembersPanelUpdating
                  ? membersList.length - headersCount < membersFilter.total
                  : null
              }
            />
          );
        })}
      </MembersList>
    </>
  );
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
  }) => {
    const {
      infoPanelSelection,
      setIsScrollLocked,
      infoPanelMembers,
      updateInfoPanelMembers,
      fetchMoreMembers,
      membersIsLoading,
      withPublicRoomBlock,
      searchValue,
      isMembersPanelUpdating,
      templateAvailableToEveryone,
    } = infoPanelStore;
    const { membersFilter } = filesStore;
    const { id: selfId, isAdmin } = userStore.user;
    const { isRootFolder } = selectedFolderStore;

    const { primaryLink, additionalLinks, setExternalLink, setPublicRoomKey } =
      publicRoomStore;

    const { isArchiveFolderRoot } = treeFoldersStore;
    const { setTemplateAccessSettingsVisible: setAccessSettingsIsVisible } =
      dialogsStore;

    const roomType =
      selectedFolderStore.roomType ?? infoPanelSelection?.roomType;

    const infoSelection =
      infoPanelSelection?.length > 1 ? null : infoPanelSelection;

    const isFormRoom = roomType === RoomsType.FormRoom;
    const isPublicRoom = roomType === RoomsType.PublicRoom;
    const isCustomRoom = roomType === RoomsType.CustomRoom;

    const isPublicRoomType = isPublicRoom || isCustomRoom || isFormRoom;

    return {
      infoPanelSelection: infoSelection,
      setIsScrollLocked,
      selfId,
      isAdmin,
      isPublicRoomType,
      isFormRoom,
      membersFilter,
      infoPanelMembers,
      updateInfoPanelMembers,
      roomType,
      primaryLink,
      isArchiveFolder: isArchiveFolderRoot,
      isPublicRoom,
      additionalLinks,
      getPrimaryLink: filesStore.getPrimaryLink,
      setExternalLink,
      withPublicRoomBlock,
      fetchMoreMembers,
      membersIsLoading,
      searchValue,
      isMembersPanelUpdating,
      setPublicRoomKey,
      setAccessSettingsIsVisible,
      templateAvailable: templateAvailableToEveryone,
      isRootFolder,
      isCustomRoom,
    };
  },
)(
  withTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "People",
    "PeopleTranslations",
    "Settings",
    "CreateEditRoomDialog",
  ])(observer(Members)),
);
