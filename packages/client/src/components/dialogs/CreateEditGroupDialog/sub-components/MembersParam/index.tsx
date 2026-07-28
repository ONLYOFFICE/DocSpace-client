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

import { useTranslation } from "react-i18next";

import { AddButton } from "@docspace/ui-kit/components/add-button";
import { TUser } from "@docspace/shared/api/people/types";
import PlusSvgUrl from "PUBLIC_DIR/images/icons/16/button.plus.react.svg?url";

import styles from "../../CreateEditGroupDialog.module.scss";
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
      <div className={styles.membersHeader}>
        {t("Common:Members")}
      </div>

      <div className={styles.addMembersButton} onClick={onShowSelectMembersPanel}>
        <AddButton
          iconName={PlusSvgUrl}
          label={t("PeopleTranslations:AddMembers")}
          testId="select_members"
        />
      </div>

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
