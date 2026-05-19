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
