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

"use client";

import React from "react";

import { ThemeProvider as ComponentThemeProvider } from "@docspace/shared/components/theme-provider";
import { TUser } from "@docspace/shared/api/people/types";
import type {
  TGetColorTheme,
  TSettings,
} from "@docspace/shared/api/settings/types";
import type { ThemeKeys } from "@docspace/shared/enums";

import useTheme from "@/hooks/useTheme";
import useI18N from "@/hooks/useI18N";

type TThemeProvider = {
  children: React.ReactNode;
  settings: TSettings | undefined;
  user: TUser | undefined;
  systemTheme: ThemeKeys | undefined;
  colorTheme: TGetColorTheme | undefined;
};

const ThemeProvider = ({
  children,
  user,
  settings,
  systemTheme,
  colorTheme,
}: TThemeProvider) => {
  const { i18n } = useI18N({ settings, user });

  const lang = user?.cultureName ?? settings?.culture;

  const { theme, currentColorTheme } = useTheme({
    user,
    i18n,
    systemTheme,
    colorTheme,
    lang,
  });

  return (
    <ComponentThemeProvider
      theme={theme}
      currentColorScheme={currentColorTheme}
    >
      {children}
    </ComponentThemeProvider>
  );
};

export default ThemeProvider;
