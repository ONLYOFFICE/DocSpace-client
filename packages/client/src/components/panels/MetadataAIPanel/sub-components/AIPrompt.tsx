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

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";

import { METADATA_AI_PROMPT_MAX_LENGTH } from "../utils";
import styles from "../MetadataAIPanel.module.scss";

type AIPromptProps = {
  value: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
};

const AIPrompt = ({ value, isDisabled, onChange }: AIPromptProps) => {
  const { t } = useTranslation(["Metadata"]);
  const [isOpen, setIsOpen] = useState(!!value);

  if (!isOpen) {
    return (
      <Link
        className={styles.promptLink}
        type={LinkType.action}
        fontSize="13px"
        fontWeight={600}
        color="accent"
        isHovered
        onClick={() => setIsOpen(true)}
        dataTestId="metadata_ai_prompt_link"
      >
        {t("Metadata:AIAddInstructions")}
      </Link>
    );
  }

  return (
    <Textarea
      wrapperClassName={styles.prompt}
      className={styles.promptField}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t("Metadata:AIPromptPlaceholder")}
      maxLength={METADATA_AI_PROMPT_MAX_LENGTH}
      heightTextArea="64px"
      fontSize={13}
      autoFocus={!value}
      isDisabled={isDisabled}
      dataTestId="metadata_ai_prompt_textarea"
    />
  );
};

export default AIPrompt;
