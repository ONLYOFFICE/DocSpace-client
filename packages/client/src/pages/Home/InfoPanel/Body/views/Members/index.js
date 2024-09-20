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

import { useContext, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";

import { RoomsType } from "@docspace/shared/enums";
import { LINKS_LIMIT_COUNT } from "@docspace/shared/constants";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import MembersHelper from "../../helpers/MembersHelper";
import MembersList from "./sub-components/MembersList";
import User from "./User";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import {
  LinksBlock,
  StyledLinkRow,
  StyledPublicRoomBarContainer,
} from "./sub-components/Styled";
import EmptyContainer from "./sub-components/EmptyContainer";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { isDesktop } from "@docspace/shared/utils";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import PlusIcon from "PUBLIC_DIR/images/plus.react.svg?url";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import { copyShareLink } from "@docspace/shared/utils/copy";

import LinkRow from "./sub-components/LinkRow";
import { useOnlineStatuses } from "./hooks/useOnlineStatuses";

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
  setLinkParams,
  setEditLinkPanelIsVisible,
  getPrimaryLink,
  setExternalLink,
  withPublicRoomBlock,
  fetchMoreMembers,
  membersIsLoading,
  searchValue,
  isMembersPanelUpdating,
  socketHelper,
}) => {
  const withoutTitlesAndLinks = !!searchValue;
  const membersHelper = new MembersHelper({ t });

  const scrollContext = useContext(ScrollbarContext);

  useEffect(() => {
    updateInfoPanelMembers(t);
  }, [infoPanelSelection, searchValue]);

  useEffect(() => {
    if (isMembersPanelUpdating) return;
    scrollContext?.parentScrollbar?.scrollToTop();
  }, [isMembersPanelUpdating]);

  useOnlineStatuses({ socketHelper, infoPanelSelection });

  const loadNextPage = async () => {
    await fetchMoreMembers(t, withoutTitlesAndLinks);
  };

  if (membersIsLoading) return <InfoPanelViewLoader view="members" />;
  else if (!infoPanelMembers) return <></>;

  const [currentMember] = infoPanelMembers.administrators.filter(
    (member) => member.id === selfId,
  );

  const { administrators, users, expected, groups } = infoPanelMembers;

  const membersList = [...administrators, ...groups, ...users, ...expected];

  const adminsTitleCount = administrators.length ? 1 : 0;
  const usersTitleCount = users.length ? 1 : 0;
  const expectedTitleCount = expected.length ? 1 : 0;
  const groupsTitleCount = groups.length ? 1 : 0;

  const headersCount = withoutTitlesAndLinks
    ? 0
    : adminsTitleCount +
      usersTitleCount +
      expectedTitleCount +
      groupsTitleCount;

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      setLinkParams({ roomId: infoPanelSelection?.id, isEdit: false });
      setEditLinkPanelIsVisible(true);
    } else {
      getPrimaryLink(infoPanelSelection.id).then((link) => {
        setExternalLink(link);
        copyShareLink(link.sharedTo.shareLink);
        toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
      });
    }
  };

  const publicRoomItems = [];

  if (isPublicRoomType && withPublicRoomBlock && !withoutTitlesAndLinks) {
    if (!isArchiveFolder || primaryLink) {
      publicRoomItems.push(
        <LinksBlock key="general-link_header">
          <Text fontSize="14px" fontWeight={600}>
            {isFormRoom ? t("Common:PublicLink") : t("Common:SharedLinks")}
          </Text>

          {!isArchiveFolder && !isFormRoom && (
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

              {additionalLinks.length >= LINKS_LIMIT_COUNT && (
                <Tooltip
                  float={isDesktop()}
                  id="emailTooltip"
                  getContent={({ content }) => (
                    <Text fontSize="12px">{content}</Text>
                  )}
                  place="bottom"
                />
              )}
            </div>
          )}
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
      additionalLinks.map((link) => {
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
    !withoutTitlesAndLinks;
  const publicRoomItemsLength = publicRoomItems.length;

  if (!membersList.length) {
    return <EmptyContainer />;
  }

  return (
    <>
      {showPublicRoomBar && (
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
      )}

      <MembersList
        loadNextPage={loadNextPage}
        hasNextPage={
          !isMembersPanelUpdating &&
          membersList.length - headersCount < membersFilter.total
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
                !isMembersPanelUpdating &&
                membersList.length - headersCount < membersFilter.total
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
    settingsStore,
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
    } = infoPanelStore;
    const { membersFilter } = filesStore;
    const { id: selfId, isAdmin } = userStore.user;

    const { primaryLink, additionalLinks, setExternalLink } = publicRoomStore;
    const { isArchiveFolderRoot } = treeFoldersStore;
    const { setLinkParams, setEditLinkPanelIsVisible } = dialogsStore;
    const { socketHelper } = settingsStore;

    const roomType =
      selectedFolderStore.roomType ?? infoPanelSelection?.roomType;

    const isFormRoom = roomType === RoomsType.FormRoom;

    const isPublicRoomType =
      roomType === RoomsType.PublicRoom ||
      roomType === RoomsType.CustomRoom ||
      isFormRoom;

    const isPublicRoom = roomType === RoomsType.PublicRoom;

    const infoSelection =
      infoPanelSelection?.length > 1 ? null : infoPanelSelection;

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
      additionalLinks: additionalLinks,
      setLinkParams,
      setEditLinkPanelIsVisible,
      getPrimaryLink: filesStore.getPrimaryLink,
      setExternalLink,
      withPublicRoomBlock,
      fetchMoreMembers,
      membersIsLoading,
      searchValue,
      isMembersPanelUpdating,
      socketHelper,
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
