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

"use no memo";

import { useId } from "react";
import type { TooltipRenderProps } from "react-joyride";
import { ReactSVG } from "react-svg";

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import styles from "./ModelUpdatedBanner.module.scss";

/**
 * The "Model updated" card itself — a title, a line of text and a close
 * button, with none of a tour tooltip's navigation (there is one step and
 * nowhere to go). Rendered by react-joyride inside its own portal, already
 * positioned against the composer's model picker.
 */
const ModelUpdatedTooltip = ({
  step,
  closeProps,
  tooltipProps,
}: TooltipRenderProps) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      {...tooltipProps}
      // Not modal: the composer under the card stays usable.
      aria-modal={false}
      role="dialog"
      aria-labelledby={step.title ? titleId : undefined}
      aria-describedby={step.content ? descriptionId : undefined}
      className={styles.tooltip}
      data-testid="ai-model-updated-tooltip"
    >
      <button type="button" className={styles.close} {...closeProps}>
        <ReactSVG src={CrossReactSvgUrl} />
      </button>

      {step.title ? (
        <div id={titleId} className={styles.title}>
          {step.title}
        </div>
      ) : null}

      {step.content ? (
        <div id={descriptionId} className={styles.content}>
          {step.content}
        </div>
      ) : null}
    </div>
  );
};

export default ModelUpdatedTooltip;
