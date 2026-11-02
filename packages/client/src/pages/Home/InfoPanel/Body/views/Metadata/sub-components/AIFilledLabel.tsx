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

import AISvgUrl from "PUBLIC_DIR/images/icons/16/AI.svg?url";
import UndoReactSvgUrl from "PUBLIC_DIR/images/media.rotateleft.react.svg?url";

import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { TooltipContainer } from "@onlyoffice/apps-ui-kit/components/tooltip";

import styles from "./Panel.module.scss";

type AIFilledLabelProps = {
  children: string;
  onUndo?: () => void;
};

const AIFilledLabel = ({ children, onUndo }: AIFilledLabelProps) => {
  const { t } = useTranslation(["Metadata"]);

  const label = (
    <TooltipContainer
      as="span"
      className={styles.aiFilledLabel}
      title={t("Metadata:AIFilled")}
      data-testid="metadata_ai_filled_mark"
    >
      <ReactSVG
        src={AISvgUrl}
        wrapper="span"
        className={styles.aiFilledIcon}
        role="img"
        aria-label={t("Metadata:AIFilled")}
      />
      <span className={styles.aiFilledName}>{children}</span>
    </TooltipContainer>
  );

  if (!onUndo) return label;

  return (
    <span className={styles.aiFilledRow}>
      {label}
      <IconButton
        className={styles.aiUndoButton}
        iconName={UndoReactSvgUrl}
        size={12}
        isClickable
        title={t("Metadata:AIUndoChange")}
        onClick={onUndo}
        dataTestId="metadata_ai_undo_button"
      />
    </span>
  );
};

export default AIFilledLabel;
