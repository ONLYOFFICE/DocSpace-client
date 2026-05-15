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

import { ShareAccessRights, RoomsType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { getBrandName } from "@docspace/shared/constants/brands";

class MembersHelper {
  t: TTranslation;

  constructor(props: { t: TTranslation }) {
    this.t = props.t;
  }

  getOptions = () => {
    return {
      portalAdmin: {
        key: "owner",
        label: this.t("Common:Owner"),
        access: ShareAccessRights.FullAccess,
        type: "admin",
      },
      roomAdmin: {
        key: "roomAdmin",
        label: this.t("Common:RoomManager"),
        tooltip: this.t("InviteDialog:UserMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        }),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      agentAdmin: {
        key: "agentAdmin",
        label: this.t("Common:AgentManager"),
        tooltip: this.t("InviteDialog:UserAgentMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        }),
        access: ShareAccessRights.RoomManager,
        type: "manager",
      },
      collaborator: {
        key: "collaborator",
        label: this.t("Common:ContentCreator"),
        access: ShareAccessRights.Collaborator,
        tooltip: this.t("InviteDialog:GuestAgentMaxAvailableRoleWarning", {
          productName: getBrandName("ProductName"),
        }),
        type: "collaborator",
      },
      viewer: {
        key: "viewer",
        label: this.t("Common:RoleViewer"),
        access: ShareAccessRights.ReadOnly,
        type: "user",
      },
      editor: {
        key: "editor",
        label: this.t("Common:Editor"),
        access: ShareAccessRights.Editing,
        type: "user",
      },
      formFiller: {
        key: "formFiller",
        label: this.t("Common:RoleFormFiller"),
        access: ShareAccessRights.FormFilling,
        type: "user",
      },
      reviewer: {
        key: "reviewer",
        label: this.t("Common:RoleReviewer"),
        access: ShareAccessRights.Review,
        type: "user",
      },
      commentator: {
        key: "commentator",
        label: this.t("Common:RoleCommentator"),
        access: ShareAccessRights.Comment,
        type: "user",
      },
    };
  };

  getOptionsByRoomType = (roomType: RoomsType, canChangeUserRole = false) => {
    const options = this.getOptions();

    const deleteOption = canChangeUserRole
      ? [
          { key: "s2", isSeparator: true },
          {
            key: "remove",
            label: this.t("Common:Remove"),
            access: ShareAccessRights.None,
          },
        ]
      : [];

    switch (roomType) {
      case RoomsType.EditingRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.viewer,
          ...deleteOption,
        ];

      case RoomsType.CustomRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.reviewer,
          options.commentator,
          options.viewer,
          ...deleteOption,
        ];

      case RoomsType.FormRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.formFiller,
          ...deleteOption,
        ];
      case RoomsType.PublicRoom:
        return [options.roomAdmin, options.collaborator, ...deleteOption];
      case RoomsType.VirtualDataRoom:
        return [
          options.roomAdmin,
          options.collaborator,
          options.editor,
          options.formFiller,
          options.viewer,
          ...deleteOption,
        ];
      case RoomsType.AIRoom:
        return [
          options.agentAdmin,
          options.collaborator,
          options.viewer,
          ...deleteOption,
        ];
      default:
        return [];
    }
  };

  getOptionByUserAccess = (
    access: ShareAccessRights,
    isAIAgentsFolderRoot?: boolean,
  ) => {
    if (!access) return;

    const options = this.getOptions();

    if (isAIAgentsFolderRoot && access === ShareAccessRights.RoomManager)
      return options.agentAdmin;

    const [userOption] = Object.values(options).filter(
      (opt) => opt.access === access,
    );

    return userOption;
  };
}

export default MembersHelper;
