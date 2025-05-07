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

import CatalogQuestionReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.question.react.svg?url";
import AccessEditReactSvgUrl from "PUBLIC_DIR/images/access.edit.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import AccessReviewReactSvgUrl from "PUBLIC_DIR/images/access.review.react.svg?url";
import AccessCommentReactSvgUrl from "PUBLIC_DIR/images/access.comment.react.svg?url";
import AccessFormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import CustomFilterReactSvgUrl from "PUBLIC_DIR/images/custom.filter.react.svg?url";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { homepage } from "PACKAGE_FILE";
import { EDITOR_PROTOCOL } from "./filesConstants";

export const getAccessIcon = (access) => {
  switch (access) {
    case 1:
      return AccessEditReactSvgUrl;
    case 2:
      return EyeReactSvgUrl;
    case 3:
      return AccessNoneReactSvgUrl;
    case 4:
      return CatalogQuestionReactSvgUrl;
    case 5:
      return AccessReviewReactSvgUrl;
    case 6:
      return AccessCommentReactSvgUrl;
    case 7:
      return AccessFormReactSvgUrl;
    case 8:
      return CustomFilterReactSvgUrl;
    default:
  }
};

export const checkProtocol = (fileId, withRedirect) =>
  new Promise((resolve, reject) => {
    let timeout;

    const onBlur = () => {
      clearTimeout(timeout);
      window.removeEventListener("blur", onBlur);
      resolve();
    };

    timeout = setTimeout(() => {
      reject();
      window.removeEventListener("blur", onBlur);
      withRedirect &&
        window.open(
          combineUrl("", homepage, `private?fileId=${fileId}`),
          "_blank",
        );
    }, 1000);

    window.addEventListener("blur", onBlur);

    window.open(
      combineUrl(
        `${EDITOR_PROTOCOL}:${window.location.origin}`,
        homepage,
        `doceditor?fileId=${fileId}`,
      ),
      "_self",
    );
  });
