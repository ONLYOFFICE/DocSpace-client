/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
} from "@docspace/ui-kit/selectors/utils/constants";

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
