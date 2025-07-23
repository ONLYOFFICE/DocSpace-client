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

import { useState } from "react";
import { useNavigate } from "react-router";
import { decode } from "he";
import { inject, observer } from "mobx-react";
import { Link } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Trans, withTranslation } from "react-i18next";
import { TTranslation } from "@docspace/shared/types";
import { TSetSelectedFolder } from "../../../../../../../store/SelectedFolderStore";
import { Feed } from "./HistoryBlockContent.types";

import {
  StyledHistoryBlockExpandLink,
  StyledHistoryLink,
} from "../../../styles/history";

const EXPANSION_THRESHOLD = 8;

interface HistoryGroupListProps {
  t: TTranslation;
  feed: Feed;
  isVisitor?: boolean;
  isCollaborator?: boolean;
  setPeopleSelection?: (newSelection: any[]) => void;
  setPeopleBufferSelection?: (newBufferSelection: any) => void;
  setFilesSelection?: (newSelection: any[]) => void;
  setFilesBufferSelection?: (newBufferSelection: any) => void;
  setSelectedFolder?: (selectedFolder: TSetSelectedFolder | null) => void;
  withWrapping?: boolean;
}

const HistoryGroupList = ({
  t,
  feed,
  isVisitor,
  isCollaborator,
  setPeopleSelection,
  setPeopleBufferSelection,
  setFilesSelection,
  setFilesBufferSelection,
  setSelectedFolder,
  withWrapping,
}: HistoryGroupListProps) => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(
    1 + feed.related.length <= EXPANSION_THRESHOLD,
  );
  const onExpand = () => setIsExpanded(true);

  const groupsData = [
    feed.data,
    ...feed.related.map((relatedFeed: any) => relatedFeed.data),
  ];

  const onGroupClick = (groupId: string) => {
    setSelectedFolder?.(t, null);
    setPeopleSelection?.([]);
    setPeopleBufferSelection?.(null);
    setFilesSelection?.([]);
    setFilesBufferSelection?.(null);
    navigate(`/accounts/groups/${groupId}/filter`);
  };

  return (
    <>
      {groupsData.map(({ group }, i) => {
        if (!isExpanded && i > EXPANSION_THRESHOLD - 1) return null;
        const withComma = !isExpanded
          ? i < EXPANSION_THRESHOLD - 1
          : i < groupsData.length - 1;
        return (
          <StyledHistoryLink
            key={group.id}
            style={
              withWrapping
                ? { display: "inline", wordBreak: "break-all" }
                : null
            }
          >
            {isVisitor || isCollaborator ? (
              <Text as="span" className="text" fontWeight={600}>
                {decode(group.name)}
              </Text>
            ) : (
              <Link
                className="text link"
                onClick={() => onGroupClick(group.id)}
                style={
                  withWrapping ? { display: "inline", textWrap: "wrap" } : null
                }
              >
                {decode(group.name)}
              </Link>
            )}

            {withComma ? "," : null}
            {feed.related.length > 0 ? <div className="space" /> : null}
          </StyledHistoryLink>
        );
      })}

      {!isExpanded ? (
        <StyledHistoryBlockExpandLink
          className="user-list-expand-link"
          onClick={onExpand}
        >
          <Trans
            t={t}
            ns="InfoPanel"
            i18nKey="AndMoreLabel"
            values={{ count: groupsData.length - EXPANSION_THRESHOLD }}
            components={{ 1: <strong /> }}
          />
        </StyledHistoryBlockExpandLink>
      ) : null}
    </>
  );
};

export default inject<TStore>(
  ({ userStore, peopleStore, filesStore, selectedFolderStore }) => {
    return {
      isVisitor: userStore.user.isVisitor,
      isCollaborator: userStore.user.isCollaborator,
      setPeopleSelection: peopleStore.usersStore.setSelection,
      setPeopleBufferSelection: peopleStore.usersStore.setBufferSelection,
      setFilesSelection: filesStore.setSelection,
      setFilesBufferSelection: filesStore.setBufferSelection,
      setSelectedFolder: selectedFolderStore.setSelectedFolder,
    };
  },
)(withTranslation(["InfoPanel"])(observer(HistoryGroupList)));
