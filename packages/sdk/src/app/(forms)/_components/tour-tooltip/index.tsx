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
"use client";

import { useId } from "react";
import type { TooltipRenderProps } from "react-joyride";

import { ReactSVG } from "react-svg";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/16/cross.react.svg?url";

import styles from "./TourTooltip.module.scss";

export default function TourTooltip({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const titleId = useId();
  const descId = useId();
  const hasSkip = !!skipProps?.title && index < size - 1;

  return (
    <div
      {...tooltipProps}
      role="dialog"
      aria-modal
      aria-labelledby={step.title ? titleId : undefined}
      aria-describedby={step.content ? descId : undefined}
      className={styles.tooltip}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      <button type="button" className={styles.close} {...closeProps}>
        <ReactSVG src={CrossReactSvgUrl} />
      </button>

      {step.title && (
        <div id={titleId} className={styles.title}>
          {step.title}
        </div>
      )}
      {step.content && (
        <div id={descId} className={styles.content}>
          {step.content}
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.progress}>
          {index + 1} / {size}
        </span>
        <div className={styles.buttons}>
          {hasSkip && (
            <Button
              label={skipProps.title}
              size={ButtonSize.extraSmall}
              onClick={skipProps.onClick}
            />
          )}
          {index > 0 && (
            <Button
              label={backProps.title}
              size={ButtonSize.extraSmall}
              onClick={backProps.onClick}
            />
          )}
          {continuous && (
            <Button
              label={primaryProps.title}
              size={ButtonSize.extraSmall}
              primary
              onClick={primaryProps.onClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
