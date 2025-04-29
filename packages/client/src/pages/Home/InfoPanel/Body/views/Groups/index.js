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
import { withTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useState, useEffect, useRef } from "react";

import withLoader from "SRC_DIR/HOCs/withLoader";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import api from "@docspace/shared/api";
import AccountsFilter from "@docspace/shared/api/people/filter";
import {
  MIN_LOADER_TIMER,
  SHOW_LOADER_TIMER,
} from "@docspace/shared/selectors/Files/FilesSelector.constants";

import GroupMember from "./GroupMember";
import * as Styled from "../../styles/groups.styled";
import useFetchGroup from "./useFetchGroup";
import { GroupMembersList } from "./GroupMembersList/GroupMembersList";

const Groups = ({
  infoPanelSelection,
  currentGroup,
  setCurrentGroup,
  infoPanelSelectedGroup,
  setInfoPanelSelectedGroup,
}) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [groupMembers, setGroupMembers] = useState(null);
  const [total, setTotal] = useState(0);

  const abortControllerRef = useRef(new AbortController());
  const startLoader = useRef(null);
  const loaderTimeout = useRef(null);

  const { groupId: paramsGroupId } = useParams();
  const isInsideGroup = !!paramsGroupId;

  const group = isInsideGroup ? currentGroup : infoPanelSelectedGroup;

  const groupId = isInsideGroup ? paramsGroupId : infoPanelSelection?.id;
  const setGroup = isInsideGroup ? setCurrentGroup : setInfoPanelSelectedGroup;

  const groupManager = group?.manager;

  const loadNextPage = async (startIndex) => {
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

  useFetchGroup(groupId, group?.id, setGroup);

  useEffect(() => {
    setIsFirstLoad(true);
  }, [infoPanelSelection.id]);

  useEffect(() => {
    if (group) {
      loadNextPage(0);
    }

    return () => {
      abortControllerRef.current.abort();
    };
  }, [group]);

  useEffect(() => {
    calculateLoader();
  }, [isFirstLoad]);

  useEffect(() => {
    return () => {
      loaderTimeout.current = null;
    };
  }, []);

  if (showLoader) {
    return (
      <Styled.GroupsContent>
        <InfoPanelViewLoader view="groups" />
      </Styled.GroupsContent>
    );
  }

  const totalWithoutManager = groupManager ? total - 1 : total;

  return (
    <Styled.GroupsContent>
      {isFirstLoad || !groupMembers ? null : (
        <>
          {groupManager ? (
            <GroupMember groupMember={groupManager} isManager />
          ) : null}
          <GroupMembersList
            members={groupMembers}
            hasNextPage={groupMembers.length < totalWithoutManager}
            loadNextPage={loadNextPage}
            total={totalWithoutManager}
            managerId={groupManager?.id}
          />
        </>
      )}
    </Styled.GroupsContent>
  );
};

export default inject(({ peopleStore, infoPanelStore }) => ({
  currentGroup: peopleStore.groupsStore.currentGroup,
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
  infoPanelSelectedGroup: infoPanelStore.infoPanelSelectedGroup,
  setInfoPanelSelectedGroup: infoPanelStore.setInfoPanelSelectedGroup,
}))(
  withTranslation([])(
    withLoader(observer(Groups))(<InfoPanelViewLoader view="accounts" />),
  ),
);
