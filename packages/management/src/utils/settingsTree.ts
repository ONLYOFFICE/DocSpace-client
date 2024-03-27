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

import SpacesSvgUrl from "PUBLIC_DIR/images/spaces.react.svg?url";
import BrandingSvgUrl from "PUBLIC_DIR/images/branding.react.svg?url";
import DataManagementIconUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-data-management.svg?url";
import RestoreIconUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-restore.svg?url";
import PaymentIconUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-payment.svg?url";

export const settingsTree = [
  {
    id: "management-settings_catalog-spaces",
    key: "0",
    icon: SpacesSvgUrl,
    link: "spaces",
    tKey: "Common:Spaces",
    isHeader: true,
  },
  {
    id: "management-settings_catalog-branding",
    key: "1",
    icon: BrandingSvgUrl,
    link: "branding",
    tKey: "Branding",
    isHeader: true,
  },
  {
    id: "management-settings_catalog-backup",
    key: "2",
    icon: DataManagementIconUrl,
    link: "backup",
    tKey: "Backup",
    isHeader: true,
  },
  {
    id: "management-settings_catalog-restore",
    key: "3",
    icon: RestoreIconUrl,
    link: "restore",
    tKey: "RestoreBackup",
    isHeader: true,
  },
  {
    id: "management-settings_catalog-payments",
    key: "4",
    icon: PaymentIconUrl,
    link: "payments",
    tKey: "Common:PaymentsTitle",
    isHeader: true,
  },
];
