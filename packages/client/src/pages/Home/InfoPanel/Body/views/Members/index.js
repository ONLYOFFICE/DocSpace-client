import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import { LINKS_LIMIT_COUNT } from "@docspace/shared/constants";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import MembersHelper from "../../helpers/MembersHelper";
import MembersList from "./sub-components/MembersList";
import User from "./User";
import PublicRoomBar from "./sub-components/PublicRoomBar";
import { LinksBlock, StyledLinkRow } from "./sub-components/StyledPublicRoom";
import EmptyContainer from "./sub-components/EmptyContainer";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import PlusReactSvgUrl from "PUBLIC_DIR/images/actions.button.plus.react.svg?url";

import { Avatar } from "@docspace/shared/components/avatar";
import copy from "copy-to-clipboard";
import LinkRow from "./sub-components/LinkRow";

const Members = ({
  t,
  selfId,
  isAdmin,
  infoPanelSelection,
  setIsScrollLocked,
  isPublicRoomType,
  membersFilter,
  infoPanelMembers,
  setInfoPanelMembers,
  primaryLink,
  isArchiveFolder,
  isPublicRoom,
  additionalLinks,
  setLinkParams,
  setEditLinkPanelIsVisible,
  getPrimaryLink,
  setExternalLink,
  withPublicRoomBlock,
  fetchMembers,
  membersIsLoading,
  searchValue,
  searchResultIsLoading,
}) => {
  const withoutTitlesAndLinks = !!searchValue;
  const membersHelper = new MembersHelper({ t });

  const updateInfoPanelMembers = async () => {
    if (
      !infoPanelSelection ||
      !infoPanelSelection.isRoom ||
      !infoPanelSelection.id
    ) {
      return;
    }

    const fetchedMembers = await fetchMembers(t, true, withoutTitlesAndLinks);
    setInfoPanelMembers(fetchedMembers);
  };

  useEffect(() => {
    updateInfoPanelMembers();
  }, [infoPanelSelection, searchValue]);

  const loadNextPage = async () => {
    const roomId = infoPanelSelection.id;
    const fetchedMembers = await fetchMembers(t, false, withoutTitlesAndLinks);
    const { users, administrators, expected, groups } = fetchedMembers;

    const newMembers = {
      roomId: roomId,
      administrators: [...infoPanelMembers.administrators, ...administrators],
      users: [...infoPanelMembers.users, ...users],
      expected: [...infoPanelMembers.expected, ...expected],
      groups: [...infoPanelMembers.groups, ...groups],
    };

    setInfoPanelMembers(newMembers);
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
      setLinkParams({ isEdit: false });
      setEditLinkPanelIsVisible(true);
    } else {
      getPrimaryLink(infoPanelSelection.id).then((link) => {
        setExternalLink(link);
        copy(link.sharedTo.shareLink);
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
            {t("Files:SharedLinks")}
          </Text>

          {!isArchiveFolder && (
            <div
              data-tooltip-id="emailTooltip"
              data-tooltip-content={t(
                "Files:MaximumNumberOfExternalLinksCreated",
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
                  float
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
          />,
        );
      });
    } else if (!isArchiveFolder && !primaryLink && !withoutTitlesAndLinks) {
      publicRoomItems.push(
        <StyledLinkRow
          key="create-additional-link"
          className="additional-link"
          onClick={onAddNewLink}
        >
          <Avatar size="min" source={PlusReactSvgUrl} />

          <Link
            isHovered
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
        <PublicRoomBar
          headerText={t("Files:RoomAvailableViaExternalLink")}
          bodyText={t("CreateEditRoomDialog:PublicRoomBarDescription")}
        />
      )}

      <MembersList
        loadNextPage={loadNextPage}
        hasNextPage={
          membersList.length - headersCount < membersFilter.total &&
          !searchResultIsLoading
        }
        itemCount={membersFilter.total + headersCount + publicRoomItemsLength}
        showPublicRoomBar={showPublicRoomBar}
        linksBlockLength={publicRoomItemsLength}
      >
        {publicRoomItems}
        {membersList.map((user, index) => {
          return (
            <User
              t={t}
              user={user}
              key={user.id}
              showTooltip={isAdmin}
              index={index + publicRoomItemsLength}
              membersHelper={membersHelper}
              currentMember={currentMember}
              hasNextPage={
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
  }) => {
    const {
      infoPanelSelection,
      setIsScrollLocked,
      infoPanelMembers,
      setInfoPanelMembers,
      fetchMembers,
      membersIsLoading,
      withPublicRoomBlock,
      searchValue,
      searchResultIsLoading,
    } = infoPanelStore;
    const { membersFilter } = filesStore;
    const { id: selfId, isAdmin } = userStore.user;

    const { primaryLink, additionalLinks, setExternalLink } = publicRoomStore;
    const { isArchiveFolderRoot } = treeFoldersStore;
    const { setLinkParams, setEditLinkPanelIsVisible } = dialogsStore;

    const roomType =
      selectedFolderStore.roomType ?? infoPanelSelection?.roomType;

    const isPublicRoomType =
      roomType === RoomsType.PublicRoom || roomType === RoomsType.CustomRoom;

    const isPublicRoom = roomType === RoomsType.PublicRoom;

    const infoSelection =
      infoPanelSelection?.length > 1 ? null : infoPanelSelection;

    return {
      infoPanelSelection: infoSelection,
      setIsScrollLocked,
      selfId,
      isAdmin,
      isPublicRoomType,
      membersFilter,
      infoPanelMembers,
      setInfoPanelMembers,
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
      fetchMembers,
      membersIsLoading,
      searchValue,
      searchResultIsLoading,
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
