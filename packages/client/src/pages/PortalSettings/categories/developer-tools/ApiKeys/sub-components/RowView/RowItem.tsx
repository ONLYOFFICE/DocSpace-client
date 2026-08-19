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
import { Row, RowContent } from "@docspace/ui-kit/components/rows";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import { isMobile } from "@docspace/shared/utils";

import { useContextOptions } from "../useContextOptions";
import { RowItemType } from "../../types";
import { ApiKeysLifetimeIcon } from "../ApiKeysLifetimeIcon";
import { getStatusByDate } from "../../utils";
import styles from "./RowView.module.scss";

const RowItem = (props: RowItemType) => {
  const {
    item,
    culture,
    sectionWidth,
    onChangeApiKeyParams,
    onDeleteApiKey,
    onEditApiKey,
  } = props;

  const { t } = useTranslation(["Common"]);
  const { contextOptions } = useContextOptions(
    t,
    item,
    onEditApiKey,
    onDeleteApiKey,
  );

  const expiresAtDate = item.expiresAt
    ? getStatusByDate(item.expiresAt, culture)
    : "";

  return (
    <Row contextOptions={contextOptions}>
      <RowContent className={styles.rowContent} sectionWidth={sectionWidth}>
        <div>
          <div className="api-keys_name">
            <Text fontWeight={600} fontSize="14px">
              {item.name}
            </Text>
            <ApiKeysLifetimeIcon
              t={t}
              item={item}
              expiresAtDate={expiresAtDate}
              expiresAt={item.expiresAt}
            />
          </div>
          {!isMobile() ? (
            <div>
              <Text
                fontWeight={600}
                fontSize="12px"
                className="row-content_text"
              >
                {item.key} |{" "}
                {Encoder.htmlDecode(item.createBy.displayName ?? "")}
              </Text>
            </div>
          ) : null}
        </div>

        <div className={styles.toggleButtonWrapper}>
          <ToggleButton
            className="toggleButton"
            isChecked={item.isActive}
            onChange={() =>
              onChangeApiKeyParams(item.id, { isActive: !item.isActive })
            }
          />
        </div>
      </RowContent>
    </Row>
  );
};

export default RowItem;

