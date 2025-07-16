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

import { inject, observer } from "mobx-react";
import { useState, useEffect, useRef } from "react";

import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import api from "@docspace/shared/api";
import AccountsFilter from "@docspace/shared/api/people/filter";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TUser } from "@docspace/shared/api/people/types";
import { Nullable } from "@docspace/shared/types";
import {
  MIN_LOADER_TIMER,
  SHOW_LOADER_TIMER,
} from "@docspace/shared/selectors/utils/constants";

import GroupMember from "./GroupMember";

import { GroupMembersList } from "./GroupMembersList";
import styles from "./Groups.module.scss";
import ItemTitle from "./ItemTitle";
import NoItem from "../../sub-components/NoItem";
import SeveralItems from "../../sub-components/SeveralItems";

type GroupsProps = {
  groupSelection?: TGroup[] | Nullable<TGroup>;
};

const Groups = ({ groupSelection }: GroupsProps) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [groupMembers, setGroupMembers] = useState<TUser[]>([]);
  const [total, setTotal] = useState(0);

  const abortControllerRef = useRef(new AbortController());

  const startLoader = useRef<Date>(null);
  const loaderTimeout = useRef<NodeJS.Timeout>(null);

  const loadNextPage = async (startIndex: number) => {
    if (!groupSelection || Array.isArray(groupSelection)) return;

    const groupId = groupSelection.id;
    const groupManager = groupSelection.manager;
    try {
      abortControllerRef.current = new AbortController();

      const pageCount = 100;
      const filter = AccountsFilter.getDefault();
      filter.group = groupId;
      filter.page = Math.ceil(startIndex / pageCount);
      filter.pageCount = pageCount;

      const res = await api.people.getUserList(
        filter,
        abortControllerRef.current.signal,
      );

      const membersWithoutManager = groupManager
        ? res.items.filter((item) => item.id !== groupManager.id)
        : res.items;

      setTotal(res.total);
      if (startIndex === 0 || !groupMembers) {
        setGroupMembers(membersWithoutManager);
      } else {
        setGroupMembers([...groupMembers, ...membersWithoutManager]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (startIndex === 0) {
        setIsFirstLoad(false);
      }
    }
  };

  const calculateLoader = () => {
    if (isFirstLoad) {
      loaderTimeout.current = setTimeout(() => {
        startLoader.current = new Date();
        setShowLoader(true);
      }, SHOW_LOADER_TIMER);
    } else if (startLoader.current) {
      const currentDate = new Date();

      const ms = Math.abs(
        startLoader.current.getTime() - currentDate.getTime(),
      );

      if (ms >= MIN_LOADER_TIMER) {
        startLoader.current = null;
        return setShowLoader(false);
      }

      setTimeout(() => {
        startLoader.current = null;
        setShowLoader(false);
      }, MIN_LOADER_TIMER - ms);

      loaderTimeout.current = null;
    } else if (loaderTimeout.current) {
      clearTimeout(loaderTimeout.current);
      loaderTimeout.current = null;
    }
  };

  useEffect(() => {
    if (!groupSelection || Array.isArray(groupSelection)) return;

    setIsFirstLoad(true);
  }, [groupSelection]);

  useEffect(() => {
    if (groupSelection) {
      loadNextPage(0);
    }

    return () => {
      abortControllerRef.current.abort();
    };
  }, [groupSelection]);

  useEffect(() => {
    calculateLoader();
  }, [isFirstLoad]);

  useEffect(() => {
    return () => {
      loaderTimeout.current = null;
    };
  }, []);

  if (!groupSelection) return <NoItem isGroups />;

  if (Array.isArray(groupSelection)) {
    return (
      <SeveralItems isGroups isUsers={false} selectedItems={groupSelection} />
    );
  }

  const groupManager = groupSelection.manager;

  const totalWithoutManager = groupManager ? total - 1 : total;

  const getContent = () => {
    if (showLoader) {
      return <InfoPanelViewLoader view="groups" />;
    }

    return isFirstLoad || !groupMembers ? null : (
      <>
        {groupManager ? (
          <GroupMember groupMember={groupManager} isManager />
        ) : null}
        <GroupMembersList
          members={groupMembers}
          hasNextPage={groupMembers.length < totalWithoutManager}
          loadNextPage={loadNextPage}
          total={totalWithoutManager}
        />
      </>
    );
  };

  return (
    <>
      <ItemTitle groupSelection={groupSelection} />
      <div className={styles.groupsContent}>{getContent()}</div>
    </>
  );
};

export default inject(({ peopleStore }: TStore) => {
  const { selection, bufferSelection } = peopleStore.groupsStore!;

  const groupSelection = selection.length
    ? selection.length === 1
      ? selection[0]
      : selection
    : bufferSelection;

  return { groupSelection };
})(observer(Groups));
