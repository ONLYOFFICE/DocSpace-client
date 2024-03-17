// (c) Copyright Ascensio System SIA 2010-2024
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

import { TUser } from "@docspace/shared/api/people/types";
import { EditGroupParams, GroupMembers } from "../types";

const compareMembers = (a: GroupMembers, b: GroupMembers): boolean => {
  if (!a && !b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  const sortCb = (first: TUser, second: TUser) =>
    first.id < second.id ? -1 : 1;
  const sortedA = [...a].sort(sortCb);
  const sortedB = [...b].sort(sortCb);

  return !sortedA.some((el, i) => el.id !== sortedB[i].id);
};

const removeManagerFromMembers = (members: GroupMembers, managerId: string) => {
  return members?.filter((g) => g.id !== managerId) || null;
};

export const compareGroupParams = (
  prev: EditGroupParams,
  current: EditGroupParams,
): boolean => {
  const equalTitle = prev.groupName === current.groupName;
  const equalManager = prev.groupManager?.id === current.groupManager?.id;

  const prevGroupMembers = prev.groupManager?.id
    ? removeManagerFromMembers(prev.groupMembers, prev.groupManager.id)
    : prev.groupMembers;
  const currentGroupMembers = current.groupManager?.id
    ? removeManagerFromMembers(current.groupMembers, current.groupManager.id)
    : current.groupMembers;

  const equalMembers = compareMembers(prevGroupMembers, currentGroupMembers);

  return equalTitle && equalManager && equalMembers;
};
