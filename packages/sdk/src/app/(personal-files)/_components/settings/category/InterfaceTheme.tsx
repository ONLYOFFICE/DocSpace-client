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

"use client";

import React, { useState, useCallback } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ThemeKeys } from "@docspace/shared/enums";
import { getSystemTheme } from "@docspace/ui-kit/utils/get-system-theme";
import { changeTheme as changeThemeApi } from "@docspace/shared/api/people";

import { ThemeChangeContext } from "@/providers";
import { useDocsUserStore } from "../../../_store/DocsUserStore";

import styles from "./InterfaceTheme.module.scss";

const InterfaceTheme = observer(() => {
  const { t } = useTranslation(["Common", "Profile"]);
  const docsUserStore = useDocsUserStore();
  const user = docsUserStore.user;
  const changeThemeInProvider = React.useContext(ThemeChangeContext);

  const [currentTheme, setCurrentTheme] = useState(
    user?.theme || ThemeKeys.SystemStr,
  );

  const themeChange = useCallback(
    async (newTheme: ThemeKeys) => {
      try {
        setCurrentTheme(newTheme);
        changeThemeInProvider?.(newTheme);
        const { theme } = await changeThemeApi(newTheme);
        if (user) {
          docsUserStore.setUser({ ...user, theme });
        }
      } catch (error) {
        console.error(error);
        toastr.error(error as string);
      }
    },
    [user, docsUserStore, changeThemeInProvider],
  );

  const onChangeTheme = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.MouseEvent<HTMLInputElement>,
    ) => {
      const target = e.currentTarget;
      themeChange(target.value as ThemeKeys);
    },
    [themeChange],
  );

  const onChangeSystemTheme = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.MouseEvent<HTMLInputElement>,
    ) => {
      const isChecked = (e.currentTarget || e.target).checked;

      if (!isChecked) {
        themeChange(ThemeKeys.BaseStr);
      } else {
        themeChange(ThemeKeys.SystemStr);
      }
    },
    [themeChange],
  );

  const isSystemTheme = currentTheme === ThemeKeys.SystemStr;
  const systemThemeValue = getSystemTheme();

  return (
    <div className={styles.interfaceTheme}>
      <div>
        <Checkbox
          className={styles.systemThemeCheckbox}
          value={ThemeKeys.SystemStr}
          label={t("Common:SystemTheme")}
          isChecked={isSystemTheme}
          onChange={onChangeSystemTheme}
        />
        <Text as="div" className={styles.systemThemeDescription}>
          {t("Common:SystemThemeDescription")}
        </Text>
      </div>
      <RadioButtonGroup
        orientation="vertical"
        name="interface-theme"
        options={[
          {
            value: ThemeKeys.BaseStr,
            label: t("LightTheme"),
          },
          {
            value: ThemeKeys.DarkStr,
            label: t("DarkTheme"),
          },
        ]}
        onClick={onChangeTheme}
        selected={
          isSystemTheme ? (systemThemeValue as string) : (currentTheme as string)
        }
        spacing="12px"
        isDisabled={isSystemTheme}
      />
    </div>
  );
});

export default InterfaceTheme;
