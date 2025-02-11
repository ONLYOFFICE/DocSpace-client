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

// import ActionsDocumentReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
// import CheckReactSvgUrl from "PUBLIC_DIR/images/check.react.svg?url";
// import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
// import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
// import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
// import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
// import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";

import { TOption } from "../combobox";
import { globalColors } from "../../themes";

export const data: TOption[] = [
  {
    key: "key1",
    label: "Room administrator",
    description: `Administration of rooms, archiving of rooms, inviting and managing users in rooms.`,
    quota: "free",
    color: globalColors.tickColor,
  },
  {
    key: "key2",
    label: "Full access",
    description: `Edit, upload, create, view, download, delete files and folders.`,
    quota: "paid",
    color: globalColors.favoritesStatus,
  },

  { key: "key3", label: "", isSeparator: true },
  {
    key: "key4",
    label: "Editing",
    description: `Editing, viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key5",
    label: "Review",
    description: `Reviewing, viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key6",
    label: "Comment",
    description: `Commenting on files, viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key7",
    label: "Read only",
    description: `Viewing, downloading files and folders, filling out forms.`,
  },
  {
    key: "key8",
    label: "Deny access",
    description: "",
  },
];
