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

import { LANGUAGE } from "@docspace/shared/constants";

import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { classNames } from "@docspace/shared/utils";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";

import PluginIncompatibleSvg from "PUBLIC_DIR/images/plugin.incompatible.react.svg";
import { PluginStatus } from "SRC_DIR/helpers/plugins/enums";
import { InfoProps } from "../SettingsPluginDialog.types";
import styles from "../SettingsPluginDialog.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const Info = ({ t, plugin, withDelete, withSeparator }: InfoProps) => {
  const locale = getCookie(LANGUAGE) || "en";
  const uploadDate = plugin.createOn && getCorrectDate(locale, plugin.createOn);

  const pluginStatus =
    plugin.status === PluginStatus.active
      ? t("NotNeedSettings")
      : t("NeedSettings");

  const incompatibleTooltip = t("WebPlugins:PluginIsNotCompatible", {
    productName: getBrandName("ProductName"),
  });

  return (
    <div
      className={classNames(styles.container, {
        [styles.withDelete]: withDelete,
      })}
    >
      {withSeparator ? <div className={styles.separator} /> : null}
      <Text fontSize="14px" fontWeight={600} lineHeight="16px">
        {t("Metadata")}
      </Text>
      <div className={styles.info}>
        {plugin.author ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Files:ByAuthor")}
            </Text>
            <Text fontSize="13px" fontWeight={600} lineHeight="20px">
              {plugin.author}
            </Text>
          </>
        ) : null}

        {plugin.version ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Version")}
            </Text>
            <div
              className={classNames(styles.version, {
                [styles.incompatible]: !plugin.compatible,
              })}
            >
              <Text fontSize="13px" fontWeight={600} lineHeight="20px">
                {plugin.version}
              </Text>
              {!plugin.compatible ? (
                <div
                  data-tooltip-id="system-tooltip"
                  data-tooltip-content={incompatibleTooltip}
                  data-tooltip-place="bottom"
                >
                  <PluginIncompatibleSvg className={styles.incompatibleSvg} />
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {!plugin.system ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Uploader")}
            </Text>
            <Text
              dataTestId="plugin_create_by"
              fontSize="13px"
              fontWeight={600}
              lineHeight="20px"
            >
              {plugin.createBy.displayName}
            </Text>
          </>
        ) : null}

        {!plugin.system && uploadDate ? (
          <>
            <Text
              fontSize="13px"
              fontWeight={400}
              lineHeight="20px"
              truncate
              dataTestId="plugin_upload_date"
            >
              {t("Common:UploadDate")}
            </Text>
            <Text
              dataTestId="plugin_upload_date_text"
              fontSize="13px"
              fontWeight={600}
              lineHeight="20px"
            >
              {uploadDate}
            </Text>
          </>
        ) : null}

        <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
          {t("People:UserStatus")}
        </Text>
        <Text fontSize="13px" fontWeight={600} lineHeight="20px">
          {pluginStatus}
        </Text>

        {plugin.homePage ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:Homepage")}
            </Text>
            <Link
              fontSize="13px"
              fontWeight={600}
              lineHeight="20px"
              type={LinkType.page}
              href={plugin?.homePage}
              target={LinkTarget.blank}
              isHovered
              dataTestId="plugin_home_page_link"
            >
              {plugin.homePage}
            </Link>
          </>
        ) : null}
        {plugin.descriptionLocale ? (
          <>
            <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
              {t("Common:DescriptionLabel")}
            </Text>
            <Text
              dataTestId="settings_plugin_description"
              fontSize="13px"
              fontWeight={600}
              lineHeight="20px"
            >
              {plugin.descriptionLocale}
            </Text>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Info;
