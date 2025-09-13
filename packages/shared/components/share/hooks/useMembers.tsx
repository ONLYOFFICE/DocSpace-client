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

import isNil from "lodash/isNil";
import uniqBy from "lodash/uniqBy";
import { useTranslation } from "react-i18next";
import type { IndexRange } from "react-virtualized";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useUnmount } from "../../../hooks/useUnmount";
import { ShareAccessRights } from "../../../enums";
import { ShareLinkService } from "../../../services/share-link.service";
import type { TOption } from "../../combobox";
import { TData, toastr } from "../../toast";

import type { TShare, TShareMember, UseMembersProps } from "../Share.types";
import { convertMembers, getShareAccessRightOptions } from "../Share.helpers";
import { ShareEventName, PAGE_COUNT } from "../Share.constants";

import { User } from "../sub-components/User";
import ShareHeader from "../sub-components/ShareHeader";
import { CreateButton } from "../sub-components/CreateButton";

export const useMembers = (props: UseMembersProps) => {
  const { selfId, shareMembersTotal, infoPanelSelection, linksCount } = props;

  const abortController = useRef(new AbortController());

  const { t } = useTranslation("Common");

  const [filter, setFilter] = useState(() => ({
    page: 0,
    startIndex: 0,
  }));

  const [total, setTotal] = useState(() => shareMembersTotal);
  const [members, setMembers] = useState(() => props.members ?? []);

  useEffect(() => {
    setMembers(props.members ?? []);
  }, [props.members]);

  useEffect(() => {
    setTotal(shareMembersTotal);
  }, [shareMembersTotal]);

  useUnmount(() => {
    abortController.current.abort();
  });

  const memoMembers = useMemo(
    () => convertMembers(members ?? [], t),
    [members, t],
  );

  const countMembers = props.members?.length ?? 0;

  const fetchMoreShareMembers = useCallback(async (range: IndexRange) => {
    console.log(range);

    abortController.current.abort();
    abortController.current = new AbortController();

    const newStartIndex = filter.startIndex + PAGE_COUNT;
    const newPage = filter.page + 1;

    setFilter({
      startIndex: newStartIndex,
      page: newPage,
    });

    try {
      const data = await ShareLinkService.getShare(
        infoPanelSelection,
        {
          page: newPage,
          startIndex: newStartIndex,
        },
        abortController.current.signal,
      );
      setTotal(data.length);

      setMembers((prev) =>
        uniqBy([...prev, ...data], (item) => item.sharedTo.id),
      );
    } catch (error) {
      console.error(error);
      toastr.error(error as TData);
    }
  }, []);

  const onAdded = useCallback(() => {
    const event = new CustomEvent(ShareEventName, {
      detail: {
        open: true,
        item: infoPanelSelection,
      },
    });

    window.dispatchEvent(event);
  }, [infoPanelSelection]);

  const onSelectOption = useCallback(
    async (option: TOption, member: TShare) => {
      if (isNil(option.access)) return;

      try {
        const newShareItems = await ShareLinkService.shareItemToUser(
          [{ shareTo: member.id, access: option.access }],
          infoPanelSelection,
        );

        if (option.access === ShareAccessRights.None) {
          setTotal((prev) => prev - 1);
          return setMembers((prev) =>
            prev.filter((item) => item.sharedTo.id !== member.id),
          );
        }

        const newMember = newShareItems.find(
          (item) => item.sharedTo.id === member.id,
        );

        if (newMember) {
          setMembers((prev) =>
            prev.map((item) =>
              item.sharedTo.id === member.id ? newMember : item,
            ),
          );
        }
      } catch (error) {
        console.error(error);
        toastr.error(error as TData);
      }
    },
    [infoPanelSelection],
  );

  const getUsers = useCallback(() => {
    const { users, groups, administrators, expected, guests } = memoMembers;

    const membersList = [
      ...administrators,
      ...groups,
      ...users,
      ...guests,
      ...expected,
    ];

    const [currentMember] = membersList.filter(
      (member): member is TShareMember => member.id === selfId,
    );

    const headersCount = membersList.length - countMembers;

    if (membersList.length === 0) {
      return {
        content: [
          <ShareHeader key="header-users" title={t("Common:ShareForUsers")} />,
          <CreateButton
            key="create-block"
            onClick={onAdded}
            title={t("Common:AddUsersOrGroups")}
          />,
        ],
        headersCount: 2,
      };
    }

    const options = getShareAccessRightOptions(t, infoPanelSelection);

    return {
      content: membersList.map((member, index) => {
        const selectedOption = options.find(
          (option) => "access" in member && option.access === member.access,
        );

        return (
          <User
            user={member}
            key={
              member.id ||
              ("email" in member && member.email) ||
              ("name" in member && member.name) ||
              ""
            }
            options={options}
            currentUser={currentMember}
            selectedOption={selectedOption}
            onSelectOption={(option) => onSelectOption(option, member)}
            index={index + linksCount}
          />
        );
      }),
      headersCount,
    };
  }, [
    memoMembers,
    countMembers,
    t,
    infoPanelSelection,
    selfId,
    onAdded,
    linksCount,
    onSelectOption,
  ]);

  return {
    getUsers,
    total,
    fetchMoreShareMembers,
  };
};
