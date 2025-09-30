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

export type ThemeConfig = {
  name: string;
  theme: string;
  locale?: string;
  prefix: string;
};

export const THEMES: ThemeConfig[] = [
  { name: "Base", theme: "Base", prefix: "base" },
  { name: "Dark", theme: "Dark", prefix: "dark" },
  { name: "RTL Base", theme: "Base", locale: "ar-SA", prefix: "rtl-base" },
  { name: "RTL Dark", theme: "Dark", locale: "ar-SA", prefix: "rtl-dark" },
];

export class TestParamsBuilder {
  private params: Record<string, string | boolean | number> = {};

  constructor(private basePath: string) {}

  theme(theme: string): this {
    this.params.theme = theme;
    return this;
  }

  locale(locale: string): this {
    this.params.locale = locale;
    return this;
  }

  param(key: string, value: string | boolean | number): this {
    this.params[key] = value;
    return this;
  }

  build(): string {
    const queryString = Object.entries(this.params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    return `${this.basePath}?${queryString}`;
  }
}

export class TestHelper {
  constructor(
    private basePath: string,
    private screenshotFolder: string,
  ) {}

  createParamsBuilder(): TestParamsBuilder {
    return new TestParamsBuilder(this.basePath);
  }

  buildRoute(
    themeConfig: ThemeConfig,
    additionalParams?: Record<string, string | boolean | number>,
  ): string {
    const builder = this.createParamsBuilder().theme(themeConfig.theme);

    if (themeConfig.locale) {
      builder.locale(themeConfig.locale);
    }

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        builder.param(key, value);
      });
    }

    return builder.build();
  }

  getScreenshotPath(themePrefix: string, testName: string): string[] {
    return [
      "desktop",
      this.screenshotFolder,
      `${this.screenshotFolder}-${themePrefix}-${testName}.png`,
    ];
  }
}
