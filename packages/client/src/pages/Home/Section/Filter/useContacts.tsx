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

import React from "react";
import { useNavigate, useParams } from "react-router";
import find from "lodash/find";
import result from "lodash/result";

import UsersFilter from "@docspace/shared/api/people/filter";
import GroupsFilter from "@docspace/shared/api/groups/filter";
import { getUserById } from "@docspace/shared/api/people";
import { getGroupById } from "@docspace/shared/api/groups";

import {
  TGroupItem,
  TItem,
} from "@docspace/shared/components/filter/Filter.types";
import {
  AccountLoginType,
  EmployeeStatus,
  EmployeeType,
  FilterGroups,
  FilterKeys,
  PaymentsType,
  SortByFieldName,
} from "@docspace/shared/enums";
import { TFilterSortBy, TSortOrder } from "@docspace/shared/api/people/types";
import { TTranslation } from "@docspace/shared/types";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import { TContactsTab, getContactsUrl } from "SRC_DIR/helpers/contacts";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";

type TFilterValues = (TGroupItem | TItem)[];

const getAccountLoginType = (filterValues: TFilterValues) => {
  const accountLoginType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterLoginType;
    }),
    "key",
  ) as AccountLoginType;

  return accountLoginType ?? null;
};

const getGroupMemberId = (filterValues: TFilterValues, userId: string) => {
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

const getSearchByManager = (filterValues: TFilterValues) => {
  return filterValues.some((v) => v.group === FilterGroups.groupsFilterManager);
};

const getStatus = (filterValues: TFilterValues) => {
  const employeeStatus = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterStatus;
    }),
    "key",
  );

  return employeeStatus ? +employeeStatus : null;
};

const getRole = (filterValues: TFilterValues) => {
  const employeeRole = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.roomFilterType;
    }),
    "key",
  );

  return employeeRole ? +employeeRole : null;
};

const getPayments = (filterValues: TFilterValues) => {
  const payments = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterAccount;
    }),
    "key",
  ) as PaymentsType;

  return payments || null;
};

const getGroup = (filterValues: TFilterValues) => {
  const groupId = result(
    find(filterValues, (value) => {
      return (
        value.group === FilterGroups.filterGroup &&
        value.key !== FilterKeys.withoutGroup
      );
    }),
    "key",
  ) as string;

  return groupId || null;
};

const getWithoutGroup = (filterValues: TFilterValues) => {
  return filterValues.some((value) => value.key === FilterKeys.withoutGroup);
};

const getQuotaFilter = (filterValues: TFilterValues) => {
  const filterType = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterQuota;
    }),
    "key",
  );

  return filterType?.toString() ? +filterType : null;
};

const getInviterId = (filterValues: TFilterValues) => {
  const inviterId = result(
    find(filterValues, (value) => {
      return value.group === FilterGroups.filterInviter;
    }),
    "key",
  ) as string;

  return inviterId ?? null;
};

type UseContactsFilterProps = {
  contactsTab: TContactsTab;

  usersFilter: UsersFilter;
  setUsersFilter: UsersStore["setFilter"];

  groupsFilter: GroupsFilter;
  setGroupsFilter: GroupsStore["setGroupsFilter"];

  userId: string;

  t: TTranslation;

  isRoomAdmin: boolean;
  standalone: boolean;
  showStorageInfo: boolean;
  isDefaultRoomsQuotaSet: boolean;
};

export const useContactsFilter = ({
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
}: UseContactsFilterProps) => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const isPeople = contactsTab === "people";
  const isGuests = contactsTab === "guests";
  const isGroups = contactsTab === "groups";

  const onContactsFilter = React.useCallback(
    (data: (TItem | TGroupItem)[]) => {
      if (!isGroups) {
        const status = getStatus(data);
        const role = getRole(data);
        const payments = getPayments(data);
        const accountLoginType = getAccountLoginType(data);
        const group = getGroup(data);
        const withoutGroup = getWithoutGroup(data);
        const quota = getQuotaFilter(data) || null;
        const inviterId = getInviterId(data);

        const newFilter = usersFilter.clone();

        if (isGuests) {
          newFilter.area = "guests";
        } else {
          newFilter.area = "people";
        }

        newFilter.group = groupId || null;

        newFilter.quotaFilter = quota;

        newFilter.page = 0;

        newFilter.employeeStatus = status;

        newFilter.role = role;
        newFilter.payments = payments;
        newFilter.accountLoginType = accountLoginType;
        newFilter.withoutGroup = withoutGroup;
        newFilter.group = group;
        newFilter.inviterId = inviterId === FilterKeys.me ? userId : inviterId;

        const url = getContactsUrl(contactsTab, group ?? undefined);

        navigate(`${url}?${newFilter.toUrlParams()}`);
      } else if (isGroups) {
        const newFilter = groupsFilter.clone();

        const memberId = getGroupMemberId(data, userId);
        const searchByManager = getSearchByManager(data);

        newFilter.page = 0;
        newFilter.userId = memberId;

        if (memberId) {
          newFilter.searchByManager = searchByManager;
        }

        const url = getContactsUrl(contactsTab);

        navigate(`${url}?${newFilter.toUrlParams()}`);
      }
    },
    [
      isGroups,
      usersFilter,
      isGuests,
      groupId,
      contactsTab,
      navigate,
      groupsFilter,
      userId,
    ],
  );

  const onContactsSearch = React.useCallback(
    (searchValue: string) => {
      const newFilter = isGroups ? groupsFilter.clone() : usersFilter.clone();

      const url = getContactsUrl(contactsTab, usersFilter.group ?? undefined);

      newFilter.page = 0;
      newFilter.search = searchValue;

      navigate(`${url}?${newFilter.toUrlParams()}`);
    },
    [contactsTab, usersFilter, groupsFilter, isGroups, navigate],
  );

  const onContactsSort = React.useCallback(
    (sortBy: TFilterSortBy, sortOrder: TSortOrder) => {
      const newFilter = isGroups ? groupsFilter.clone() : usersFilter.clone();

      newFilter.page = 0;
      newFilter.sortBy = sortBy;
      newFilter.sortOrder = sortOrder;

      if (isGroups) {
        setGroupsFilter(newFilter as GroupsFilter);
      } else {
        setUsersFilter(newFilter as UsersFilter);
      }

      const url = getContactsUrl(contactsTab, usersFilter.group ?? undefined);

      navigate(`${url}?${newFilter.toUrlParams()}`);
    },
    [
      isGroups,
      groupsFilter,
      usersFilter,
      contactsTab,
      navigate,
      setGroupsFilter,
      setUsersFilter,
    ],
  );

  const getContactsSelectedInputValue = React.useCallback(() => {
    if (isGroups) return groupsFilter.search ?? "";

    return usersFilter.search ?? "";
  }, [groupsFilter.search, usersFilter.search, isGroups]);

  const getContactsSelectedSortData = React.useCallback(() => {
    if (isGroups)
      return { sortOrder: groupsFilter.sortOrder, sortBy: groupsFilter.sortBy };

    return { sortOrder: usersFilter.sortOrder, sortBy: usersFilter.sortBy };
  }, [
    groupsFilter.sortBy,
    groupsFilter.sortOrder,
    isGroups,
    usersFilter.sortBy,
    usersFilter.sortOrder,
  ]);

  const getContactsSelectedFilterData = React.useCallback(async () => {
    const filterValues: TFilterValues = [];

    if (!isGroups) {
      if (usersFilter.employeeStatus) {
        let label = "";
        const key = usersFilter.employeeStatus;

        switch (key) {
          case EmployeeStatus.Active:
            label = t("Common:Active");
            break;
          case EmployeeStatus.Pending:
            label = t("PeopleTranslations:PendingInviteTitle");
            break;
          case EmployeeStatus.Disabled:
            label = t("PeopleTranslations:DisabledEmployeeStatus");
            break;
          default:
            break;
        }

        filterValues.push({
          key,
          label,
          group: FilterGroups.filterStatus,
        });
      }

      if (usersFilter.role) {
        const label = getUserTypeTranslation(+usersFilter.role, t);

        filterValues.push({
          key: +usersFilter.role,
          label,
          group: FilterGroups.roomFilterType,
        });
      }

      if (usersFilter.quotaFilter) {
        const key = usersFilter.quotaFilter.toString();

        const label =
          key === FilterKeys.customQuota
            ? t("Common:CustomQuota")
            : t("Common:DefaultQuota");

        filterValues.push({
          key,
          label,
          group: FilterGroups.filterQuota,
        });
      }

      if (usersFilter?.payments?.toString()) {
        filterValues.push({
          key: usersFilter.payments?.toString(),
          label:
            PaymentsType.Paid === usersFilter.payments?.toString()
              ? t("Common:Paid")
              : t("Common:Free"),
          group: FilterGroups.filterAccount,
        });
      }

      if (usersFilter?.accountLoginType?.toString()) {
        const label =
          AccountLoginType.SSO === usersFilter.accountLoginType.toString()
            ? t("Common:SSO")
            : AccountLoginType.LDAP === usersFilter.accountLoginType.toString()
              ? t("Common:LDAP")
              : t("PeopleTranslations:StandardLogin");
        filterValues.push({
          key: usersFilter.accountLoginType.toString(),
          label,
          group: FilterGroups.filterLoginType,
        });
      }

      if (isPeople && usersFilter.group) {
        const group = await getGroupById(usersFilter.group);

        if (group) {
          filterValues.push({
            key: group.id,
            group: FilterGroups.filterGroup,
            label: group.name,
          });
        }
      }

      if (isPeople && usersFilter.withoutGroup) {
        filterValues.push({
          key: FilterKeys.withoutGroup,
          label: t("PeopleTranslations:WithoutGroup"),
          group: FilterGroups.filterGroup,
        });
      }

      if (isGuests && usersFilter.inviterId) {
        const user = await getUserById(usersFilter.inviterId);

        if (user) {
          if (user.id === userId) {
            filterValues.push({
              key: FilterKeys.me,
              group: FilterGroups.filterInviter,
              label: t("Common:MeLabel"),
            });
          } else {
            filterValues.push({
              key: user.id,
              group: FilterGroups.filterInviter,
              label: user.displayName,
            });
          }
        }
      }
    } else {
      if (groupsFilter.userId) {
        const memberId = groupsFilter.userId;
        const member = await getUserById(memberId);
        const isMe = userId === groupsFilter.userId;

        const label = isMe ? t("Common:MeLabel") : member.displayName;

        const memberFilterValue = {
          key: isMe ? FilterKeys.me : groupsFilter.userId,
          group: FilterGroups.groupsFilterMember,
          label,
          selectedLabel: "",
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

    return filterValues;
  }, [
    groupsFilter.searchByManager,
    groupsFilter.userId,
    isGroups,
    isGuests,
    isPeople,
    t,
    userId,
    usersFilter.accountLoginType,
    usersFilter.employeeStatus,
    usersFilter.group,
    usersFilter.inviterId,
    usersFilter.payments,
    usersFilter.quotaFilter,
    usersFilter.role,
    usersFilter.withoutGroup,
  ]);

  const getContactsFilterData = React.useCallback(
    (quotaFilter: TFilterValues) => {
      if (!isGroups) {
        const groupItems = [
          {
            key: FilterGroups.filterGroup,
            group: FilterGroups.filterGroup,
            label: t("Common:Group"),
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
            key: EmployeeStatus.Active,
            group: "filter-status",
            label: t("Common:Active"),
          },
          {
            id: "filter_status-pending",
            key: EmployeeStatus.Pending,
            group: "filter-status",
            label: t("PeopleTranslations:PendingInviteTitle"),
          },
        ];

        if (!isRoomAdmin)
          statusItems.push({
            id: "filter_status-disabled",
            key: EmployeeStatus.Disabled,
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
            label: getUserTypeTranslation(EmployeeType.Admin, t),
          },
          {
            id: "filter_type-room-admin",
            key: EmployeeType.RoomAdmin,
            group: "filter-type",
            label: getUserTypeTranslation(EmployeeType.RoomAdmin, t),
          },
          {
            id: "filter_type-room-admin",
            key: EmployeeType.User,
            group: "filter-type",
            label: getUserTypeTranslation(EmployeeType.User, t),
          },
        ];

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
            label: t("Common:SSO"),
          },
          {
            key: AccountLoginType.LDAP,
            group: "filter-login-type",
            label: t("Common:LDAP"),
          },
          {
            key: AccountLoginType.STANDART,
            group: "filter-login-type",
            label: t("PeopleTranslations:StandardLogin"),
          },
        ];

        const inviterItems = [
          {
            key: FilterGroups.filterInviter,
            group: FilterGroups.filterInviter,
            label: t("Common:Inviter"),
            isHeader: true,
          },
          {
            id: "filter_group-without-group",
            key: FilterKeys.me,
            group: FilterGroups.filterInviter,
            label: t("Common:MeLabel"),
          },
          {
            id: "filter_group-other",
            key: FilterKeys.other,
            group: FilterGroups.filterInviter,
            label: t("Common:OtherLabel"),
          },
          {
            id: "filter_group-selected-group",
            key: "selected_inviter",
            group: FilterGroups.filterInviter,
            displaySelectorType: "link",
          },
        ];
        const filterOptions = [];

        if (isGuests && !isRoomAdmin) filterOptions.push(...inviterItems);
        if (isPeople) filterOptions.push(...groupItems);
        filterOptions.push(...statusItems);
        if (!isGuests) filterOptions.push(...typeItems);
        if (!standalone && !isGuests) filterOptions.push(...accountItems);
        filterOptions.push(...accountLoginTypeItems);
        if (showStorageInfo && isDefaultRoomsQuotaSet && !isGuests)
          filterOptions.push(...quotaFilter);

        return filterOptions;
      }

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
    },
    [
      isDefaultRoomsQuotaSet,
      isGroups,
      isGuests,
      isPeople,
      isRoomAdmin,
      showStorageInfo,
      standalone,
      t,
    ],
  );

  const getContactsSortData = React.useCallback(() => {
    if (!isGroups) {
      const options = [];

      const firstName = {
        id: "sort-by_displayname",
        key: "displayname",
        label: t("Common:Name"),
        default: true,
      };

      const type = {
        id: "sort-by_type",
        key: "type",
        label: t("Common:Type"),
        default: true,
      };

      const department = {
        id: "sort-by_department",
        key: "department",
        label: t("Common:Group"),
        default: true,
      };

      const email = {
        id: "sort-by_email",
        key: "email",
        label: t("Common:Email"),
        default: true,
      };

      const storage = {
        id: "sort-quota",
        key: SortByFieldName.UsedSpace,
        label: t("Common:Storage"),
        default: true,
      };

      const inviter = {
        id: "inviter",
        key: "createdby",
        label: t("Common:Inviter"),
        default: true,
      };

      const registrationDate = {
        id: "registration_date",
        key: "registrationDate",
        label: t("PeopleTranslations:RegistrationDate"),
        default: true,
      };

      if (isGuests) {
        options.push(firstName, email);

        if (!isRoomAdmin) options.push(inviter);

        options.push(registrationDate);
      } else {
        options.push(firstName, type, department, email);
        if (showStorageInfo) options.push(storage);
      }

      return options;
    }

    const groupsOptions = [];

    const title = {
      id: "sort-by_title",
      key: "title",
      label: t("Common:Title"),
      default: true,
    };

    const people = {
      id: "sort-by_people",
      key: "membersCount",
      label: t("Common:Members"),
      default: true,
    };

    const manager = {
      id: "sort-by_manager",
      key: "manager",
      label: t("Common:HeadOfGroup"),
      default: true,
    };

    groupsOptions.push(title, people, manager);

    return groupsOptions;
  }, [isGroups, isGuests, isRoomAdmin, showStorageInfo, t]);

  const removeContactsSelectedItem = React.useCallback(
    (group: FilterGroups) => {
      if (!isGroups) {
        const newFilter = usersFilter.clone();

        newFilter.page = 0;

        if (group === FilterGroups.filterStatus) {
          newFilter.employeeStatus = null;
          newFilter.activationStatus = null;
        }

        if (group === FilterGroups.roomFilterType) {
          newFilter.role = null;
        }

        if (group === FilterGroups.filterOther) {
          newFilter.group = null;
        }

        if (group === FilterGroups.filterAccount) {
          newFilter.payments = null;
        }

        if (group === FilterGroups.filterLoginType) {
          newFilter.accountLoginType = null;
        }
        if (group === FilterGroups.filterQuota) {
          newFilter.quotaFilter = null;
        }
        if (group === FilterGroups.filterGroup && isPeople) {
          newFilter.withoutGroup = false;
          newFilter.group = null;
        }

        if (group === FilterGroups.filterInviter) {
          newFilter.inviterId = null;
        }

        const url = getContactsUrl(contactsTab, newFilter.group ?? undefined);

        navigate(`${url}?${newFilter.toUrlParams()}`);
      } else {
        const newFilter = groupsFilter.clone();
        newFilter.page = 0;

        if (group === FilterGroups.groupsFilterManager) {
          newFilter.searchByManager = false;
        }

        if (group === FilterGroups.groupsFilterMember) {
          newFilter.userId = null;
          newFilter.searchByManager = false;
        }

        const url = getContactsUrl(contactsTab);

        navigate(`${url}?${newFilter.toUrlParams()}`);
      }
    },
    [contactsTab, groupsFilter, isGroups, isPeople, navigate, usersFilter],
  );

  const clearAllContacts = React.useCallback(() => {
    const newFilter = isGroups
      ? GroupsFilter.getDefault()
      : UsersFilter.getDefault();

    const url = getContactsUrl(contactsTab, groupId);

    navigate(`${url}?${newFilter.toUrlParams()}`);
  }, [contactsTab, groupId, isGroups, navigate]);

  return {
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
  };
};
