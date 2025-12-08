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

import React, { useEffect } from "react";
import { ThemeProvider as Provider } from "styled-components";

import { InterfaceDirectionProvider } from "../../context/InterfaceDirectionContext";
import { ThemeProvider as CustomThemeProvider } from "../../context/ThemeContext";

import type { ThemeProviderProps } from "./ThemeProvider.types";
import "./ThemeProvider.scss";

export const ThemeProvider = ({
  theme,
  currentColorScheme,
  children,
}: ThemeProviderProps) => {
  useEffect(() => {
    const root = document.documentElement;

    const themeStr = theme.isBase ? "light" : "dark";
    const dir = theme.interfaceDirection;

    root.setAttribute("data-theme", themeStr);
    root.setAttribute("data-dir", dir);
    root.style.setProperty("--interface-direction", dir);

    const body = document.body;
    body.classList.remove("light", "dark");
    body.classList.remove("ltr", "rtl");
    body.classList.add(themeStr);
    body.classList.add(dir);
    body.style.setProperty("--font-family", theme.fontFamily);
  }, [theme.isBase, theme.interfaceDirection, theme.fontFamily]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (currentColorScheme && currentColorScheme.main) {
      root.style.setProperty(
        "--color-scheme-main-accent",
        currentColorScheme.main.accent,
      );
      root.style.setProperty(
        "--color-scheme-text-accent",
        currentColorScheme.text.accent,
      );
      root.style.setProperty(
        "--color-scheme-main-buttons",
        currentColorScheme.main.buttons,
      );
      root.style.setProperty(
        "--color-scheme-text-buttons",
        currentColorScheme.text.buttons,
      );

      body.style.setProperty(
        "--color-scheme-main-accent",
        currentColorScheme.main.accent,
      );
      body.style.setProperty(
        "--color-scheme-text-accent",
        currentColorScheme.text.accent,
      );
      body.style.setProperty(
        "--color-scheme-main-buttons",
        currentColorScheme.main.buttons,
      );
      body.style.setProperty(
        "--color-scheme-text-buttons",
        currentColorScheme.text.buttons,
      );
    }
  }, [currentColorScheme]);

  return (
    <InterfaceDirectionProvider interfaceDirection={theme.interfaceDirection}>
      <CustomThemeProvider
        theme={theme.isBase ? "Base" : "Dark"}
        currentColorScheme={currentColorScheme}
      >
        <Provider theme={{ ...theme, currentColorScheme }}>{children}</Provider>
      </CustomThemeProvider>
    </InterfaceDirectionProvider>
  );
};
