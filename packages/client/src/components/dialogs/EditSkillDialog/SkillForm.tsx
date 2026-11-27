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
import type { EditorView } from "@uiw/react-codemirror";
import { useTranslation } from "react-i18next";

import { Label } from "@onlyoffice/apps-ui-kit/components/label";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";
import {
  SKILL_DESCRIPTION_MAX_LENGTH,
  SKILL_TITLE_MAX_LENGTH,
} from "@docspace/shared/api/ai/types";
import { toSkillCommand, toSkillName } from "@docspace/shared/utils/skillFile";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";

import MarkdownToolbar from "./MarkdownToolbar";
import { getMarkdownEdit, type TMarkdownAction } from "./markdown";

import styles from "./EditSkillDialog.module.scss";

// CodeMirror is loaded with the form, not with the panels.
const SkillEditor = React.lazy(
  () => import("../GenerateSkillDialog/SkillEditor"),
);

type SkillFormProps = {
  /** The skill's name: the file's title, which gives the command. */
  name: string;
  onNameChange: (name: string) => void;
  /** A wrong name is called so only once the user has changed it. */
  isNameChanged?: boolean;
  description: string;
  onDescriptionChange: (description: string) => void;
  /** The instructions, the file after its frontmatter. */
  body: string;
  onBodyChange: (body: string) => void;
  /** The skill is still being read: its text cannot be changed yet. */
  isLoading?: boolean;
  isSaving?: boolean;
};

/**
 * The fields of a skill, as the Edit skill form lays them out: the name with
 * the command it gives, the description with what it is for, and the
 * instructions in a Markdown editor under its toolbar. It fills the body of
 * the dialog it is shown in, and the instructions take the height the other
 * fields leave.
 */
const SkillForm = ({
  name,
  onNameChange,
  isNameChanged = true,
  description,
  onDescriptionChange,
  body,
  onBodyChange,
  isLoading = false,
  isSaving = false,
}: SkillFormProps) => {
  const { t } = useTranslation(["Common"]);
  const editorRef = React.useRef<EditorView | null>(null);

  const skillName = toSkillName(name);
  const isValidName = skillName !== "";

  const onFormat = (action: TMarkdownAction) => {
    const view = editorRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const edit = getMarkdownEdit(view.state.doc.toString(), from, to, action);
    view.dispatch({
      changes: { from: edit.from, to: edit.to, insert: edit.insert },
      selection: { anchor: edit.anchor, head: edit.head },
    });
    view.focus();
  };

  return (
    <div className={styles.body}>
      <div className={`${styles.field} ${styles.nameField}`}>
        <InputParam
          id="edit-skill-name"
          title={t("Common:Name")}
          placeholder={t("Common:EnterName")}
          value={name}
          onChange={(e) =>
            onNameChange(e.target.value.slice(0, SKILL_TITLE_MAX_LENGTH))
          }
          isValidTitle={isValidName || !isNameChanged}
          errorMessage={t("Common:SkillNameNeedsLetterOrDigit")}
          isAutoFocussed
          isDisabled={isSaving}
          dataTestId="edit-skill-name"
        />
        {isValidName ? (
          <Text
            fontSize="12px"
            lineHeight="16px"
            className={styles.hint}
            data-testid="edit-skill-command"
          >
            {`${t("Common:SkillCommandInChat")} `}
            <span className={styles.command}>{toSkillCommand(skillName)}</span>
          </Text>
        ) : null}
      </div>
      <div className={styles.field}>
        <Label
          htmlFor="edit-skill-description"
          text={t("Common:DescriptionLabel")}
        />
        <Textarea
          id="edit-skill-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={SKILL_DESCRIPTION_MAX_LENGTH}
          heightTextArea="72px"
          fontSize={13}
          isDisabled={isLoading || isSaving}
          dataTestId="edit-skill-description"
        />
        <Text fontSize="12px" lineHeight="16px" className={styles.hint}>
          {t("Common:SkillDescriptionHint")}
        </Text>
      </div>
      <div className={`${styles.field} ${styles.fieldFill}`}>
        <Label text={t("Common:SkillInstructions")} />
        <div className={styles.instructions}>
          <MarkdownToolbar
            isDisabled={isLoading || isSaving}
            onAction={onFormat}
          />
          {isLoading ? null : (
            <React.Suspense fallback={null}>
              <SkillEditor
                value={body}
                isDisabled={isSaving}
                onChange={onBodyChange}
                minHeight="0"
                height="100%"
                className={styles.editorFill}
                withLineNumbers={false}
                onCreateEditor={(view) => {
                  editorRef.current = view;
                }}
              />
            </React.Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillForm;
