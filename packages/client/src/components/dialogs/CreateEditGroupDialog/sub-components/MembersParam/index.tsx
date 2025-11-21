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

import { useTranslation } from "react-i18next";

import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { TUser } from "@docspace/shared/api/people/types";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import * as Styled from "./index.styled";
import GroupMemberRow from "../GroupMemberRow";
import { GroupMembersList } from "../GroupMembersList/GroupMembersList";

type InfiniteLoaderProps =
  | {
      withInfiniteLoader: true;
      loadNextPage: (startIndex: number) => Promise<void>;
      hasNextPage: boolean;
      total: number;
    }
  | Partial<{
      withInfiniteLoader: undefined;
      loadNextPage: undefined;
      hasNextPage: undefined;
      total: undefined;
    }>;

type MembersParamProps = {
  groupManager: TUser | null;
  groupMembers: TUser[] | null;
  onShowSelectMembersPanel: () => void;
  removeMember: (member: TUser) => void;
} & InfiniteLoaderProps;

const MembersParam = ({
  groupManager,
  groupMembers,
  onShowSelectMembersPanel,
  withInfiniteLoader,
  hasNextPage,
  loadNextPage,
  total,
  removeMember,
}: MembersParamProps) => {
  const { t } = useTranslation(["Common", "PeopleTranslations"]);

  return (
    <div>
      <Styled.Header className="membersHeader">
        {t("Common:Members")}
      </Styled.Header>

      <Styled.AddMembersButton onClick={onShowSelectMembersPanel}>
        <SelectorAddButton
          iconName={PlusSvgUrl}
          label={t("PeopleTranslations:AddMembers")}
          testId="select_members"
        />
      </Styled.AddMembersButton>

      {groupMembers ? (
        withInfiniteLoader ? (
          <GroupMembersList
            members={groupMembers}
            removeMember={removeMember}
            hasNextPage={hasNextPage}
            loadNextPage={loadNextPage}
            total={total}
          />
        ) : (
          groupMembers
            .filter((member) => member.id !== groupManager?.id)
            .map((member, index) => (
              <GroupMemberRow
                key={member.id}
                groupMember={member}
                removeMember={removeMember}
                dataTestId={`group_member_row_${index}`}
              />
            ))
        )
      ) : null}
    </div>
  );
};

export default MembersParam;
