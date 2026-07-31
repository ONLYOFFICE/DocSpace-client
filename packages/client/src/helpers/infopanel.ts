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

export const getPropertyClassName = (propertyId: string) => {
  switch (propertyId) {
    case "Owner":
      return "info_details_owner";
    case "Location":
      return "info_details_location";
    case "Type":
      return "info_details_type";
    case "Storage Type":
      return "info_details_storage-type";
    case "File extension":
      return "info_details_file-extension";
    case "Content":
      return "info_details_content";
    case "Size":
      return "info_details_size";
    case "Date modified":
      return "info_details_date_modified";
    case "Last modified by":
      return "info_details_last-modified-by";
    case "Creation date":
      return "info_details_creation-date";
    case "Versions":
      return "info_details_versions";
    case "Comments":
      return "info_details_comments";
    case "Tags":
      return "info_details_tags";
    case "Lifetime ends":
      return "info_details_lifetime";
    case "Storage":
      return "info_details_storage";
    default:
      break;
  }
};
