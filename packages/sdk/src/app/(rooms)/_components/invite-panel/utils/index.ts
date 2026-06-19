// (c) Copyright Ascensio System SIA 2009-2026
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

import type { TTranslation } from "@docspace/shared/types";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import {
  ShareAccessRights,
  EmployeeType,
  RoomsType,
} from "@docspace/shared/enums";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";
import { checkIfAccessPaid } from "@docspace/shared/utils/filterPaidRoleOptions";
import { getBrandName } from "@docspace/shared/constants/brands";

export type InviteItemBase = {
  access: number;
  isGroup?: boolean;
  isVisitor?: boolean;
  warning?: string;
};

export const getTopFreeRole = (
  t: TTranslation,
  roomType: RoomsType,
): TOption | undefined => {
  const accesses = getAccessOptions(t, roomType);
  const freeAccesses = (accesses as TOption[]).filter(
    (item) =>
      "access" in item &&
      !checkIfAccessPaid((item as { access: number }).access) &&
      item.key !== "s1",
  );
  return freeAccesses[0] as TOption | undefined;
};

export const getViewerRole = (
  t: TTranslation,
  roomType: RoomsType,
): TOption | undefined => {
  const accesses = getAccessOptions(t, roomType);
  return (accesses as TOption[]).find((item) => item.key === "viewer") as
    | TOption
    | undefined;
};

export const isPaidUserRole = (selectedAccess: number): boolean => {
  return (
    selectedAccess === ShareAccessRights.FullAccess ||
    selectedAccess === ShareAccessRights.RoomManager
  );
};

export const getFreeUsersTypeArray = (): number[] => {
  return [EmployeeType.User as unknown as number];
};

export const getFreeUsersRoleArray = (): number[] => {
  return [
    ShareAccessRights.Comment,
    ShareAccessRights.Editing,
    ShareAccessRights.FormFilling,
    ShareAccessRights.ReadOnly,
    ShareAccessRights.Review,
    ShareAccessRights.Collaborator,
  ];
};

export const makeFreeRole = <T extends InviteItemBase>(
  item: T,
  t: TTranslation,
  freeRole: TOption | undefined,
): T => {
  if (!freeRole) return item;

  item.access = (freeRole as { access: number }).access;
  item.warning = item.isGroup
    ? t("Common:GroupMaxAvailableRoleWarning", {
        roleName: (freeRole as { label: string }).label,
      })
    : t("Common:UserMaxAvailableRoleWarning", {
        productName: getBrandName("ProductName"),
      });
  return item;
};

export const makeViewerRole = <T extends InviteItemBase>(
  item: T,
  t: TTranslation,
  viewerRole: TOption | undefined,
): T => {
  if (!viewerRole) return item;

  item.warning =
    item.access === ShareAccessRights.RoomManager
      ? t("Common:UserAgentMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        })
      : t("Common:GuestAgentMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        });
  item.access = (viewerRole as { access: number }).access;

  return item;
};

export const fixAccess = <T extends InviteItemBase>(
  item: T,
  t: TTranslation,
  roomType: RoomsType,
): T => {
  if (item.isVisitor && roomType === RoomsType.AIRoom) {
    const viewerRole = getViewerRole(t, roomType);
    return makeViewerRole(item, t, viewerRole);
  } else {
    const topFreeRole = getTopFreeRole(t, roomType);
    return makeFreeRole(item, t, topFreeRole);
  }
};
