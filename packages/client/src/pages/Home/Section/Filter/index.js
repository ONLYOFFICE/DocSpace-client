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

import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";

import { withTranslation } from "react-i18next";

import { isMobile, isTablet } from "@docspace/shared/utils";
import { RoomsTypeValues } from "@docspace/shared/utils/common";
import FilterInput from "@docspace/shared/components/filter";
import { withLayoutSize } from "@docspace/shared/HOC/withLayoutSize";
import { getUser } from "@docspace/shared/api/people";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import FilesFilter from "@docspace/shared/api/files/filter";

import {
  getFilterType,
  getSubjectFilter,
  getAuthorType,
  getRoomId,
  getSearchParams,
  getType,
  getProviderType,
  getSubjectId,
  getFilterContent,
  getTags,
  getQuotaFilter,
} from "@docspace/shared/components/filter/Filter.utils";

import {
  DeviceType,
  FilterGroups,
  FilterKeys,
  FilterSubject,
  FilterType,
  RoomSearchArea,
  RoomsProviderType,
  RoomsType,
  SortByFieldName,
} from "@docspace/shared/enums";
import { ROOMS_PROVIDER_TYPE_NAME } from "@docspace/shared/constants";
import { getManyPDFTitle } from "@docspace/shared/utils/getPDFTite";

import { getRoomTypeName } from "SRC_DIR/helpers/filesUtils";

import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import { getRoomInfo } from "@docspace/shared/api/rooms";
import { FilterLoader } from "@docspace/shared/skeletons/filter";

import { useContactsFilter } from "./useContacts";

const SectionFilterContent = ({
  t,
  filter,
  roomsFilter,
  isRecentTab,
  isFavoritesFolder,
  sectionWidth,
  viewAs,
  createThumbnails,
  setViewAs,
  setIsLoading,

  fetchTags,
  infoPanelVisible,
  isRooms,
  isTrash,
  isPersonalRoom,
  isIndexing,
  isIndexEditingMode,

  fetchThirdPartyProviders,

  clearSearch,
  setClearSearch,
  setMainButtonMobileVisible,
  isArchiveFolder,

  // contacts
  contactsViewAs,
  contactsTab,

  // groups
  groupsFilter,
  setGroupsFilter,

  // users
  usersFilter,
  setUsersFilter,

  isCollaborator,
  isVisitor,
  userId,

  showFilterLoader,
  isPublicRoom,
  publicRoomKey,
  setRoomsFilter,
  standalone,
  currentDeviceType,
  isRoomAdmin,
  showStorageInfo,
  isDefaultRoomsQuotaSet,
  isTemplatesFolder,
  isRoomTrash,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isContactsPage = location.pathname.includes("accounts");
  const isContactsPeoplePage = contactsTab === "people";
  const isContactsInsideGroupPage = contactsTab === "inside_group";
  const isContactsGroupsPage = contactsTab === "groups";
  const isContactsGuestsPage = contactsTab === "guests";
  const isFlowsPage = location.pathname.includes("flows");

  const {
    onContactsFilter,
    onContactsSearch,
    onContactsSort,
    getContactsSelectedInputValue,
    getContactsSelectedSortData,
    getContactsSelectedFilterData,
    getContactsFilterData,
    getContactsSortData,
    removeContactsSelectedItem,
    clearAllContacts,
  } = useContactsFilter({
    contactsTab,
    usersFilter,
    setUsersFilter,
    groupsFilter,
    setGroupsFilter,
    userId,
    t,
    isRoomAdmin,
    standalone,
    showStorageInfo,
    isDefaultRoomsQuotaSet,
  });

  const onNavigate = (path, newFilter) => {
    if (isPublicRoom) {
      navigate(`${path}?key=${publicRoomKey}&${newFilter.toUrlParams()}`);
    } else {
      navigate(`${path}/filter?${newFilter.toUrlParams()}`);
    }
  };

  const onFilter = React.useCallback(
    (data) => {
      setIsLoading(true);
      if (isContactsPage) {
        onContactsFilter(data);
      } else if (isRooms) {
        const type = getType(data) || null;

        const subjectId = getSubjectId(data) || null;

        const subjectFilter = getSubjectFilter(data) || null;

        const providerType = getProviderType(data) || null;
        const tags = getTags(data) || null;
        const quota = getQuotaFilter(data) || null;

        const newFilter = roomsFilter.clone();

        newFilter.page = 0;
        newFilter.provider = providerType || null;
        newFilter.type = type || null;

        newFilter.subjectFilter = null;
        newFilter.subjectId = null;

        newFilter.quotaFilter = quota;

        if (subjectId) {
          newFilter.subjectId = subjectId;

          if (subjectId === FilterKeys.me) {
            newFilter.subjectId = `${userId}`;
          }

          newFilter.subjectFilter = subjectFilter?.toString()
            ? subjectFilter.toString()
            : FilterSubject.Member;
        }

        if (tags) {
          if (!tags?.length) {
            newFilter.tags = null;
            newFilter.withoutTags = true;
          } else {
            newFilter.tags = tags;
            newFilter.withoutTags = false;
          }
        } else {
          newFilter.tags = null;
          newFilter.withoutTags = false;
        }

        const path =
          newFilter.searchArea === RoomSearchArea.Active ||
          newFilter.searchArea === RoomSearchArea.Templates
            ? "rooms/shared"
            : "rooms/archived";
        navigate(
          `${path}/filter?${newFilter.toUrlParams(userId)}&hash=${new Date().getTime()}`,
        );
      } else {
        const filterType = getFilterType(data) || null;

        const authorType = getAuthorType(data);

        const withSubfolders = getSearchParams(data);
        const withContent = getFilterContent(data);

        const roomId = getRoomId(data);

        const newFilter = filter.clone();
        newFilter.page = 0;

        newFilter.filterType = filterType;

        if (authorType === FilterKeys.me || authorType === FilterKeys.other) {
          newFilter.authorType = `user_${userId}`;
          newFilter.excludeSubject = authorType === FilterKeys.other;
        } else {
          newFilter.authorType = authorType ? `user_${authorType}` : null;
          newFilter.excludeSubject = null;
        }

        newFilter.withSubfolders =
          withSubfolders === FilterKeys.excludeSubfolders ? null : "true";

        newFilter.searchInContent = withContent === "true" ? "true" : null;

        const path = location.pathname.split("/filter")[0];
        if (isTrash) {
          newFilter.roomId = roomId;
        }

        onNavigate(path, newFilter);
      }
    },
    [
      isRooms,
      isTrash,
      isRecentTab,
      setIsLoading,
      roomsFilter,
      filter,

      onContactsFilter,

      location.pathname,
    ],
  );

  const onClearFilter = useCallback(() => {
    if (isContactsPage) {
      return;
    }

    setIsLoading(true);
    if (isRooms) {
      const newFilter = RoomsFilter.clean();
      newFilter.searchArea = roomsFilter.searchArea;

      const path =
        roomsFilter.searchArea === RoomSearchArea.Active ||
        roomsFilter.searchArea === RoomSearchArea.Templates
          ? "rooms/shared"
          : "rooms/archived";

      navigate(`${path}/filter?${newFilter.toUrlParams(userId)}`);
    } else {
      const newFilter = filter.clone();

      newFilter.page = 0;
      newFilter.filterValue = "";

      const path = location.pathname.split("/filter")[0];

      onNavigate(path, newFilter);
    }
  }, [
    isRooms,
    setIsLoading,

    filter,

    roomsFilter,
    isContactsPage,

    location.pathname,
  ]);

  const onSearch = React.useCallback(
    (data = "") => {
      const searchValue = data?.trim() ?? "";

      const currentSearch =
        filter.search ||
        roomsFilter.filterValue ||
        usersFilter.search ||
        groupsFilter.search ||
        "";
      if (searchValue === currentSearch) return;

      if (
        !filter.search &&
        !roomsFilter.filterValue &&
        !usersFilter.search &&
        !groupsFilter.search &&
        searchValue.length === 0
      )
        return;

      setIsLoading(true);
      if (isContactsPage) {
        onContactsSearch(searchValue);
      } else if (isRooms) {
        const newFilter = roomsFilter.clone();

        newFilter.page = 0;
        newFilter.filterValue = searchValue;

        const path =
          newFilter.searchArea === RoomSearchArea.Active ||
          newFilter.searchArea === RoomSearchArea.Templates
            ? "rooms/shared"
            : "rooms/archived";

        navigate(`${path}/filter?${newFilter.toUrlParams(userId)}`);
      } else {
        const newFilter = filter.clone();
        newFilter.page = 0;
        newFilter.search = searchValue;

        const path = location.pathname.split("/filter")[0];

        onNavigate(path, newFilter);
      }
    },
    [
      isRooms,
      isContactsPage,

      setIsLoading,

      filter,
      roomsFilter,

      location.pathname,

      onContactsSearch,
    ],
  );

  const onSort = React.useCallback(
    (sortId, sortDirection) => {
      const sortBy = sortId;
      const sortOrder = sortDirection === "desc" ? "descending" : "ascending";
      setIsLoading(true);

      if (isContactsPage) {
        return onContactsSort(sortBy, sortOrder);
      }

      let newFilter = null;

      if (isRooms) newFilter = roomsFilter.clone();
      else newFilter = filter.clone();

      newFilter.page = 0;
      newFilter.sortBy = sortBy;
      newFilter.sortOrder = sortOrder;

      if (isRooms) {
        const path =
          newFilter.searchArea === RoomSearchArea.Active ||
          newFilter.searchArea === RoomSearchArea.Templates
            ? "rooms/shared"
            : "rooms/archived";
        setRoomsFilter(newFilter);
        navigate(`${path}/filter?${newFilter.toUrlParams(userId)}`);
      } else {
        const path = location.pathname.split("/filter")[0];

        onNavigate(path, newFilter);
      }
    },
    [
      isRooms,

      isContactsPage,
      setIsLoading,
      filter,
      roomsFilter,

      onContactsSort,
    ],
  );

  const onChangeViewAs = React.useCallback(
    (view) => {
      if (view === "row") {
        if (
          isMobile() ||
          isTablet() ||
          currentDeviceType !== DeviceType.desktop
        ) {
          setViewAs("row");
        } else {
          setViewAs("table");
        }
      } else {
        setViewAs(view);
      }
    },
    [sectionWidth, infoPanelVisible, setViewAs, currentDeviceType],
  );

  const getSelectedInputValue = React.useCallback(() => {
    return isContactsPage
      ? getContactsSelectedInputValue()
      : isRooms
        ? roomsFilter.filterValue
          ? roomsFilter.filterValue
          : ""
        : filter.search
          ? filter.search
          : "";
  }, [
    isRooms,
    isContactsPage,
    roomsFilter.filterValue,
    filter.search,
    usersFilter.search,
  ]);

  const getSelectedSortData = React.useCallback(() => {
    const currentFilter = isContactsPage
      ? getContactsSelectedSortData()
      : isRooms
        ? roomsFilter
        : filter;
    return {
      sortDirection: currentFilter.sortOrder === "ascending" ? "asc" : "desc",
      sortId: currentFilter.sortBy,
    };
  }, [
    isRooms,
    isContactsPage,
    filter.sortOrder,
    filter.sortBy,
    roomsFilter.sortOrder,
    roomsFilter.sortBy,
    getContactsSelectedSortData,
  ]);

  const getSelectedFilterData = React.useCallback(async () => {
    const filterValues = isContactsPage
      ? await getContactsSelectedFilterData()
      : [];

    if (isRooms) {
      // if (!roomsFilter.withSubfolders) {
      //   filterValues.push({
      //     key: FilterKeys.excludeSubfolders,
      //     label: "Exclude subfolders",
      //     group: FilterGroups.roomFilterFolders,
      //   });
      // }

      // if (roomsFilter.searchInContent) {
      //   filterValues.push({
      //     key: FilterKeys.withContent,
      //     label: "File contents",
      //     group: FilterGroups.roomFilterContent,
      //   });
      // }

      if (roomsFilter.subjectId) {
        const user = await getUser(roomsFilter.subjectId);
        const isMe = userId === roomsFilter.subjectId;

        const label = isMe ? t("Common:MeLabel") : user.displayName;

        const subject = {
          key: isMe ? FilterKeys.me : roomsFilter.subjectId,
          group: FilterGroups.roomFilterSubject,
          label,
        };

        if (roomsFilter.subjectFilter?.toString()) {
          if (roomsFilter.subjectFilter.toString() === FilterSubject.Owner) {
            subject.selectedLabel = `${t("Common:Owner")}: ${label}`;
          }

          filterValues.push(subject);

          filterValues.push({
            key: roomsFilter?.subjectFilter?.toString(),
            group: FilterGroups.roomFilterOwner,
          });
        } else {
          filterValues.push(subject);
        }
      }

      if (roomsFilter.type) {
        const key = +roomsFilter.type;

        const label = getRoomTypeName(key, t);

        filterValues.push({
          key,
          label,
          group: FilterGroups.roomFilterType,
        });
      }
      if (roomsFilter.quotaFilter) {
        const key = roomsFilter.quotaFilter;

        const label =
          key === FilterKeys.customQuota
            ? t("Common:CustomQuota")
            : t("Common:DefaultQuota");

        filterValues.push({
          key: roomsFilter.quotaFilter,
          label,
          group: FilterGroups.filterQuota,
        });
      }

      if (roomsFilter?.tags?.length > 0) {
        filterValues.push({
          key: roomsFilter.tags,
          group: FilterGroups.roomFilterTags,
          isMultiSelect: true,
        });
      }

      if (roomsFilter.provider) {
        const provider = +roomsFilter.provider;

        const label = ROOMS_PROVIDER_TYPE_NAME[provider];

        filterValues.push({
          key: provider,
          label,
          group: FilterGroups.roomFilterProviderType,
        });
      }
    } else if (!isContactsPage) {
      if (filter.filterType) {
        let label = "";

        switch (filter.filterType.toString()) {
          case FilterType.DocumentsOnly.toString():
            label = t("Common:Documents");
            break;
          case FilterType.FoldersOnly.toString():
            label = t("Common:Folders");
            break;
          case FilterType.SpreadsheetsOnly.toString():
            label = t("Common:Spreadsheets");
            break;
          case FilterType.ArchiveOnly.toString():
            label = t("Common:Archives");
            break;
          case FilterType.PresentationsOnly.toString():
            label = t("Common:Presentations");
            break;
          case FilterType.ImagesOnly.toString():
            label = t("Common:Images");
            break;
          case FilterType.MediaOnly.toString():
            label = t("Common:Media");
            break;
          case FilterType.FilesOnly.toString():
            label = t("Common:Files");
            break;
          case FilterType.PDFForm.toString():
            label = getManyPDFTitle(t, true);
            break;
          case FilterType.Pdf.toString():
            label = getManyPDFTitle(t, false);
            break;
          case FilterType.DiagramsOnly.toString():
            label = t("Common:Diagrams");
            break;
          default:
            break;
        }

        filterValues.push({
          key: `${filter.filterType}`,
          label,
          group: FilterGroups.filterType,
        });
      }

      if (filter.authorType) {
        const isMe = userId === filter.authorType.replace("user_", "");

        let label = isMe
          ? filter.excludeSubject
            ? t("Common:OtherLabel")
            : t("Common:MeLabel")
          : null;

        if (!isMe) {
          const user = await getUser(filter.authorType.replace("user_", ""));
          label = user.displayName;
        }

        filterValues.push({
          key: isMe
            ? filter.excludeSubject
              ? FilterKeys.other
              : FilterKeys.me
            : filter.authorType.replace("user_", ""),
          group: FilterGroups.filterAuthor,
          label,
        });
      }

      if (filter.roomId) {
        const room = await getRoomInfo(filter.roomId);
        const label = room.title;

        filterValues.push({
          key: filter.roomId,
          group: FilterGroups.filterRoom,
          label,
        });
      }
    }

    return filterValues;
  }, [
    filter.authorType,
    filter.roomId,
    filter.filterType,
    filter.excludeSubject,
    roomsFilter.provider,
    roomsFilter.type,
    roomsFilter.subjectId,
    roomsFilter.subjectFilter,
    roomsFilter.tags,
    roomsFilter.tags?.length,
    roomsFilter.excludeSubject,
    roomsFilter.withoutTags,
    roomsFilter.quotaFilter,
    // roomsFilter.withSubfolders,
    // roomsFilter.searchInContent,
    userId,
    isRooms,

    isContactsPage,

    getContactsSelectedFilterData,

    t,
  ]);

  const getFilterData = React.useCallback(async () => {
    const quotaFilter = [
      {
        key: FilterGroups.filterQuota,
        group: FilterGroups.filterQuota,
        label: t("Common:StorageQuota"),
        isHeader: true,
        withoutSeparator: true,
        withMultiItems: true,
      },
      {
        id: "filter_custom-quota",
        key: FilterKeys.customQuota,
        group: FilterGroups.filterQuota,
        label: t("Common:CustomQuota"),
      },
      {
        id: "filter_default-quota",
        key: FilterKeys.defaultQuota,
        group: FilterGroups.filterQuota,
        label: t("Common:DefaultQuota"),
      },
    ];

    if (isContactsPage) return getContactsFilterData(quotaFilter);

    let tags = null;
    let providers = [];
    if (!isPublicRoom && isRooms) {
      const res = await Promise.all([fetchTags(), fetchThirdPartyProviders()]);
      tags = res[0];
      providers = res[1];
    }
    const connectedThirdParty = [];

    providers.forEach((item) => {
      if (connectedThirdParty.includes(item.provider_key)) return;
      connectedThirdParty.push(item.provider_key);
    });

    const isLastTypeOptionsRooms = !connectedThirdParty.length && !tags?.length;

    const folders =
      !isFavoritesFolder && !isRecentTab
        ? [
            {
              id: "filter_type-folders",
              key: FilterType.FoldersOnly.toString(),
              group: FilterGroups.filterType,
              label: t("Common:Folders"),
            },
          ]
        : "";

    const images = [
      {
        id: "filter_type-images",
        key: FilterType.ImagesOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Images"),
      },
    ];

    const archives = [
      {
        id: "filter_type-archive",
        key: FilterType.ArchiveOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Archives"),
      },
    ];

    const media = [
      {
        id: "filter_type-media",
        key: FilterType.MediaOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Media"),
      },
    ];

    const typeOptions =
      isRooms || isRoomTrash
        ? [
            {
              key: FilterGroups.filterType,
              group: FilterGroups.roomFilterType,
              label: t("Common:Type"),
              isHeader: true,
              isLast: isLastTypeOptionsRooms,
            },
            ...RoomsTypeValues.map((roomType) => {
              switch (roomType) {
                case RoomsType.FillingFormsRoom:
                  return {
                    id: "filter_type-filling-form",
                    key: RoomsType.FillingFormsRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:FillingFormRooms"),
                  };
                case RoomsType.EditingRoom:
                  return {
                    id: "filter_type-collaboration",
                    key: RoomsType.EditingRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:CollaborationRooms"),
                  };
                case RoomsType.ReviewRoom:
                  return {
                    id: "filter_type-review",
                    key: RoomsType.ReviewRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:Review"),
                  };
                case RoomsType.ReadOnlyRoom:
                  return {
                    id: "filter_type-view-only",
                    key: RoomsType.ReadOnlyRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:ViewOnlyRooms"),
                  };
                case RoomsType.FormRoom:
                  return {
                    id: "filter_type-form",
                    key: RoomsType.FormRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:FormRoom"),
                  };
                case RoomsType.PublicRoom:
                  return {
                    id: "filter_type-public",
                    key: RoomsType.PublicRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:PublicRoom"),
                  };
                case RoomsType.VirtualDataRoom:
                  return {
                    id: "filter_type-virtual-data",
                    key: RoomsType.VirtualDataRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:VirtualDataRoom"),
                  };
                case RoomsType.CustomRoom:
                default:
                  return {
                    id: "filter_type-custom",
                    key: RoomsType.CustomRoom,
                    group: FilterGroups.roomFilterType,
                    label: t("Common:CustomRooms"),
                  };
              }
            }),
          ]
        : [
            {
              key: FilterGroups.filterType,
              group: FilterGroups.filterType,
              label: t("Common:Type"),
              isHeader: true,
              isLast: true,
            },
            ...folders,
            {
              id: "filter_type-all-files",
              key: FilterType.FilesOnly.toString(),
              group: FilterGroups.filterType,
              label: t("Common:Files"),
            },
            {
              id: "filter_type-documents",
              key: FilterType.DocumentsOnly.toString(),
              group: FilterGroups.filterType,
              label: t("Common:Documents"),
            },
            {
              id: "filter_type-spreadsheets",
              key: FilterType.SpreadsheetsOnly.toString(),
              group: FilterGroups.filterType,
              label: t("Common:Spreadsheets"),
            },
            {
              id: "filter_type-presentations",
              key: FilterType.PresentationsOnly.toString(),
              group: FilterGroups.filterType,
              label: t("Common:Presentations"),
            },
            {
              id: "filter_type-pdf",
              key: FilterType.Pdf.toString(),
              group: FilterGroups.filterType,
              label: getManyPDFTitle(t, false),
            },
            {
              id: "filter_type-forms",
              key: FilterType.PDFForm.toString(),
              group: FilterGroups.filterType,
              label: getManyPDFTitle(t, true),
            },
            {
              id: "filter_type-diagrams",
              key: FilterType.DiagramsOnly.toString(),
              group: FilterGroups.filterType,
              label: t("Common:Diagrams"),
            },
            ...archives,
            ...images,
            ...media,
          ];

    const subjectOptions = [
      {
        key: FilterGroups.roomFilterSubject,
        group: FilterGroups.roomFilterSubject,
        label: isTemplatesFolder ? t("TemplateOwner") : t("Common:Member"),
        isHeader: true,
        withoutSeparator: true,
        withMultiItems: true,
      },
      {
        id: "filter_author-me",
        key: FilterKeys.me,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:MeLabel"),
      },

      {
        id: "filter_author-user",
        key: FilterKeys.user,
        group: FilterGroups.roomFilterSubject,
        displaySelectorType: "link",
      },
    ];

    if (!isCollaborator && !isVisitor) {
      subjectOptions.push({
        id: "filter_author-other",
        key: FilterKeys.other,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:OtherLabel"),
      });
    }

    const ownerOptions = [
      {
        key: FilterGroups.roomFilterOwner,
        group: FilterGroups.roomFilterOwner,
        isHeader: true,
        withoutHeader: true,
      },
      {
        id: "filter_author-user",
        key: FilterSubject.Owner,
        group: FilterGroups.roomFilterOwner,
        label: t("Translations:SearchByOwner"),
        isCheckbox: true,
        isDisabled: false,
      },
    ];

    // const foldersOptions = [
    //   {
    //     key: FilterGroups.roomFilterFolders,
    //     group: FilterGroups.roomFilterFolders,
    //     label: "Search",
    //     isHeader: true,
    //     withoutSeparator: true,
    //   },
    //   {
    //     key: "folders",
    //     group: FilterGroups.roomFilterFolders,
    //     label: "",
    //     withOptions: true,
    //     options: [
    //       { key: FilterKeys.withSubfolders, label: "With subfolders" },
    //       { key: FilterKeys.excludeSubfolders, label: "Exclude subfolders" },
    //     ],
    //   },
    // ];

    // const contentOptions = [
    //   {
    //     key: FilterGroups.roomFilterContent,
    //     group: FilterGroups.roomFilterContent,
    //     isHeader: true,
    //     withoutHeader: true,
    //   },
    //   {
    //     key: FilterKeys.withContent,
    //     group: FilterGroups.roomFilterContent,
    //     label: "Search by file contents",
    //     isCheckbox: true,
    //   },
    // ];

    const filterOptions = [];

    if (isRooms) {
      // filterOptions.push(...foldersOptions);
      // filterOptions.push(...contentOptions);

      filterOptions.push(...subjectOptions);
      filterOptions.push(...ownerOptions);

      filterOptions.push(...typeOptions);

      if (tags.length > 0) {
        const tagsOptions = tags.map((tag) => ({
          key: tag,
          group: FilterGroups.roomFilterTags,
          label: tag,
          isMultiSelect: true,
        }));

        const isLast = connectedThirdParty.length === 0;

        filterOptions.push({
          key: FilterGroups.roomFilterTags,
          group: FilterGroups.roomFilterTags,
          label: t("Common:Tags"),
          isHeader: true,
          isLast,
        });

        filterOptions.push(...tagsOptions);
      }

      if (connectedThirdParty.length > 0 && !isTemplatesFolder) {
        const thirdPartyOptions = connectedThirdParty.map((thirdParty) => {
          const key = Object.entries(RoomsProviderType).find(
            (item) => item[0] === thirdParty,
          )?.[1];

          const label = ROOMS_PROVIDER_TYPE_NAME[key];

          return {
            key,
            group: FilterGroups.roomFilterProviderType,
            label,
          };
        });

        filterOptions.push({
          key: FilterGroups.roomFilterProviderType,
          group: FilterGroups.roomFilterProviderType,
          label: t("Common:ThirdPartyResource"),
          isHeader: true,
          isLast: true,
        });

        filterOptions.push(...thirdPartyOptions);
      }

      showStorageInfo &&
        isDefaultRoomsQuotaSet &&
        filterOptions.push(...quotaFilter);
    } else {
      const authorOption = [
        {
          key: FilterGroups.filterAuthor,
          group: FilterGroups.filterAuthor,
          label: t("ByAuthor"),
          isHeader: true,
        },
        {
          id: "filter_author-me",
          key: FilterKeys.me,
          group: FilterGroups.filterAuthor,
          label: t("Common:MeLabel"),
        },

        {
          id: "filter_author-user",
          key: FilterKeys.user,
          group: FilterGroups.filterAuthor,
          displaySelectorType: "link",
        },
      ];

      if (!isCollaborator && !isVisitor) {
        authorOption.push({
          id: "filter_author-other",
          key: FilterKeys.other,
          group: FilterGroups.filterAuthor,
          label: t("Common:OtherLabel"),
        });
      }

      !isPublicRoom && filterOptions.push(...authorOption);
      filterOptions.push(...typeOptions);
    }
    return filterOptions;
  }, [
    t,
    isPersonalRoom,
    isRooms,
    isContactsPage,
    isFavoritesFolder,
    isRecentTab,
    isTrash,
    isPublicRoom,
    isTemplatesFolder,
    isCollaborator,
    isVisitor,
    getContactsFilterData,
  ]);

  const getViewSettingsData = React.useCallback(() => {
    const viewSettings = [
      {
        id: "view-switch_rows",
        value: "row",
        label: t("ViewList"),
        icon: ViewRowsReactSvgUrl,
      },
      {
        id: "view-switch_tiles",
        value: "tile",
        label: t("ViewTiles"),
        icon: ViewTilesReactSvgUrl,
        callback: createThumbnails,
      },
    ];

    return viewSettings;
  }, [createThumbnails]);

  const getSortData = React.useCallback(() => {
    if (isContactsPage) return getContactsSortData();

    const commonOptions = [];

    const name = {
      id: "sort-by_name",
      key: SortByFieldName.Name,
      label: t("Common:Label"),
      default: true,
    };
    const modifiedDate = {
      id: "sort-by_modified",
      key: SortByFieldName.ModifiedDate,
      label: t("Common:LastModifiedDate"),
      default: true,
    };
    const activityDate = {
      id: "sort-by_activity",
      key: SortByFieldName.ModifiedDate,
      label: t("Common:LastActivityDate"),
      default: true,
    };
    const lastOpenedDate = {
      id: "sort-by_last-opened",
      key: SortByFieldName.LastOpened,
      label: t("DateLastOpened"),
      default: true,
    };

    const owner = {
      id: "sort-by_owner",
      key: SortByFieldName.Author,
      label: t("Common:Owner"),
      default: true,
    };
    const erasure = {
      id: "sort-by_erasure",
      key: SortByFieldName.ModifiedDate,
      label: t("ByErasure"),
      default: true,
    };
    const tags = {
      id: "sort-by_tags",
      key: SortByFieldName.Tags,
      label: t("Common:Tags"),
      default: true,
    };
    const size = {
      id: "sort-by_size",
      key: SortByFieldName.Size,
      label: t("Common:Size"),
      default: true,
    };

    const roomType = {
      id: "sort-by_room-type",
      key: SortByFieldName.RoomType,
      label: t("Common:Type"),
      default: true,
    };

    const sortByStorage = {
      id: "sort-by_storage",
      key: SortByFieldName.UsedSpace,
      label: t("Common:Storage"),
      default: true,
    };

    commonOptions.push(name);

    if (isRooms) {
      commonOptions.push(roomType);
      commonOptions.push(tags);
      commonOptions.push(owner);
      commonOptions.push(activityDate);
      showStorageInfo && commonOptions.push(sortByStorage);
    } else if (isTrash) {
      // commonOptions.push(authorOption);
      // commonOptions.push(creationDate);
      commonOptions.push(erasure);
      commonOptions.push(size);
      // commonOptions.push(type);
    } else {
      // commonOptions.push(authorOption);
      // commonOptions.push(creationDate);
      commonOptions.push(modifiedDate);
      commonOptions.push(size);
      // commonOptions.push(type);
      isRecentTab && commonOptions.push(lastOpenedDate);
    }

    return commonOptions;
  }, [
    isRooms,
    isContactsPage,

    t,
    userId,
    infoPanelVisible,
    viewAs,
    isPersonalRoom,
    isTrash,
    getContactsSortData,
  ]);

  const removeSelectedItem = React.useCallback(
    ({ key, group }) => {
      setIsLoading(true);
      if (isContactsPage) {
        removeContactsSelectedItem(group);
      } else if (isRooms) {
        const newFilter = roomsFilter.clone();

        if (group === FilterGroups.roomFilterProviderType) {
          newFilter.provider = null;
        }

        if (group === FilterGroups.roomFilterType) {
          newFilter.type = null;
        }

        if (group === FilterGroups.filterQuota) {
          newFilter.quotaFilter = null;
        }

        if (group === FilterGroups.roomFilterSubject) {
          newFilter.subjectId = null;
          newFilter.excludeSubject = false;
          newFilter.filterSubject = null;
        }

        if (group === FilterGroups.roomFilterTags) {
          const newTags = newFilter.tags;

          if (newTags?.length > 0) {
            const idx = newTags.findIndex((tag) => tag === key);

            if (idx > -1) {
              newTags.splice(idx, 1);
            }

            newFilter.tags = newTags.length > 0 ? newTags : null;

            newFilter.withoutTags = false;
          } else {
            newFilter.tags = null;
            newFilter.withoutTags = false;
          }
        }

        // if (group === FilterGroups.roomFilterContent) {
        //   newFilter.searchInContent = false;
        // }

        // if (group === FilterGroups.roomFilterFolders) {
        //   newFilter.withSubfolders = true;
        // }

        newFilter.page = 0;

        const path =
          newFilter.searchArea === RoomSearchArea.Active ||
          newFilter.searchArea === RoomSearchArea.Templates
            ? "rooms/shared"
            : "rooms/archived";

        navigate(`${path}/filter?${newFilter.toUrlParams(userId)}`);
      } else {
        const newFilter = filter.clone();

        if (group === FilterGroups.filterType) {
          newFilter.filterType = null;
        }
        if (group === FilterGroups.filterAuthor) {
          newFilter.authorType = null;
          newFilter.excludeSubject = null;
        }
        if (group === FilterGroups.filterRoom) {
          newFilter.roomId = null;
        }

        newFilter.page = 0;

        const path = location.pathname.split("/filter")[0];

        onNavigate(path, newFilter);
      }
    },
    [
      isRooms,
      isContactsPage,
      removeContactsSelectedItem,
      setIsLoading,
      roomsFilter,
      filter,
    ],
  );

  const onSortButtonClick = (isOpen) => {
    if (currentDeviceType === DeviceType.mobile) {
      setMainButtonMobileVisible(isOpen);
    }
  };

  const clearAll = () => {
    setIsLoading(true);

    if (isContactsPage) {
      clearAllContacts();
    } else if (isRooms) {
      const newFilter = RoomsFilter.clean();

      if (isArchiveFolder) {
        newFilter.searchArea = RoomSearchArea.Archive;
      }

      if (isTemplatesFolder) {
        newFilter.searchArea = RoomSearchArea.Templates;
      }

      const path =
        newFilter.searchArea === RoomSearchArea.Active ||
        newFilter.searchArea === RoomSearchArea.Templates
          ? "rooms/shared"
          : "rooms/archived";

      navigate(`${path}/filter?${newFilter.toUrlParams(userId)}`);
    } else {
      const newFilter = FilesFilter.getDefault();

      newFilter.folder = filter.folder;

      const path = location.pathname.split("/filter")[0];

      onNavigate(path, newFilter);
    }
  };

  if (showFilterLoader) return <FilterLoader />;

  return (
    <FilterInput
      onFilter={onFilter}
      getFilterData={getFilterData}
      getSelectedFilterData={getSelectedFilterData}
      onSort={onSort}
      getSortData={getSortData}
      getSelectedSortData={getSelectedSortData}
      viewAs={isContactsPage ? contactsViewAs : viewAs}
      viewSelectorVisible={!isContactsPage}
      onChangeViewAs={onChangeViewAs}
      getViewSettingsData={getViewSettingsData}
      onSearch={onSearch}
      onClearFilter={onClearFilter}
      getSelectedInputValue={getSelectedInputValue}
      filterHeader={t("Common:AdvancedFilter")}
      placeholder={t("Common:Search")}
      view={t("Common:View")}
      isFavoritesFolder={isFavoritesFolder}
      isPersonalRoom={isPersonalRoom}
      isRooms={isRooms}
      removeSelectedItem={removeSelectedItem}
      clearAll={clearAll}
      filterTitle={t("Filter")}
      sortByTitle={t("Common:SortBy")}
      clearSearch={clearSearch}
      setClearSearch={setClearSearch}
      onSortButtonClick={onSortButtonClick}
      currentDeviceType={currentDeviceType}
      userId={userId}
      isIndexing={isIndexing}
      isIndexEditingMode={isIndexEditingMode}
      disableThirdParty={isTrash}
      isContactsPage={isContactsPage}
      isContactsPeoplePage={isContactsPeoplePage}
      isContactsGroupsPage={isContactsGroupsPage}
      isContactsInsideGroupPage={isContactsInsideGroupPage}
      isContactsGuestsPage={isContactsGuestsPage}
      isFlowsPage={isFlowsPage}
      isRoomTrash={isRoomTrash}
    />
  );
};

export default inject(
  ({
    authStore,
    filesStore,
    treeFoldersStore,
    clientLoadingStore,
    tagsStore,
    peopleStore,
    publicRoomStore,
    infoPanelStore,
    userStore,
    settingsStore,
    currentQuotaStore,
    indexingStore,
    selectedFolderStore,
  }) => {
    const {
      filter,

      roomsFilter,

      setViewAs,
      viewAs,
      createThumbnails,
      setCurrentRoomsFilter,
      setMainButtonMobileVisible,
      thirdPartyStore,
      clearSearch,
      setClearSearch,
      isLoadedEmptyPage,
      setRoomsFilter,
    } = filesStore;

    const { fetchThirdPartyProviders } = thirdPartyStore;

    const { fetchTags } = tagsStore;
    const { isRoomAdmin } = authStore;
    const { user } = userStore;
    const { standalone, currentDeviceType } = settingsStore;
    const {
      isFavoritesFolder,
      isRecentTab,
      isRoomsFolder,
      isArchiveFolder,
      isPersonalRoom,
      isTrashFolder: isTrash,
      isTemplatesFolder,
      isRoomTrash,
    } = treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder || isTemplatesFolder;

    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { showStorageInfo, isDefaultRoomsQuotaSet } = currentQuotaStore;

    const { isIndexEditingMode } = indexingStore;
    const { isIndexedFolder } = selectedFolderStore;

    const { usersStore, groupsStore, viewAs: contactsViewAs } = peopleStore;

    const { groups, groupsFilter, setGroupsFilter } = groupsStore;

    const {
      filter: usersFilter,
      setFilter: setUsersFilter,
      contactsTab,
    } = usersStore;

    const { isPublicRoom, publicRoomKey } = publicRoomStore;

    return {
      isRoomAdmin,
      showStorageInfo,
      isDefaultRoomsQuotaSet,

      userId: user?.id,

      isCollaborator: user?.isCollaborator,
      isVisitor: user?.isVisitor,

      filter,
      roomsFilter,
      viewAs,

      isFavoritesFolder,
      isRecentTab,
      isRooms,
      isTrash,
      isArchiveFolder,
      isTemplatesFolder,
      isIndexing: isIndexedFolder,
      isIndexEditingMode,

      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      showFilterLoader: clientLoadingStore.showFilterLoader,

      fetchTags,
      setViewAs,
      createThumbnails,

      isPersonalRoom,
      infoPanelVisible,
      setCurrentRoomsFilter,
      fetchThirdPartyProviders,

      isLoadedEmptyPage,

      clearSearch,
      setClearSearch,

      setMainButtonMobileVisible,

      contactsViewAs,
      contactsTab,
      groups,
      groupsFilter,
      setGroupsFilter,

      usersFilter,
      setUsersFilter,

      isPublicRoom,
      publicRoomKey,
      setRoomsFilter,
      standalone,
      currentDeviceType,
      isRoomTrash,
    };
  },
)(
  withLayoutSize(
    withTranslation([
      "Files",
      "Settings",
      "Common",
      "Translations",
      "InfoPanel",
      "People",
      "PeopleTranslations",
      "ConnectDialog",
      "SmartBanner",
    ])(observer(SectionFilterContent)),
  ),
);
