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

import React, { useCallback } from "react";
import { inject, observer } from "mobx-react";

import { TableCell, TableRow } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";

import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.14.react.svg";

import styles from "./ModelSettingsTable.module.scss";

type ModelSettingsRowProps = {
  modelId: string;
  image: string;
  title: string;
  provider?: string;
  inputPrice: string;
  outputPrice?: string;
  enabled: boolean;
  isUpdating: boolean;
  link?: string;
  onToggle: (modelId: string, enabled: boolean) => Promise<void>;
  isAiToolsServiceOn?: boolean;
};

const ModelSettingsRow: React.FC<ModelSettingsRowProps> = ({
  modelId,
  title,
  provider,
  inputPrice,
  outputPrice,
  enabled,
  isUpdating,
  link,
  onToggle,
  image,
  isAiToolsServiceOn,
}) => {
  const onChange = useCallback(() => {
    void onToggle(modelId, !enabled);
  }, [enabled, modelId, onToggle]);

  return (
    <TableRow>
      <TableCell>
        <div className={styles.modelCell}>
          <div className={styles.modelTitleRow}>
            <div className={styles.modelIconPlaceholder}>
              <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                dangerouslySetInnerHTML={{ __html: image }}
                className={styles.iconsContainer}
              />
            </div>
            <Text
              fontSize="12px"
              fontWeight={600}
              className={styles.modelTitle}
            >
              {title}
            </Text>
            {/* {provider ? (
              <Text
                fontSize="12px"
                fontWeight={400}
                as="span"
                className={styles.modelProvider}
              >
                ({provider})
              </Text>
            ) : null} */}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Text fontSize="12px" fontWeight={600} className={styles.priceCell}>
          {inputPrice}
        </Text>
      </TableCell>
      <TableCell>
        <Text fontSize="12px" fontWeight={600} className={styles.priceCell}>
          {outputPrice ?? "—"}
        </Text>
      </TableCell>
      <TableCell>
        <div className={styles.toggleCell}>
          <div className={styles.toggleWrapper}>
            <ToggleButton
              isChecked={enabled}
              onChange={onChange}
              isDisabled={isUpdating || !isAiToolsServiceOn}
              dataTestId={`ai_model_toggle_${modelId}`}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        {link ? (
          <Link
            href={link}
            target={LinkTarget.blank}
            className={styles.detailsLink}
          >
            <ExternalLinkIcon />
          </Link>
        ) : null}
      </TableCell>
    </TableRow>
  );
};

export default inject<TStore>(({ paymentStore }) => {
  const { isAiToolsServiceOn } = paymentStore;

  return {
    isAiToolsServiceOn,
  };
})(observer(ModelSettingsRow));

