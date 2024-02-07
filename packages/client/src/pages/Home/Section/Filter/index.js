﻿import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router-dom";

import { withTranslation } from "react-i18next";
import find from "lodash/find";
import result from "lodash/result";

import { isMobile, isTablet } from "@docspace/shared/utils";
import { RoomsTypeValues } from "@docspace/shared/utils/common";
import FilterInput from "@docspace/shared/components/filter";
import { withLayoutSize } from "@docspace/shared/HOC/withLayoutSize";
import { getUser, getUserById } from "@docspace/shared/api/people";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import AccountsFilter from "@docspace/shared/api/people/filter";
import FilesFilter from "@docspace/shared/api/files/filter";
import {
  AccountLoginType,
  DeviceType,
  EmployeeStatus,
  EmployeeType,
  FilterGroups,
  FilterKeys,
  FilterSubject,
  FilterType,
  PaymentsType,
  RoomSearchArea,
  RoomsProviderType,
  RoomsType,
} from "@docspace/shared/enums";
import { ROOMS_PROVIDER_TYPE_NAME } from "@docspace/shared/constants";

import { getDefaultRoomName } from "SRC_DIR/helpers/filesUtils";

import { SSO_LABEL, TableVersions } from "SRC_DIR/helpers/constants";
import { SortByFieldName } from "SRC_DIR/helpers/enums";

import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import { getGroupById } from "@docspace/shared/api/groups";
import { getRoomInfo } from "@docspace/shared/api/rooms";
import { FilterLoader } from "@docspace/shared/skeletons/filter";

const getAccountLoginType = (filterValues) => {
  const accountLoginType = result(
    find(filterValues, (value) => {
      return value.group === "filter-login-type";
    }),
    "key",
  );

  return accountLoginType || null;
};

const getFilterType = (filterValues) => {
  const filterType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterType;
    }),
    "key",
  );

  return filterType?.toString() ? +filterType : null;
};

const getSubjectFilter = (filterValues) => {
  const subjectFilter = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.roomFilterOwner;
    }),
    "key",
  );

  return subjectFilter?.toString() ? subjectFilter?.toString() : null;
};

const getAuthorType = (filterValues) => {
  const authorType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterAuthor;
    }),
    "key",
  );

  return authorType ? authorType : null;
};

const getRoomId = (filterValues) => {
  const filterRoomId = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterRoom;
    }),
    "key",
  );

  return filterRoomId || null;
};

const getSearchParams = (filterValues) => {
  const searchParams = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterFolders;
    }),
    "key",
  );

  return searchParams || FilterKeys.excludeSubfolders;
};

const getType = (filterValues) => {
  const filterType = filterValues.find(
    (value) => value.group === FilterGroups.roomFilterType,
  )?.key;

  const type = filterType;

  return type;
};

const getProviderType = (filterValues) => {
  const filterType = filterValues.find(
    (value) => value.group === FilterGroups.roomFilterProviderType,
  )?.key;

  const type = filterType;

  return type;
};

const getSubjectId = (filterValues) => {
  const filterOwner = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.roomFilterSubject;
    }),
    "key",
  );

  return filterOwner ? filterOwner : null;
};

const getGroupMemberId = (filterValues, userId) => {
  const filterMember = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.groupsFilterMember;
    }),
    "key",
  );

  if (!filterMember) {
    return null;
  }

  return filterMember === FilterKeys.me ? userId : filterMember;
};

const getSearchByManager = (filterValues) => {
  return filterValues.some((v) => v.group === FilterGroups.groupsFilterManager);
};

const getStatus = (filterValues) => {
  const employeeStatus = result(
    find(filterValues, (value) => {
      return value.group === "filter-status";
    }),
    "key",
  );

  return employeeStatus ? +employeeStatus : null;
};

const getRole = (filterValues) => {
  const employeeStatus = result(
    find(filterValues, (value) => {
      return value.group === "filter-type";
    }),
    "key",
  );

  return employeeStatus || null;
};

const getPayments = (filterValues) => {
  const employeeStatus = result(
    find(filterValues, (value) => {
      return value.group === "filter-account";
    }),
    "key",
  );

  return employeeStatus || null;
};

const getGroup = (filterValues) => {
  const groupId = result(
    find(filterValues, (value) => {
      return (
        value.group === FilterGroups.filterGroup &&
        value.key !== FilterKeys.withoutGroup
      );
    }),
    "key",
  );

  return groupId || null;
};

const getWithoutGroup = (filterValues) => {
  return filterValues.some((value) => value.key === FilterKeys.withoutGroup);
};

const getFilterContent = (filterValues) => {
  const filterContent = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterContent;
    }),
    "key",
  );

  return filterContent ? filterContent : null;
};

const getTags = (filterValues) => {
  const filterTags = filterValues.find(
    (value) => value.group === FilterGroups.roomFilterTags,
  )?.key;

  const tags = filterTags?.length > 0 ? filterTags : null;

  return tags;
};

const TABLE_COLUMNS = `filesTableColumns_ver-${TableVersions.Files}`;

const COLUMNS_SIZE_INFO_PANEL = `filesColumnsSizeInfoPanel_ver-${TableVersions.Files}`;

const TABLE_ROOMS_COLUMNS = `roomsTableColumns_ver-${TableVersions.Rooms}`;

const COLUMNS_ROOMS_SIZE_INFO_PANEL = `roomsColumnsSizeInfoPanel_ver-${TableVersions.Rooms}`;

const TABLE_TRASH_COLUMNS = `trashTableColumns_ver-${TableVersions.Trash}`;

const COLUMNS_TRASH_SIZE_INFO_PANEL = `trashColumnsSizeInfoPanel_ver-${TableVersions.Trash}`;

const SectionFilterContent = ({
  t,
  filter,
  roomsFilter,
  personal,
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
  userId,
  isPersonalRoom,

  providers,

  clearSearch,
  setClearSearch,
  setMainButtonMobileVisible,
  isArchiveFolder,
  canSearchByContent,
  accountsViewAs,
  groups,
  groupsFilter,

  accountsFilter,
  showFilterLoader,
  isPublicRoom,
  publicRoomKey,
  setRoomsFilter,
  standalone,
  currentDeviceType,
  isRoomAdmin,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAccountsPage = location.pathname.includes("accounts");
  const isPeopleAccounts = location.pathname.includes("accounts/people");
  const isGroupsAccounts = location.pathname.includes("accounts/groups");

  const [selectedFilterValues, setSelectedFilterValues] = React.useState(null);

  const onNavigate = (path, filter) => {
    if (isPublicRoom) {
      navigate(`${path}?key=${publicRoomKey}&${filter.toUrlParams()}`);
    } else {
      navigate(`${path}/filter?${filter.toUrlParams()}`);
    }
  };

  const onFilter = React.useCallback(
    (data) => {
      setIsLoading(true);
      if (isPeopleAccounts) {
        const status = getStatus(data);

        const role = getRole(data);
        const group = getGroup(data);
        const payments = getPayments(data);
        const accountLoginType = getAccountLoginType(data);
        const withoutGroup = getWithoutGroup(data);

        const newFilter = accountsFilter.clone();

        newFilter.withoutGroup = withoutGroup;

        if (status === 3) {
          newFilter.employeeStatus = EmployeeStatus.Disabled;
          newFilter.activationStatus = null;
        } else if (status === 2) {
          newFilter.employeeStatus = EmployeeStatus.Active;
          newFilter.activationStatus = status;
        } else {
          newFilter.employeeStatus = null;
          newFilter.activationStatus = status;
        }

        newFilter.page = 0;

        newFilter.role = role;

        newFilter.group = group;

        newFilter.payments = payments;

        newFilter.accountLoginType = accountLoginType;

        navigate(`accounts/people/filter?${newFilter.toUrlParams()}`);
      } else if (isGroupsAccounts) {
        const newFilter = groupsFilter.clone();

        const memberId = getGroupMemberId(data, userId);
        const searchByManager = getSearchByManager(data);

        newFilter.page = 0;
        newFilter.userId = memberId;

        if (memberId) {
          newFilter.searchByManager = searchByManager;
        }

        navigate(`accounts/groups/filter?${newFilter.toUrlParams()}`);
      } else if (isRooms) {
        const type = getType(data) || null;

        const subjectId = getSubjectId(data) || null;

        const subjectFilter = getSubjectFilter(data) || null;

        const providerType = getProviderType(data) || null;
        const tags = getTags(data) || null;

        const newFilter = roomsFilter.clone();

        newFilter.page = 0;
        newFilter.provider = providerType ? providerType : null;
        newFilter.type = type ? type : null;

        newFilter.subjectFilter = null;
        newFilter.subjectId = null;

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
          newFilter.searchArea === RoomSearchArea.Active
            ? "rooms/shared"
            : "rooms/archived";
        navigate(`${path}/filter?${newFilter.toUrlParams()}`);
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
      isAccountsPage,
      isTrash,
      setIsLoading,
      roomsFilter,
      accountsFilter,
      groupsFilter,
      filter,

      isPeopleAccounts,
      isGroupsAccounts,
      location.pathname,
    ],
  );

  const onClearFilter = useCallback(() => {
    if (isAccountsPage) {
      return;
    }
    setIsLoading(true);
    if (isRooms) {
      const newFilter = RoomsFilter.getDefault();
      newFilter.searchArea = roomsFilter.searchArea;

      const path =
        roomsFilter.searchArea === RoomSearchArea.Active
          ? "rooms/shared"
          : "rooms/archived";

      navigate(`${path}/filter?${newFilter.toUrlParams()}`);
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
    isAccountsPage,

    location.pathname,
  ]);

  const onSearch = React.useCallback(
    (data = "") => {
      const searchValue = data?.trim() ?? "";

      if (
        !filter.search &&
        !roomsFilter.filterValue &&
        !accountsFilter.search &&
        searchValue.length === 0
      )
        return;

      setIsLoading(true);
      if (isAccountsPage) {
        const newFilter = isGroupsAccounts
          ? groupsFilter.clone()
          : accountsFilter.clone();
        const subModule = isGroupsAccounts ? "groups" : "people";

        newFilter.page = 0;
        newFilter.search = searchValue;

        navigate(`accounts/${subModule}/filter?${newFilter.toUrlParams()}`);
      } else if (isRooms) {
        const newFilter = roomsFilter.clone();

        newFilter.page = 0;
        newFilter.filterValue = searchValue;

        const path =
          newFilter.searchArea === RoomSearchArea.Active
            ? "rooms/shared"
            : "rooms/archived";

        navigate(`${path}/filter?${newFilter.toUrlParams()}`);
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
      isAccountsPage,
      isPeopleAccounts,
      isGroupsAccounts,
      setIsLoading,

      filter,
      roomsFilter,
      accountsFilter,
      groupsFilter,
      location.pathname,
    ],
  );

  const onSort = React.useCallback(
    (sortId, sortDirection) => {
      const sortBy = sortId;
      const sortOrder = sortDirection === "desc" ? "descending" : "ascending";

      const newFilter = isPeopleAccounts
        ? accountsFilter.clone()
        : isGroupsAccounts
          ? groupsFilter.clone()
          : isRooms
            ? roomsFilter.clone()
            : filter.clone();
      newFilter.page = 0;
      newFilter.sortBy = sortBy;
      newFilter.sortOrder = sortOrder;

      setIsLoading(true);

      if (isPeopleAccounts) {
        navigate(`accounts/people/filter?${newFilter.toUrlParams()}`);
      } else if (isGroupsAccounts) {
        navigate(`accounts/groups/filter?${newFilter.toUrlParams()}`);
      } else if (isRooms) {
        const path =
          newFilter.searchArea === RoomSearchArea.Active
            ? "rooms/shared"
            : "rooms/archived";
        setRoomsFilter(newFilter);
        navigate(`${path}/filter?${newFilter.toUrlParams()}`);
      } else {
        const path = location.pathname.split("/filter")[0];

        onNavigate(path, newFilter);
      }
    },
    [
      isRooms,
      isAccountsPage,
      isPeopleAccounts,
      isGroupsAccounts,
      setIsLoading,
      filter,
      roomsFilter,
      accountsFilter,
      groupsFilter,
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
    return isAccountsPage
      ? accountsFilter.search
        ? accountsFilter.search
        : ""
      : isGroupsAccounts
        ? groupsFilter.search
          ? groupsFilter.search
          : ""
        : isRooms
          ? roomsFilter.filterValue
            ? roomsFilter.filterValue
            : ""
          : filter.search
            ? filter.search
            : "";
  }, [
    isRooms,
    isAccountsPage,
    isPeopleAccounts,
    isGroupsAccounts,
    roomsFilter.filterValue,
    filter.search,
    accountsFilter.search,
    groupsFilter.search,
  ]);

  const getSelectedSortData = React.useCallback(() => {
    const currentFilter = isPeopleAccounts
      ? accountsFilter
      : isGroupsAccounts
        ? groupsFilter
        : isRooms
          ? roomsFilter
          : filter;
    return {
      sortDirection: currentFilter.sortOrder === "ascending" ? "asc" : "desc",
      sortId: currentFilter.sortBy,
    };
  }, [
    isRooms,
    isAccountsPage,
    isPeopleAccounts,
    isGroupsAccounts,
    filter.sortOrder,
    filter.sortBy,
    roomsFilter.sortOrder,
    roomsFilter.sortBy,
    accountsFilter.sortOrder,
    accountsFilter.sortBy,
    groupsFilter.sortOrder,
    groupsFilter.sortBy,
  ]);

  const getSelectedFilterData = React.useCallback(async () => {
    const filterValues = [];

    if (isAccountsPage) {
      if (isPeopleAccounts) {
        if (accountsFilter.employeeStatus || accountsFilter.activationStatus) {
          const key =
            accountsFilter.employeeStatus === 2
              ? 3
              : accountsFilter.activationStatus;
          let label = "";

          switch (key) {
            case 1:
              label = t("Common:Active");
              break;
            case 2:
              label = t("PeopleTranslations:PendingTitle");
              break;
            case 3:
              label = t("PeopleTranslations:DisabledEmployeeStatus");
              break;
          }

          filterValues.push({
            key,
            label,
            group: "filter-status",
          });
        }

        if (accountsFilter.role) {
          let label = null;

          switch (+accountsFilter.role) {
            case EmployeeType.Admin:
              label = t("Common:DocSpaceAdmin");
              break;
            case EmployeeType.User:
              label = t("Common:RoomAdmin");
              break;
            case EmployeeType.Collaborator:
              label = t("Common:PowerUser");
              break;
            case EmployeeType.Guest:
              label = t("Common:User");
              break;
            default:
              label = "";
          }

          filterValues.push({
            key: +accountsFilter.role,
            label: label,
            group: "filter-type",
          });
        }

        if (accountsFilter?.payments?.toString()) {
          filterValues.push({
            key: accountsFilter.payments.toString(),
            label:
              PaymentsType.Paid === accountsFilter.payments.toString()
                ? t("Common:Paid")
                : t("Common:Free"),
            group: "filter-account",
          });
        }

        if (accountsFilter?.accountLoginType?.toString()) {
          const label =
            AccountLoginType.SSO === accountsFilter.accountLoginType.toString()
              ? SSO_LABEL
              : AccountLoginType.LDAP ===
                  accountsFilter.accountLoginType.toString()
                ? t("PeopleTranslations:LDAPLbl")
                : t("PeopleTranslations:StandardLogin");
          filterValues.push({
            key: accountsFilter.accountLoginType.toString(),
            label: label,
            group: "filter-login-type",
          });
        }

        if (accountsFilter.group) {
          const groupId = accountsFilter.group;
          const group = await getGroupById(groupId);

          if (group) {
            filterValues.push({
              key: groupId,
              group: FilterGroups.filterGroup,
              label: group.name,
            });
          }
        }

        if (accountsFilter.withoutGroup) {
          filterValues.push({
            key: FilterKeys.withoutGroup,
            label: t("PeopleTranslations:WithoutGroup"),
            group: FilterGroups.filterGroup,
          });
        }
      }

      if (isGroupsAccounts) {
        if (groupsFilter.userId) {
          const memberId = groupsFilter.userId;
          const member = await getUserById(memberId);
          const isMe = userId === groupsFilter.userId;

          const label = isMe ? t("Common:MeLabel") : member.displayName;

          const memberFilterValue = {
            key: isMe ? FilterKeys.me : groupsFilter.userId,
            group: FilterGroups.groupsFilterMember,
            label,
          };

          if (groupsFilter.searchByManager) {
            memberFilterValue.selectedLabel = `${t("Common:HeadOfGroup")}: ${label}`;
          }

          filterValues.push(memberFilterValue);
        }

        if (groupsFilter.searchByManager) {
          filterValues.push({
            key: FilterKeys.byManager,
            group: FilterGroups.groupsFilterManager,
          });
        }
      }

      const currentFilterValues = [];

      setSelectedFilterValues((value) => {
        if (!value) {
          currentFilterValues.push(...filterValues);
          return filterValues.map((f) => ({ ...f }));
        }

        const items = value.map((v) => {
          const item = filterValues.find((f) => f.group === v.group);

          if (item) {
            if (item.isMultiSelect) {
              let isEqual = true;

              item.key.forEach((k) => {
                if (!v.key.includes(k)) {
                  isEqual = false;
                }
              });

              if (isEqual) return item;

              return false;
            } else {
              if (item.key === v.key) return item;
              return false;
            }
          } else {
            return false;
          }
        });

        const newItems = filterValues.filter(
          (v) => !items.find((i) => i.group === v.group),
        );

        items.push(...newItems);

        currentFilterValues.push(...items.filter((i) => i));

        return items.filter((i) => i);
      });

      return currentFilterValues;
    }

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

        let label = isMe ? t("Common:MeLabel") : user.displayName;

        const subject = {
          key: isMe ? FilterKeys.me : roomsFilter.subjectId,
          group: FilterGroups.roomFilterSubject,
          label: label,
        };

        if (roomsFilter.subjectFilter?.toString()) {
          if (roomsFilter.subjectFilter.toString() === FilterSubject.Owner) {
            subject.selectedLabel = t("Common:Owner") + ": " + label;
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

        const label = getDefaultRoomName(key, t);

        filterValues.push({
          key: key,
          label: label,
          group: FilterGroups.roomFilterType,
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
          label: label,
          group: FilterGroups.roomFilterProviderType,
        });
      }
    } else {
      if (filter.withSubfolders === "true") {
        filterValues.push({
          key: FilterKeys.withSubfolders,
          label: t("WithSubfolders"),
          group: FilterGroups.filterFolders,
        });
      }

      if (filter.searchInContent) {
        filterValues.push({
          key: "true",
          label: t("FileContents"),
          group: FilterGroups.filterContent,
        });
      }

      if (filter.filterType) {
        let label = "";

        switch (filter.filterType.toString()) {
          case FilterType.DocumentsOnly.toString():
            label = t("Common:Documents");
            break;
          case FilterType.FoldersOnly.toString():
            label = t("Translations:Folders");
            break;
          case FilterType.SpreadsheetsOnly.toString():
            label = t("Translations:Spreadsheets");
            break;
          case FilterType.ArchiveOnly.toString():
            label = t("Archives");
            break;
          case FilterType.PresentationsOnly.toString():
            label = t("Translations:Presentations");
            break;
          case FilterType.ImagesOnly.toString():
            label = t("Images");
            break;
          case FilterType.MediaOnly.toString():
            label = t("Media");
            break;
          case FilterType.FilesOnly.toString():
            label = t("AllFiles");
            break;
          case FilterType.OFormTemplateOnly.toString():
            label = t("FormsTemplates");
            break;
          case FilterType.OFormOnly.toString():
            label = t("Forms");
            break;
        }

        filterValues.push({
          key: `${filter.filterType}`,
          label: label.toLowerCase(),
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
          label: label,
        });
      }

      if (filter.roomId) {
        const room = await getRoomInfo(filter.roomId);
        const label = room.title;

        filterValues.push({
          key: filter.roomId,
          group: FilterGroups.filterRoom,
          label: label,
        });
      }
    }

    // return filterValues;
    const currentFilterValues = [];

    setSelectedFilterValues((value) => {
      if (!value) {
        currentFilterValues.push(...filterValues);
        return filterValues.map((f) => ({ ...f }));
      }

      const items = value.map((v) => {
        const item = filterValues.find((f) => f.group === v.group);

        if (item) {
          if (item.isMultiSelect) {
            let isEqual = true;

            item.key.forEach((k) => {
              if (!v.key.includes(k)) {
                isEqual = false;
              }
            });

            if (isEqual) return item;

            return false;
          } else {
            if (item.key === v.key) return item;
            return false;
          }
        } else {
          return false;
        }
      });

      const newItems = filterValues.filter(
        (v) => !items.find((i) => i.group === v.group),
      );

      items.push(...newItems);

      currentFilterValues.push(...items.filter((i) => i));

      return items.filter((i) => i);
    });

    return currentFilterValues;
  }, [
    filter.withSubfolders,
    filter.authorType,
    filter.roomId,
    filter.filterType,
    filter.searchInContent,
    filter.excludeSubject,
    roomsFilter.provider,
    roomsFilter.type,
    roomsFilter.subjectId,
    roomsFilter.subjectFilter,
    roomsFilter.tags,
    roomsFilter.tags?.length,
    roomsFilter.excludeSubject,
    roomsFilter.withoutTags,
    // roomsFilter.withSubfolders,
    // roomsFilter.searchInContent,
    userId,
    isRooms,
    isAccountsPage,

    isPeopleAccounts,
    accountsFilter.employeeStatus,
    accountsFilter.activationStatus,
    accountsFilter.role,
    accountsFilter.payments,
    accountsFilter.group,
    accountsFilter.accountLoginType,
    accountsFilter.withoutGroup,

    isGroupsAccounts,
    groupsFilter.userId,
    groupsFilter.searchByManager,
    t,
  ]);

  const getFilterData = React.useCallback(async () => {
    if (isPeopleAccounts) {
      const groupItems = [
        {
          key: FilterGroups.filterGroup,
          group: FilterGroups.filterGroup,
          label: t("PeopleTranslations:Group"),
          isHeader: true,
        },
        {
          id: "filter_group-without-group",
          key: FilterKeys.withoutGroup,
          group: FilterGroups.filterGroup,
          label: t("PeopleTranslations:WithoutGroup"),
        },
        {
          id: "filter_group-other",
          key: FilterKeys.other,
          group: FilterGroups.filterGroup,
          label: t("Common:OtherLabel"),
        },
        {
          id: "filter_group-selected-group",
          key: FilterKeys.selectedGroup,
          group: FilterGroups.filterGroup,
          displaySelectorType: "link",
        },
      ];

      const statusItems = [
        {
          id: "filter_status-user",
          key: "filter-status",
          group: "filter-status",
          label: t("People:UserStatus"),
          isHeader: true,
        },
        {
          id: "filter_status-active",
          key: 1,
          group: "filter-status",
          label: t("Common:Active"),
        },
        {
          id: "filter_status-pending",
          key: 2,
          group: "filter-status",
          label: t("PeopleTranslations:PendingTitle"),
        },
      ];

      if (!isRoomAdmin)
        statusItems.push({
          id: "filter_status-disabled",
          key: 3,
          group: "filter-status",
          label: t("PeopleTranslations:DisabledEmployeeStatus"),
        });

      const typeItems = [
        {
          key: "filter-type",
          group: "filter-type",
          label: t("Common:Type"),
          isHeader: true,
        },
        {
          id: "filter_type-docspace-admin",
          key: EmployeeType.Admin,
          group: "filter-type",
          label: t("Common:DocSpaceAdmin"),
        },
        {
          id: "filter_type-room-admin",
          key: EmployeeType.User,
          group: "filter-type",
          label: t("Common:RoomAdmin"),
        },
        {
          id: "filter_type-room-admin",
          key: EmployeeType.Collaborator,
          group: "filter-type",
          label: t("Common:PowerUser"),
        },
        {
          id: "filter_type-user",
          key: EmployeeType.Guest,
          group: "filter-type",
          label: t("Common:User"),
        },
      ];

      // const roleItems = [
      //   {
      //     key: "filter-role",
      //     group: "filter-role",
      //     label: "Role in room",
      //     isHeader: true,
      //   },
      //   { key: "1", group: "filter-role", label: "Room manager" },
      //   { key: "2", group: "filter-role", label: "Co-worker" },
      //   { key: "3", group: "filter-role", label: "Editor" },
      //   { key: "4", group: "filter-role", label: "Form filler" },
      //   { key: "5", group: "filter-role", label: "Reviewer" },
      //   { key: "6", group: "filter-role", label: "Commentator" },
      //   { key: "7", group: "filter-role", label: "Viewer" },
      // ];

      const accountItems = [
        {
          key: "filter-account",
          group: "filter-account",
          label: t("ConnectDialog:Account"),
          isHeader: true,
          isLast: false,
        },
        {
          key: PaymentsType.Paid,
          group: "filter-account",
          label: t("Common:Paid"),
        },
        {
          key: PaymentsType.Free,
          group: "filter-account",
          label: t("Common:Free"),
        },
      ];

      // const roomItems = [
      //   {
      //     key: "filter-status",
      //     group: "filter-status",
      //     label: t("People:UserStatus"),
      //     isHeader: true,
      //   },
      //   {
      //     key: "1",
      //     group: "filter-status",
      //     label: t("Common:Active"),
      //     isSelector: true,
      //     selectorType: "room",
      //   },
      // ];

      const accountLoginTypeItems = [
        {
          key: "filter-login-type",
          group: "filter-login-type",
          label: t("PeopleTranslations:AccountLoginType"),
          isHeader: true,
          isLast: true,
        },
        {
          key: AccountLoginType.SSO,
          group: "filter-login-type",
          label: SSO_LABEL,
        },
        //TODO: uncomment after ldap be ready
        /*{
          key: AccountLoginType.LDAP,
          group: "filter-login-type",
          label: t("PeopleTranslations:LDAPLbl"),
        },*/
        {
          key: AccountLoginType.STANDART,
          group: "filter-login-type",
          label: t("PeopleTranslations:StandardLogin"),
        },
      ];

      const filterOptions = [];

      filterOptions.push(...groupItems);
      filterOptions.push(...statusItems);
      filterOptions.push(...typeItems);
      // filterOptions.push(...roleItems);
      if (!standalone) filterOptions.push(...accountItems);
      // filterOptions.push(...roomItems);
      filterOptions.push(...accountLoginTypeItems);

      return filterOptions;
    }

    if (isGroupsAccounts) {
      const memberOptions = [
        {
          key: FilterGroups.groupsFilterMember,
          group: FilterGroups.groupsFilterMember,
          label: t("Common:Member"),
          isHeader: true,
          withoutSeparator: true,
        },
        {
          id: "filter_group-member-me",
          key: FilterKeys.me,
          group: FilterGroups.groupsFilterMember,
          label: t("Common:MeLabel"),
        },
        {
          id: "filter_group-member-other",
          key: FilterKeys.other,
          group: FilterGroups.groupsFilterMember,
          label: t("Common:OtherLabel"),
        },
        {
          id: "filter_group-member-user",
          key: FilterKeys.user,
          group: FilterGroups.groupsFilterMember,
          displaySelectorType: "link",
        },
      ];

      const managerOptions = [
        {
          key: FilterGroups.groupsFilterManager,
          group: FilterGroups.groupsFilterManager,
          isHeader: true,
          withoutHeader: true,
          withoutSeparator: true,
        },
        {
          id: "filter_group-manager",
          key: FilterKeys.byManager,
          group: FilterGroups.groupsFilterManager,
          label: t("Translations:SearchByHeadOfGroup"),
          isDisabled: true,
          isCheckbox: true,
        },
      ];

      const filterOptions = [];

      filterOptions.push(...memberOptions);
      filterOptions.push(...managerOptions);

      return filterOptions;
    }

    let tags = null;
    if (!isPublicRoom) tags = await fetchTags();
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
              label: t("Translations:Folders").toLowerCase(),
            },
          ]
        : "";

    const images = !isRecentTab
      ? [
          {
            id: "filter_type-images",
            key: FilterType.ImagesOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Images").toLowerCase(),
          },
        ]
      : "";

    const archives = !isRecentTab
      ? [
          {
            id: "filter_type-archive",
            key: FilterType.ArchiveOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Archives").toLowerCase(),
          },
        ]
      : "";

    const media = !isRecentTab
      ? [
          {
            id: "filter_type-media",
            key: FilterType.MediaOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Media").toLowerCase(),
          },
        ]
      : "";

    const typeOptions = isRooms
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
                  label: t("FillingFormRooms"),
                };
              case RoomsType.EditingRoom:
                return {
                  id: "filter_type-collaboration",
                  key: RoomsType.EditingRoom,
                  group: FilterGroups.roomFilterType,
                  label: t("CollaborationRooms"),
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
                  label: t("ViewOnlyRooms"),
                };
              case RoomsType.FormRoom:
                return {
                  id: "filter_type-form",
                  key: RoomsType.FormRoom,
                  group: FilterGroups.roomFilterType,
                  label: t("FormRoom"),
                };
              case RoomsType.PublicRoom:
                return {
                  id: "filter_type-public",
                  key: RoomsType.PublicRoom,
                  group: FilterGroups.roomFilterType,
                  label: t("PublicRoom"),
                };
              case RoomsType.CustomRoom:
              default:
                return {
                  id: "filter_type-custom",
                  key: RoomsType.CustomRoom,
                  group: FilterGroups.roomFilterType,
                  label: t("CustomRooms"),
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
            isLast: !isTrash,
          },
          ...folders,
          {
            id: "filter_type-documents",
            key: FilterType.DocumentsOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Common:Documents").toLowerCase(),
          },
          {
            id: "filter_type-presentations",
            key: FilterType.PresentationsOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Translations:Presentations").toLowerCase(),
          },
          {
            id: "filter_type-spreadsheets",
            key: FilterType.SpreadsheetsOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Translations:Spreadsheets").toLowerCase(),
          },
          {
            id: "filter_type-form-templates",
            key: FilterType.OFormTemplateOnly.toString(),
            group: FilterGroups.filterType,
            label: t("FormsTemplates").toLowerCase(),
          },
          {
            id: "filter_type-forms",
            key: FilterType.OFormOnly.toString(),
            group: FilterGroups.filterType,
            label: t("Forms").toLowerCase(),
          },
          ...archives,

          ...images,
          ...media,
          {
            id: "filter_type-all-files",
            key: FilterType.FilesOnly.toString(),
            group: FilterGroups.filterType,
            label: t("AllFiles").toLowerCase(),
          },
        ];

    const subjectOptions = [
      {
        key: FilterGroups.roomFilterSubject,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:Member"),
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
        id: "filter_author-other",
        key: FilterKeys.other,
        group: FilterGroups.roomFilterSubject,
        label: t("Common:OtherLabel"),
      },
      {
        id: "filter_author-user",
        key: FilterKeys.user,
        group: FilterGroups.roomFilterSubject,
        displaySelectorType: "link",
      },
    ];

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

      if (connectedThirdParty.length > 0) {
        const thirdPartyOptions = connectedThirdParty.map((thirdParty) => {
          const key = Object.entries(RoomsProviderType).find(
            (item) => item[0] === thirdParty,
          )[1];

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
          label: t("Settings:ThirdPartyResource"),
          isHeader: true,
          isLast: true,
        });

        filterOptions.push(...thirdPartyOptions);
      }
    } else {
      if (!isRecentTab && !isFavoritesFolder && !isTrash) {
        const foldersOptions = [
          {
            key: FilterGroups.filterFolders,
            group: FilterGroups.filterFolders,
            label: t("Common:Search"),
            isHeader: true,
            withoutSeparator: true,
          },
          {
            id: "filter_folders",
            key: "folders",
            group: FilterGroups.filterFolders,
            label: "",
            withOptions: true,
            options: [
              {
                id: "filter_folders_exclude-subfolders",
                key: FilterKeys.excludeSubfolders,
                label: t("ExcludeSubfolders"),
              },
              {
                id: "filter_folders_with-subfolders",
                key: FilterKeys.withSubfolders,
                label: t("WithSubfolders"),
              },
            ],
          },
        ];

        const contentOptions = [
          {
            key: FilterGroups.filterContent,
            group: FilterGroups.filterContent,
            isHeader: true,
            withoutHeader: true,
          },
        ];
        canSearchByContent &&
          contentOptions.push({
            id: "filter_search-by-file-contents",
            key: "true",
            group: FilterGroups.filterContent,
            label: t("SearchByContent"),
            isCheckbox: true,
          });

        filterOptions.push(...foldersOptions);
        filterOptions.push(...contentOptions);
      }

      const authorOption = [
        {
          key: FilterGroups.filterAuthor,
          group: FilterGroups.filterAuthor,
          label: t("ByAuthor"),
          isHeader: true,
          withMultiItems: true,
        },
        {
          id: "filter_author-me",
          key: FilterKeys.me,
          group: FilterGroups.filterAuthor,
          label: t("Common:MeLabel"),
        },
        {
          id: "filter_author-other",
          key: FilterKeys.other,
          group: FilterGroups.filterAuthor,
          label: t("Common:OtherLabel"),
        },
        {
          id: "filter_author-user",
          key: FilterKeys.user,
          group: FilterGroups.filterAuthor,
          displaySelectorType: "link",
        },
      ];

      !isPublicRoom && filterOptions.push(...authorOption);
      filterOptions.push(...typeOptions);

      if (isTrash) {
        const roomOption = [
          {
            id: "filter_search-by-room-content-header",
            key: "filter_search-by-room-content-header",
            group: FilterGroups.filterRoom,
            label: t("Common:Room"),
            isHeader: true,
            isLast: true,
          },
          {
            id: "filter_search-by-room-content",
            key: "filter_search-by-room-content",
            group: FilterGroups.filterRoom,
            withoutHeader: true,
            label: t("Common:SelectRoom"),
            displaySelectorType: "button",
            isLast: true,
          },
        ];
        filterOptions.push(...roomOption);
      }
    }
    return filterOptions;
  }, [
    t,
    personal,
    providers,
    isPersonalRoom,
    isRooms,
    isAccountsPage,
    isPeopleAccounts,
    isGroupsAccounts,
    isFavoritesFolder,
    isRecentTab,
    isTrash,
    isPublicRoom,
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
    if (isPeopleAccounts) {
      return [
        {
          id: "sory-by_first-name",
          key: "firstname",
          label: t("Common:ByFirstNameSorting"),
          default: true,
        },
        {
          id: "sory-by_last-name",
          key: "lastname",
          label: t("Common:ByLastNameSorting"),
          default: true,
        },
        {
          id: "sory-by_type",
          key: "type",
          label: t("Common:Type"),
          default: true,
        },
        {
          id: "sory-by_email",
          key: "email",
          label: t("Common:Email"),
          default: true,
        },
      ];
    }

    if (isGroupsAccounts) {
      return [
        {
          id: "sort-by_title",
          key: "title",
          label: t("Common:Title"),
          default: true,
        },
        {
          id: "sort-by_manager",
          key: "Head of Group",
          label: t("Common:HeadOfGroup"),
          default: true,
        },
      ];
    }

    const commonOptions = [];

    const name = {
      id: "sort-by_name",
      key: SortByFieldName.Name,
      label: t("Common:Name"),
      default: true,
    };
    const modifiedDate = {
      id: "sort-by_modified",
      key: SortByFieldName.ModifiedDate,
      label: t("Common:LastModifiedDate"),
      default: true,
    };
    const room = {
      id: "sort-by_room",
      key: SortByFieldName.Room,
      label: t("Common:Room"),
      default: true,
    };
    const authorOption = {
      id: "sort-by_author",
      key: SortByFieldName.Author,
      label: t("ByAuthor"),
      default: true,
    };
    const creationDate = {
      id: "sort-by_created",
      key: SortByFieldName.CreationDate,
      label: t("InfoPanel:CreationDate"),
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
    const type = {
      id: "sort-by_type",
      key: SortByFieldName.Type,
      label: t("Common:Type"),
      default: true,
    };
    const roomType = {
      id: "sort-by_room-type",
      key: SortByFieldName.RoomType,
      label: t("Common:Type"),
      default: true,
    };

    commonOptions.push(name);

    if (viewAs === "table") {
      if (isRooms) {
        const availableSort = localStorage
          ?.getItem(`${TABLE_ROOMS_COLUMNS}=${userId}`)
          ?.split(",");

        const infoPanelColumnsSize = localStorage
          ?.getItem(`${COLUMNS_ROOMS_SIZE_INFO_PANEL}=${userId}`)
          ?.split(" ");

        if (availableSort?.includes("Type")) {
          const idx = availableSort.findIndex((x) => x === "Type");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(roomType);
        }

        if (availableSort?.includes("Tags")) {
          const idx = availableSort.findIndex((x) => x === "Tags");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(tags);
        }

        if (availableSort?.includes("Owner")) {
          const idx = availableSort.findIndex((x) => x === "Owner");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(owner);
        }

        if (availableSort?.includes("Activity")) {
          const idx = availableSort.findIndex((x) => x === "Activity");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(modifiedDate);
        }
      } else if (isTrash) {
        const availableSort = localStorage
          ?.getItem(`${TABLE_TRASH_COLUMNS}=${userId}`)
          ?.split(",");

        const infoPanelColumnsSize = localStorage
          ?.getItem(`${COLUMNS_TRASH_SIZE_INFO_PANEL}=${userId}`)
          ?.split(" ");

        if (availableSort?.includes("Room")) {
          const idx = availableSort.findIndex((x) => x === "Room");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(room);
        }
        if (availableSort?.includes("AuthorTrash")) {
          const idx = availableSort.findIndex((x) => x === "AuthorTrash");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(authorOption);
        }
        if (availableSort?.includes("CreatedTrash")) {
          const idx = availableSort.findIndex((x) => x === "CreatedTrash");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(creationDate);
        }
        if (availableSort?.includes("Erasure")) {
          const idx = availableSort.findIndex((x) => x === "Erasure");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(erasure);
        }
        if (availableSort?.includes("SizeTrash")) {
          const idx = availableSort.findIndex((x) => x === "SizeTrash");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(size);
        }
        if (availableSort?.includes("TypeTrash")) {
          const idx = availableSort.findIndex((x) => x === "TypeTrash");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(type);
        }
      } else {
        const availableSort = localStorage
          ?.getItem(`${TABLE_COLUMNS}=${userId}`)
          ?.split(",");

        const infoPanelColumnsSize = localStorage
          ?.getItem(`${COLUMNS_SIZE_INFO_PANEL}=${userId}`)
          ?.split(" ");

        if (availableSort?.includes("Author")) {
          const idx = availableSort.findIndex((x) => x === "Author");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(authorOption);
        }
        if (availableSort?.includes("Created")) {
          const idx = availableSort.findIndex((x) => x === "Created");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(creationDate);
        }
        if (availableSort?.includes("Modified")) {
          const idx = availableSort.findIndex((x) => x === "Modified");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(modifiedDate);
        }
        if (availableSort?.includes("Size")) {
          const idx = availableSort.findIndex((x) => x === "Size");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          !hide && commonOptions.push(size);
        }
        if (availableSort?.includes("Type")) {
          const idx = availableSort.findIndex((x) => x === "Type");
          const hide =
            infoPanelVisible &&
            infoPanelColumnsSize &&
            infoPanelColumnsSize[idx] === "0px";

          // !hide && commonOptions.push(type);
        }
      }
    } else {
      if (isRooms) {
        commonOptions.push(roomType);
        commonOptions.push(tags);
        commonOptions.push(owner);
        commonOptions.push(modifiedDate);
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
      }
    }

    return commonOptions;
  }, [
    personal,
    isRooms,
    isAccountsPage,
    isPeopleAccounts,
    isGroupsAccounts,
    t,
    userId,
    infoPanelVisible,
    viewAs,
    isPersonalRoom,
    isTrash,
  ]);

  const removeSelectedItem = React.useCallback(
    ({ key, group }) => {
      setIsLoading(true);
      if (isPeopleAccounts) {
        const newFilter = accountsFilter.clone();
        newFilter.page = 0;

        if (group === "filter-status") {
          newFilter.employeeStatus = null;
          newFilter.activationStatus = null;
        }

        if (group === "filter-type") {
          newFilter.role = null;
        }

        if (group === "filter-other") {
          newFilter.group = null;
        }

        if (group === "filter-account") {
          newFilter.payments = null;
        }

        if (group === "filter-login-type") {
          newFilter.accountLoginType = null;
        }

        if (group === FilterGroups.filterGroup) {
          newFilter.withoutGroup = false;
          newFilter.group = null;
        }

        navigate(`accounts/people/filter?${newFilter.toUrlParams()}`);
      } else if (isGroupsAccounts) {
        const newFilter = groupsFilter.clone();
        newFilter.page = 0;

        if (group === FilterGroups.groupsFilterManager) {
          newFilter.searchByManager = false;
        }

        if (group === FilterGroups.groupsFilterMember) {
          newFilter.userId = null;
          newFilter.searchByManager = false;
        }

        navigate(`accounts/groups/filter?${newFilter.toUrlParams()}`);
      } else if (isRooms) {
        const newFilter = roomsFilter.clone();

        if (group === FilterGroups.roomFilterProviderType) {
          newFilter.provider = null;
        }

        if (group === FilterGroups.roomFilterType) {
          newFilter.type = null;
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
          newFilter.searchArea === RoomSearchArea.Active
            ? "rooms/shared"
            : "rooms/archived";

        navigate(`${path}/filter?${newFilter.toUrlParams()}`);
      } else {
        const newFilter = filter.clone();

        if (group === FilterGroups.filterType) {
          newFilter.filterType = null;
        }
        if (group === FilterGroups.filterAuthor) {
          newFilter.authorType = null;
          newFilter.excludeSubject = null;
        }
        if (group === FilterGroups.filterFolders) {
          newFilter.withSubfolders = null;
        }
        if (group === FilterGroups.filterContent) {
          newFilter.searchInContent = null;
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
      isAccountsPage,
      isPeopleAccounts,
      isGroupsAccounts,
      setIsLoading,
      roomsFilter,
      filter,
      accountsFilter,
      groupsFilter,
    ],
  );

  const onSortButtonClick = (isOpen) => {
    if (currentDeviceType === DeviceType.mobile) {
      setMainButtonMobileVisible(isOpen);
    }
  };

  const clearAll = () => {
    setIsLoading(true);
    if (isAccountsPage) {
      const newFilter = isGroupsAccounts
        ? groupsFilter.getDefault()
        : AccountsFilter.getDefault();
      const subModule = isGroupsAccounts ? "groups" : "people";

      navigate(`accounts/${subModule}/filter?${newFilter.toUrlParams()}`);
    } else if (isRooms) {
      const newFilter = RoomsFilter.getDefault();

      if (isArchiveFolder) {
        newFilter.searchArea = RoomSearchArea.Archive;
      }

      const path =
        newFilter.searchArea === RoomSearchArea.Active
          ? "rooms/shared"
          : "rooms/archived";

      navigate(`${path}/filter?${newFilter.toUrlParams()}`);
    } else {
      const newFilter = FilesFilter.getDefault();

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
      viewAs={isAccountsPage ? accountsViewAs : viewAs}
      viewSelectorVisible={!isAccountsPage}
      onChangeViewAs={onChangeViewAs}
      getViewSettingsData={getViewSettingsData}
      onSearch={onSearch}
      onClearFilter={onClearFilter}
      getSelectedInputValue={getSelectedInputValue}
      filterHeader={t("Common:AdvancedFilter")}
      placeholder={t("Common:Search")}
      view={t("Common:View")}
      isFavoritesFolder={isFavoritesFolder}
      isRecentTab={isRecentTab}
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
      filesSettingsStore,
      setRoomsFilter,
    } = filesStore;

    const { providers } = thirdPartyStore;

    const { fetchTags } = tagsStore;
    const { isRoomAdmin } = authStore;
    const { user } = userStore;
    const { personal, standalone, currentDeviceType } = settingsStore;
    const {
      isFavoritesFolder,
      isRecentTab,
      isRoomsFolder,
      isArchiveFolder,
      isPersonalRoom,
      isTrashFolder: isTrash,
    } = treeFoldersStore;

    const isRooms = isRoomsFolder || isArchiveFolder;

    const { isVisible: infoPanelVisible } = infoPanelStore;

    const {
      filterStore,

      groupsStore,
      viewAs: accountsViewAs,
    } = peopleStore;

    const { groups, filter: groupsFilter } = groupsStore;

    const { filter: accountsFilter } = filterStore;
    const { isPublicRoom, publicRoomKey } = publicRoomStore;

    const { canSearchByContent } = filesSettingsStore;

    return {
      isRoomAdmin,
      user,
      userId: user?.id,

      selectedItem: filter.selectedItem,
      filter,
      roomsFilter,
      viewAs,

      isFavoritesFolder,
      isRecentTab,
      isRooms,
      isTrash,
      isArchiveFolder,

      setIsLoading: clientLoadingStore.setIsSectionBodyLoading,
      showFilterLoader: clientLoadingStore.showFilterLoader,

      fetchTags,
      setViewAs,
      createThumbnails,

      personal,
      isPersonalRoom,
      infoPanelVisible,
      setCurrentRoomsFilter,
      providers,

      isLoadedEmptyPage,

      clearSearch,
      setClearSearch,

      setMainButtonMobileVisible,

      canSearchByContent,

      accountsViewAs,
      groups,
      groupsFilter,

      accountsFilter,
      isPublicRoom,
      publicRoomKey,
      setRoomsFilter,
      standalone,
      currentDeviceType,
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
