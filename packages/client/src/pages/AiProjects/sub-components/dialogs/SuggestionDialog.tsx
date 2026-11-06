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

import React from "react";
import { useTranslation } from "react-i18next";

import { ModalDialog, ModalDialogType } from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";
import { InputType, TextInput } from "@onlyoffice/apps-ui-kit/components/text-input";
import { AI_PROJECT_MAX_TEXT_LENGTH } from "@docspace/shared/api/ai/projects";
import type { TAiProjectSuggestion } from "@docspace/shared/api/ai/projects";

import styles from "./SuggestionDialog.module.scss";

type SuggestionDialogProps = {
  /** The suggestion to edit; `null` adds a new one. */
  suggestion: TAiProjectSuggestion | null;
  onSave: (suggestion: TAiProjectSuggestion) => void;
  onClose: () => void;
};

/**
 * The centred dialog over the project form that adds or edits one
 * suggestion chip: the label the chat shows and the prompt a click puts
 * into the composer. Saving needs both; each holds at most
 * `AI_PROJECT_MAX_TEXT_LENGTH` characters.
 */
const SuggestionDialog = ({ suggestion, onSave, onClose }: SuggestionDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [name, setName] = React.useState(suggestion?.name ?? "");
  const [prompt, setPrompt] = React.useState(suggestion?.prompt ?? "");

  const label = name.trim();
  const text = prompt.trim();
  const canSave = !!label && !!text;

  const onSubmit = () => {
    if (canSave) onSave({ name: label, prompt: text });
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.modal}
      autoMaxHeight
      onClose={onClose}
      dataTestId="ai-project-suggestion-dialog"
    >
      <ModalDialog.Header>
        {suggestion ? t("Common:AIProjectEditSuggestion") : t("Common:AIProjectAddSuggestion")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <div className={styles.field}>
            <Text as="label" htmlFor="ai-project-suggestion-name" fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
              {`${t("Common:Label")}:`}
            </Text>
            <TextInput
              id="ai-project-suggestion-name"
              type={InputType.text}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              maxLength={AI_PROJECT_MAX_TEXT_LENGTH}
              placeholder={t("Common:AIProjectSuggestionLabelPlaceholder")}
              isAutoFocussed
              scale
              testId="ai-project-suggestion-name"
            />
          </div>
          <div className={styles.field}>
            <Text as="label" htmlFor="ai-project-suggestion-prompt" fontSize="13px" lineHeight="20px" fontWeight={600} noSelect>
              {`${t("Common:AIProjectSuggestionPrompt")}:`}
            </Text>
            <Textarea
              id="ai-project-suggestion-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              heightTextArea={120}
              maxLength={AI_PROJECT_MAX_TEXT_LENGTH}
              placeholder={t("Common:AIProjectSuggestionPromptPlaceholder")}
              dataTestId="ai-project-suggestion-prompt"
            />
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={suggestion ? t("Common:SaveButton") : t("Common:AddButton")}
          size={ButtonSize.normal}
          primary
          scale
          isDisabled={!canSave}
          onClick={onSubmit}
          testId="ai-project-suggestion-save"
        />
        <Button label={t("Common:CancelButton")} size={ButtonSize.normal} scale onClick={onClose} />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default SuggestionDialog;
