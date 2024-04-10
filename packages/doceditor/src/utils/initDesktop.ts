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

import { IInitialConfig } from "@/types";
import {
  setEncryptionKeys,
  getEncryptionAccess,
} from "@docspace/shared/api/files";
import { TUser } from "@docspace/shared/api/people/types";
import { toastr } from "@docspace/shared/components/toast";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { regDesktop } from "@docspace/shared/utils/desktop";

const initDesktop = (
  cfg: IInitialConfig,
  user: TUser,
  fileId: string | number,
  t: Nullable<TTranslation>,
) => {
  const encryptionKeys = cfg?.editorConfig?.encryptionKeys;
  regDesktop(
    user,
    !!encryptionKeys,
    encryptionKeys,
    (keys) => {
      setEncryptionKeys(keys);
    },
    true,
    (callback) => {
      getEncryptionAccess?.(fileId)
        ?.then((keys) => {
          var data = {
            keys,
          };

          callback?.(data);
        })
        .catch((error) => {
          toastr.error(
            typeof error === "string" ? error : error.message,
            "",
            0,
            true,
          );
        });
    },
    t,
  );
};

export default initDesktop;

