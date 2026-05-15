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

export const getGreetingKey = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "GoodMorning";
  if (hour >= 12 && hour < 18) return "GoodAfternoon";
  return "GoodEvening";
};

export const NEW_FILE_NAMES = {
  document: "New document.docx",
  spreadsheet: "New spreadsheet.xlsx",
  presentation: "New presentation.pptx",
  pdf: "New PDF form.pdf",
} as const;

export const makeCreateUrl = (
  fileTitle: string,
  parentId: number | null,
): string => {
  const params = new URLSearchParams({ fileTitle });
  if (parentId) params.set("parentId", String(parentId));
  return `/sdk/personal-files/editor/create?${params.toString()}`;
};

export type AiFormsSettings = {
  roomId: number;
};
