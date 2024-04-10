// (c) Copyright Ascensio System SIA 2009-2024
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
import { ShareAccessRights } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { TUser } from "@docspace/shared/api/people/types";
import { TSelectorItem } from "@docspace/shared/components/selector";
import AddUsersPanel from "../../../../panels/AddUsersPanel";
import { getAccessOptions } from "../../../../panels/InvitePanel/utils";

interface SelectGroupMembersPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onParentPanelClose: () => void;

  groupMembers: TUser[];
  setGroupMembers: (groupMembers: (TUser | TSelectorItem)[]) => void;
}

const SelectGroupMembersPanel = ({
  isVisible,
  onClose,
  onParentPanelClose,

  groupMembers,
  setGroupMembers,
}: SelectGroupMembersPanelProps) => {
  const { t } = useTranslation(["InviteDialog"]);
  const accessOptions = getAccessOptions(t, 5, false, true);

  const onAddGroupMembers = (newGroupMembers: TSelectorItem[]) => {
    const resultGroupMembers: (TUser | TSelectorItem)[] = [...groupMembers];
    let showErrorWasSelected = false;

    newGroupMembers.forEach((groupMember) => {
      if (groupMembers.findIndex((gm) => gm.id === groupMember.id) !== -1) {
        showErrorWasSelected = true;
        return;
      }
      resultGroupMembers.push(groupMember);
    });

    if (showErrorWasSelected) {
      toastr.warning("Some users have already been added");
    }

    setGroupMembers(resultGroupMembers);
  };

  const invitedUsers = React.useMemo(
    () => groupMembers.map((g) => g.id),
    [groupMembers],
  );

  return (
    <Portal
      element={
        <AddUsersPanel
          visible={isVisible}
          onClose={onClose}
          onParentPanelClose={onParentPanelClose}
          isMultiSelect
          setDataItems={onAddGroupMembers}
          accessOptions={accessOptions}
          withAccessRights={false}
          isEncrypted
          defaultAccess={ShareAccessRights.FullAccess}
          withoutBackground
          withBlur={false}
          invitedUsers={invitedUsers}
          disableDisabledUsers
        />
      }
    />
  );
};

export default SelectGroupMembersPanel;
