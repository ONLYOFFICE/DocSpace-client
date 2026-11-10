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

import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.14.react.svg";

import { inject, observer } from "mobx-react";

import { Link, LinkTarget } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";

import type ServicesStore from "SRC_DIR/store/ServicesStore";

import { CachePriceAnchor } from "../CachePriceTooltip";
import { ByokBadge } from "../sub-components/ByokBadge";

import type { TModelPrice, TModelRow, TRequestToggle } from "./aiModelsTypes";
import styles from "./ModelSettingsTable.module.scss";

export const ModelCell = ({ row }: { row: TModelRow }) => (
  <div className={styles.modelCell}>
    <div className={styles.modelTitleRow}>
      <div className={styles.modelIconPlaceholder}>
        <div
          // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
          dangerouslySetInnerHTML={{ __html: row.image }}
          className={styles.iconsContainer}
        />
      </div>
      <Text fontSize="12px" fontWeight={600} className={styles.modelTitle}>
        {row.alias}
      </Text>
      {row.byok ? <ByokBadge /> : null}
    </div>
  </div>
);

export const PriceCell = ({ price }: { price?: TModelPrice }) => (
  <CachePriceAnchor breakdown={price?.breakdown}>
    <Text fontSize="12px" fontWeight={600} className={styles.priceCell}>
      {price?.value || "—"}
    </Text>
  </CachePriceAnchor>
);

type TToggleCellProps = {
  row: TModelRow;
  onToggle: TRequestToggle;

  aiModelAvailabilityMap?: ServicesStore["aiModelAvailabilityMap"];
  aiModelAvailabilityUpdatingSet?: ServicesStore["aiModelAvailabilityUpdatingSet"];
  isAiToolsServiceOn?: boolean;
};

/** The model's switch, an observer of its own: the store changes it alone. */
const ToggleCellComponent = ({
  row,
  onToggle,
  aiModelAvailabilityMap,
  aiModelAvailabilityUpdatingSet,
  isAiToolsServiceOn,
}: TToggleCellProps) => {
  const enabled = aiModelAvailabilityMap?.get(row.id) ?? true;
  const isUpdating = aiModelAvailabilityUpdatingSet?.has(row.id) ?? false;

  return (
    <div className={styles.toggleCell}>
      <div className={styles.toggleWrapper}>
        <ToggleButton
          isChecked={enabled}
          onChange={() => onToggle({ id: row.id, title: row.alias }, !enabled)}
          isDisabled={isUpdating || !isAiToolsServiceOn}
          dataTestId={`ai_model_toggle_${row.id}`}
        />
      </div>
    </div>
  );
};

export const ToggleCell = inject<TStore>(({ servicesStore, paymentStore }) => ({
  aiModelAvailabilityMap: servicesStore.aiModelAvailabilityMap,
  aiModelAvailabilityUpdatingSet: servicesStore.aiModelAvailabilityUpdatingSet,
  isAiToolsServiceOn: paymentStore.isAiToolsServiceOn,
}))(observer(ToggleCellComponent));

export const DetailsCell = ({ link }: { link?: string }) =>
  link ? (
    <Link href={link} target={LinkTarget.blank} className={styles.detailsLink}>
      <ExternalLinkIcon />
    </Link>
  ) : null;
