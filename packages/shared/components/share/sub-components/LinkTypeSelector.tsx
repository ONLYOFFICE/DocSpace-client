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

import { type FC, useId, useMemo } from "react";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@docspace/ui-kit/components/combobox";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";

import { IconDisplay } from "./IconDisplay";

import styles from "../Share.module.scss";

export interface AccessOptionProps {
  isLoaded: boolean;
  canEditInternal: boolean;
  options: TOption[];
  selectedOption: TOption;
  onSelect: (option: TOption) => void;
}

export const LinkTypeSelector: FC<AccessOptionProps> = ({
  options,
  isLoaded,
  onSelect,
  selectedOption,
  canEditInternal,
}) => {
  const uid = useId().replace(/:/g, "");
  const anchorClass = `share-external-disabled-${uid}`;

  const optionsWithExternalAnchor = useMemo(
    () =>
      options.map((opt) =>
        opt.className === "share-external-disabled"
          ? { ...opt, className: anchorClass }
          : opt,
      ),
    [options, anchorClass],
  );

  const disabledExternalTooltip = optionsWithExternalAnchor.find(
    (opt) => opt.disabled && opt.tooltip,
  )?.tooltip;

  if (!canEditInternal) {
    return <IconDisplay option={selectedOption} />;
  }

  return (
    <>
      <ComboBox
        fillIcon
        modernView
        type="onlyIcon"
        directionY="both"
        manualWidth="auto"
        withBackdrop={false}
        scaled={false}
        noSelect={false}
        options={optionsWithExternalAnchor}
        scaledOptions={false}
        className={styles.internalCombobox}
        size={ComboBoxSize.content}
        selectedOption={selectedOption}
        onSelect={onSelect}
        showDisabledItems
        isDisabled={isLoaded}
        useImageIcon
      />
      {disabledExternalTooltip ? (
        <Tooltip
          id={`share-link-type-tooltip-${uid}`}
          anchorSelect={`.${anchorClass}`}
          place="bottom-start"
        >
          {disabledExternalTooltip}
        </Tooltip>
      ) : null}
    </>
  );
};
