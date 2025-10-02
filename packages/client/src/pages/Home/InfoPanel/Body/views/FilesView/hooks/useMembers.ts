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
import { useTranslation } from "react-i18next";

import type { RoomMember } from "@docspace/shared/api/rooms/types";
import {
  EmployeeActivationStatus,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import api from "@docspace/shared/api";
import { Nullable } from "@docspace/shared/types";
import { TOption } from "@docspace/shared/components/combobox";

import type {
  TInfoPanelMember,
  TInfoPanelMembers,
  TMemberTuple,
  TTitleMember,
  UseMembersProps,
} from "../../Members/Members.types";
import { TInfoPanelMemberType } from "../../Members/Members.types";

const PAGE_COUNT = 100;

export const useMembers = ({
  room,
  setExternalLinks,
  scrollToTop,
  isMembersPanelUpdating,
  setIsMembersPanelUpdating,
}: UseMembersProps) => {
  const { t } = useTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "People",
    "PeopleTranslations",
    "Settings",
    "CreateEditRoomDialog",
  ]);
  const [searchValue, setSearchValue] = React.useState("");
  const [filter, setFilter] = React.useState({
    page: 0,
    startIndex: 0,
  });
  const [total, setTotal] = React.useState(0);

  const [members, setMembers] =
    React.useState<Nullable<TInfoPanelMembers>>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isFirstLoading, setIsFirstLoading] = React.useState(false);

  const abortController = React.useRef<AbortController>(null);

  const addMembersTitle = React.useCallback(
    (
      administrators: TMemberTuple,
      users: TMemberTuple,
      expectedMembers: TMemberTuple,
      groups: TMemberTuple,
      guests: TMemberTuple,
    ) => {
      const membersList: {
        key: TInfoPanelMemberType;
        label: string;
        list: TMemberTuple;
        extra?: Partial<TTitleMember>;
      }[] = [
        {
          key: TInfoPanelMemberType.administrators,
          label: t("InfoPanel:Administration"),
          list: administrators,
        },
        {
          key: TInfoPanelMemberType.groups,
          label: t("Common:Groups"),
          list: groups,
        },
        {
          key: TInfoPanelMemberType.users,
          label: t("InfoPanel:Users"),
          list: users,
        },
        {
          key: TInfoPanelMemberType.guests,
          label: t("Common:Guests"),
          list: guests,
        },
        {
          key: TInfoPanelMemberType.guests,
          label: t("InfoPanel:ExpectUsers"),
          list: expectedMembers,
          extra: { isExpect: true },
        },
      ];

      membersList.forEach(({ key, label, list, extra }) => {
        if (!list.length) return;

        const titleMember: TTitleMember = {
          id: key,
          displayName: label,
          isTitle: true,
          ...(extra || {}),
        };
        list.unshift(titleMember);
      });
    },
    [t],
  );

  const convertMembers = React.useCallback(
    (membersList: RoomMember[], clearFilter: boolean): TInfoPanelMembers => {
      const users: TInfoPanelMember[] = [];
      const administrators: TInfoPanelMember[] = [];
      const expected: TInfoPanelMember[] = [];
      const groups: TInfoPanelMember[] = [];
      const guests: TInfoPanelMember[] = [];

      membersList?.forEach(({ access, canEditAccess, sharedTo }) => {
        const member: TInfoPanelMember = {
          access,
          canEditAccess,
          ...sharedTo,
        };

        if (
          "activationStatus" in member &&
          member.activationStatus === EmployeeActivationStatus.Pending
        ) {
          member.isExpect = true;
          expected.push(member);
        } else if (
          access === ShareAccessRights.FullAccess ||
          access === ShareAccessRights.RoomManager
        ) {
          administrators.push(member);
        } else if ("isGroup" in member && member.isGroup) {
          groups.push(member);
        } else if ("isVisitor" in member && member.isVisitor) {
          guests.push(member);
        } else {
          users.push(member);
        }
      });

      if (clearFilter && !searchValue) {
        addMembersTitle(administrators, users, expected, groups, guests);
      }

      return {
        administrators,
        users,
        expected,
        groups,
        guests,
      };
    },
    [searchValue, addMembersTitle],
  );

  const fetchMembers = React.useCallback(async () => {
    if (!room) return;
    setIsFirstLoading(true);

    abortController.current = new AbortController();

    const roomId = room.id;
    const roomType = room.roomType;
    const isTemplate = room.isTemplate;
    const security = room.security;

    const isPublicRoomType =
      roomType === RoomsType.PublicRoom ||
      roomType === RoomsType.CustomRoom ||
      roomType === RoomsType.FormRoom;

    const requests = [
      api.rooms
        .getRoomMembers(
          roomId,
          {
            filterType: 0,
            startIndex: 0,
            count: PAGE_COUNT,
            filterValue: searchValue,
          },
          abortController.current?.signal,
        )
        .then((res) => {
          setTotal(res.total);
          return res.items;
        }),
    ];

    // abortController.current = null;

    if (
      isPublicRoomType &&
      security.EditAccess &&
      !searchValue &&
      !isTemplate &&
      roomId
    ) {
      requests.push(
        api.rooms
          .getRoomMembers(
            roomId,
            {
              filterType: 2,
            },
            abortController.current?.signal,
          )
          .then((res) => {
            return res.items;
          }),
      );
    }

    const [data, links] = await Promise.all(requests);

    if (links) setExternalLinks(links);
    else setExternalLinks([]);

    const convertedMembers = convertMembers(data, true);

    setMembers(convertedMembers);

    setIsFirstLoading(false);
  }, [room?.id, room?.roomType, room?.isTemplate, room?.security, searchValue]);

  const fetchMoreMembers = async () => {
    setIsLoading(true);
    const newStartIndex = filter.startIndex + PAGE_COUNT;
    const newPage = filter.page + 1;

    setFilter({
      startIndex: newStartIndex,
      page: newPage,
    });

    const data = await api.rooms.getRoomMembers(room.id, {
      filterType: 0,
      startIndex: newStartIndex,
      count: PAGE_COUNT,
      filterValue: searchValue,
    });

    setTotal(data.total);

    const convertedMembers = convertMembers(data.items, false);

    abortController.current = null;

    setMembers((value) => {
      if (!value) return convertedMembers;

      const mergedMembers = {
        administrators: [
          ...value.administrators,
          ...convertedMembers.administrators,
        ],
        users: [...value.users, ...convertedMembers.users],
        expected: [...value.expected, ...convertedMembers.expected],
        groups: [...value.groups, ...convertedMembers.groups],
        guests: [...value.guests, ...convertedMembers.guests],
      };

      return mergedMembers;
    });
    setIsLoading(false);
  };

  React.useEffect(() => {
    fetchMembers();
    scrollToTop();

    setIsMembersPanelUpdating(false);
  }, [fetchMembers, setIsMembersPanelUpdating, scrollToTop, searchValue]);

  React.useEffect(() => {
    if (isMembersPanelUpdating) {
      fetchMembers();
      scrollToTop();
    }
    setIsMembersPanelUpdating(false);
  }, [
    isMembersPanelUpdating,
    fetchMembers,
    setIsMembersPanelUpdating,
    scrollToTop,
  ]);

  const changeUserRole = async (
    option: TOption,
    userId: string,
    currentUserId: string,
    hasNextPage: boolean,
  ) => {
    if (option.key === "remove") {
      if (!members) return;
      const newMembers = {
        users: members.users.filter((m) => m.id !== userId),
        administrators: members.administrators.filter((m) => m.id !== userId),
        expected: members.expected.filter((m) => m.id !== userId),
        groups: members.groups.filter((m) => m.id !== userId),
        guests: members.guests.filter((m) => m.id !== userId),
      };

      const minItemsCount = searchValue ? 0 : 1;
      const newUsers =
        newMembers.users.length > minItemsCount ? newMembers?.users : [];
      const newAdministrators =
        newMembers?.administrators?.length > minItemsCount
          ? newMembers?.administrators
          : [];
      const newExpected =
        newMembers?.expected?.length > minItemsCount
          ? newMembers?.expected
          : [];
      const newGroups =
        newMembers?.groups?.length > minItemsCount ? newMembers?.groups : [];

      const newGuests =
        newMembers.guests?.length > minItemsCount ? newMembers?.guests : [];

      setMembers({
        users: newUsers,
        administrators: newAdministrators,
        expected: newExpected,
        groups: newGroups,
        guests: newGuests,
      });

      setTotal((value) => value - 1);

      if (hasNextPage) {
        const newStartIndex = filter.startIndex + PAGE_COUNT - 1;
        const newPageCount = 1;

        const data = await api.rooms.getRoomMembers(room.id, {
          filterType: 0,
          startIndex: newStartIndex,
          count: newPageCount,
          filterValue: searchValue,
        });

        setTotal(data.total);

        const convertedMembers = convertMembers(data.items, false);

        setMembers((value) => {
          if (!value) return convertedMembers;

          const mergedMembers = {
            administrators: [
              ...value.administrators,
              ...convertedMembers.administrators,
            ],
            users: [...value.users, ...convertedMembers.users],
            expected: [...value.expected, ...convertedMembers.expected],
            groups: [...value.groups, ...convertedMembers.groups],
            guests: [...value.guests, ...convertedMembers.guests],
          };

          return mergedMembers;
        });
      }
    } else {
      setMembers((value) => {
        if (!value) return value;
        const newValue = {
          users: value.users?.map((m) =>
            m.id === userId ? { ...m, access: option.access as number } : m,
          ),
          administrators: value.administrators?.map((m) =>
            m.id === userId ? { ...m, access: option.access as number } : m,
          ),
          expected: value.expected?.map((m) =>
            m.id === userId ? { ...m, access: option.access as number } : m,
          ),
          groups: value.groups?.map((m) =>
            m.id === userId ? { ...m, access: option.access as number } : m,
          ),
          guests: value.guests?.map((m) =>
            m.id === userId ? { ...m, access: option.access as number } : m,
          ),
        };
        return newValue;
      });
    }
  };

  return {
    searchValue,
    setSearchValue,
    isLoading,
    isFirstLoading,
    members,
    fetchMembers,
    fetchMoreMembers,
    total,
    changeUserRole,

    abortController,
  };
};
