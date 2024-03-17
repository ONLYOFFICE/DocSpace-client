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

"use client";

import React from "react";
import { toast } from "react-toastify";

import { Toast } from "@docspace/shared/components/toast";
import { ThemeProvider } from "@docspace/shared/components/theme-provider";
import { toastr } from "@docspace/shared/components/toast";
import { Error520SSR } from "@docspace/shared/components/errors/Error520";
import { TUser } from "@docspace/shared/api/people/types";
import {
  TFirebaseSettings,
  TSettings,
} from "@docspace/shared/api/settings/types";
import FirebaseHelper from "@docspace/shared/utils/firebase";

import useDeviceType from "@/hooks/useDeviceType";
import useWhiteLabel from "@/hooks/useWhiteLabel";
import useI18N from "@/hooks/useI18N";
import useTheme from "@/hooks/useTheme";

import pkg from "../../package.json";

toast.configure();

type CreateFileErrorProps = {
  error: Error;
  fileInfo: object;
  fromTemplate: boolean;
  fromFile: boolean;
  settings?: TSettings;
  user?: TUser;
};

const CreateFileError = ({
  error,
  fileInfo,
  fromFile,
  fromTemplate,
  settings,
  user,
}: CreateFileErrorProps) => {
  const firebaseHelper = new FirebaseHelper({} as TFirebaseSettings);

  const { i18n } = useI18N({ settings, user });
  const { currentDeviceType } = useDeviceType();
  const { logoUrls } = useWhiteLabel();
  const { theme } = useTheme({ user });

  const t = i18n.t ? i18n.t.bind(i18n) : null;
  const message = error.message ?? error ?? "";

  const showingToast = React.useRef(false);

  React.useEffect(() => {
    if (fromFile && message.includes("password")) {
      const searchParams = new URLSearchParams();
      searchParams.append("createError", JSON.stringify({ fileInfo }));

      window.location.replace(
        `${window.location.origin}?${searchParams.toString()}`,
      );
    } else {
      if (!t || showingToast.current) return;
      showingToast.current = true;
      toastr.error(message, t?.("Common:Warning"));
    }
  }, [fileInfo, fromFile, message, t]);

  if (fromFile && message.includes("password")) return null;

  return (
    <ThemeProvider theme={theme}>
      <Toast />
      <Error520SSR
        i18nProp={i18n}
        errorLog={error}
        user={user ?? ({} as TUser)}
        currentDeviceType={currentDeviceType}
        version={pkg.version}
        firebaseHelper={firebaseHelper}
        whiteLabelLogoUrls={logoUrls}
      />
    </ThemeProvider>
  );
};

export default CreateFileError;
