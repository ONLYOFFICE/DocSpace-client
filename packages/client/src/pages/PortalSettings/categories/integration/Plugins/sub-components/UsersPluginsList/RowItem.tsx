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

import { useTranslation } from "react-i18next";

import { Row, RowContent } from "@onlyoffice/apps-ui-kit/components/rows";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { Encoder } from "@onlyoffice/apps-ui-kit/utils/encoder";

import { getLocalizedText } from "SRC_DIR/helpers/plugins/personal";

import { UsersPluginsItemProps } from "../../Plugins.types";
import { getContextOptions } from "./getContextOptions";
import styles from "./UsersPluginsList.module.scss";

const RowItem = ({
  plugin,
  language,
  sectionWidth,
  isMe,
  onSwitch,
  onDelete,
}: UsersPluginsItemProps & { sectionWidth: number }) => {
  const { t } = useTranslation(["Common"]);

  const userName = Encoder.htmlDecode(plugin.createBy?.displayName ?? "");

  const details = [
    isMe ? `${userName} (${t("Common:MeLabel")})` : userName,
    plugin.version,
    plugin.cspDomains,
  ].filter(Boolean);

  return (
    <Row
      contextOptions={getContextOptions(t, () => onDelete(plugin))}
      dataTestId={`user_plugin_${plugin.createBy?.id}_${plugin.name}`}
    >
      <RowContent className={styles.rowContent} sectionWidth={sectionWidth}>
        <div>
          <Text fontSize="14px" fontWeight={600} truncate>
            {getLocalizedText(plugin.nameLocale, language, plugin.name)}
          </Text>
          <Text
            className="row-content_text"
            fontSize="12px"
            fontWeight={600}
            truncate
          >
            {details.join(" | ")}
          </Text>
        </div>

        <div className={styles.toggleButtonWrapper}>
          <ToggleButton
            className="toggleButton"
            isChecked={plugin.enabled}
            onChange={() => onSwitch(plugin, !plugin.enabled)}
            dataTestId={`user_plugin_${plugin.name}_toggle_button`}
          />
        </div>
      </RowContent>
    </Row>
  );
};

export default RowItem;
