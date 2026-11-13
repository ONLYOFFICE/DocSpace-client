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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ModalDialog, ModalDialogType } from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Label } from "@onlyoffice/apps-ui-kit/components/label";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { SKILL_DESCRIPTION_MAX_LENGTH, SKILL_TITLE_MAX_LENGTH } from "@docspace/shared/api/ai/types";
import { updateFile, updateFileStream } from "@docspace/shared/api/files";
import type { TFile } from "@docspace/shared/api/files/types";
import {
  buildSkillFile,
  parseSkillFile,
  SKILL_EXTENSION,
  toSkillCommand,
  toSkillName,
} from "@docspace/shared/utils/skillFile";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";

import styles from "./EditSkillDialog.module.scss";

// CodeMirror is loaded with the dialog, not with the panels.
const SkillEditor = React.lazy(() => import("../GenerateSkillDialog/SkillEditor"));

/** The file's title without its extension: what the skill is named in the list. */
const titleOf = (file: Pick<TFile, "title">) =>
  file.title.toLowerCase().endsWith(SKILL_EXTENSION)
    ? file.title.slice(0, -SKILL_EXTENSION.length)
    : file.title;

/** Reads the text of a skill file with the caller's session. */
export const readSkillText = async (file: Pick<TFile, "viewUrl">) => {
  const response = await fetch(file.viewUrl);
  if (!response.ok) throw new Error(response.statusText);
  return response.text();
};

type EditSkillDialogProps = {
  file?: TFile | null;
  onClose?: () => void;
  refreshFiles?: () => Promise<unknown>;
};

/**
 * Edits a skill of a skill set: its name, which is also the file's title
 * and gives the command the chat calls it by, its description, which tells
 * the assistant when to use the skill on its own, and its instructions. The
 * file is rewritten in place as a new version and renamed when the name
 * changed; the Files service checks the frontmatter and names what it
 * refuses.
 */
const EditSkillDialog = ({ file, onClose, refreshFiles }: EditSkillDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isFailed, setIsFailed] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [name, setName] = React.useState(file ? titleOf(file) : "");
  const [description, setDescription] = React.useState("");
  const [body, setBody] = React.useState("");

  React.useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;
    readSkillText(file)
      .then((text) => {
        if (cancelled) return;
        const skill = parseSkillFile(text);
        setDescription(skill.description);
        setBody(skill.body);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsFailed(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!file) return null;

  const skillName = toSkillName(name);
  const isValidName = skillName !== "";
  const canSave = !isLoading && !isFailed && isValidName && description.trim() !== "" && !isSaving;

  const onSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const text = buildSkillFile({ name: skillName, description, body });
      await updateFileStream(file.id, new File([text], file.title, { type: "text/markdown" }), false, true);
      const title = name.trim();
      if (title !== titleOf(file)) await updateFile(file.id, `${title}${SKILL_EXTENSION}`);
      await refreshFiles?.();
      toastr.success(t("Common:SkillSaved"));
      onClose?.();
    } catch (e) {
      toastr.error(e as Error);
      setIsSaving(false);
    }
  };

  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.aside}
      withBodyScroll
      withForm
      onSubmit={(e) => {
        e.preventDefault();
        void onSave();
      }}
      onClose={onClose}
      isCloseable={!isSaving}
      dataTestId="edit-skill-dialog"
    >
      <ModalDialog.Header>{t("Common:EditSkill")}</ModalDialog.Header>
      <ModalDialog.Body>
        {isFailed ? (
          <Text className={styles.message} data-testid="edit-skill-error">
            {t("Common:SomethingWentWrong")}
          </Text>
        ) : (
          <div className={styles.body}>
            <div className={styles.field}>
              <InputParam
                id="edit-skill-name"
                title={`${t("Common:Name")}:`}
                placeholder={t("Common:EnterName")}
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, SKILL_TITLE_MAX_LENGTH))}
                isValidTitle={isValidName}
                errorMessage={t("Common:SkillNameNeedsLetterOrDigit")}
                isAutoFocussed
                isDisabled={isSaving}
                dataTestId="edit-skill-name"
              />
              {isValidName ? (
                <Text fontSize="12px" lineHeight="16px" className={styles.hint} data-testid="edit-skill-command">
                  {`${t("Common:SkillCommandInChat")} `}
                  <span className={styles.command}>{toSkillCommand(skillName)}</span>
                </Text>
              ) : null}
            </div>
            <div className={styles.field}>
              <Label htmlFor="edit-skill-description" text={`${t("Common:DescriptionLabel")}:`} display="display" />
              <Textarea
                id="edit-skill-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            <div className={styles.field}>
              <Label text={`${t("Common:SkillInstructions")}:`} display="display" />
              {isLoading ? null : (
                <React.Suspense fallback={null}>
                  <SkillEditor value={body} isDisabled={isSaving} onChange={setBody} minHeight="320px" />
                </React.Suspense>
              )}
              <Text fontSize="12px" lineHeight="16px" className={styles.hint}>
                {t("Common:MarkdownSupported")}
              </Text>
            </div>
          </div>
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          primary
          scale
          type="submit"
          isLoading={isSaving}
          isDisabled={!canSave}
          testId="edit-skill-save"
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isSaving}
          testId="edit-skill-cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export { EditSkillDialog as PureEditSkillDialog };

export default inject(({ dialogsStore, filesStore }: TStore) => ({
  file: dialogsStore.editSkillFile,
  onClose: () => dialogsStore.setEditSkillFile(null),
  refreshFiles: filesStore.refreshFiles,
}))(observer(EditSkillDialog));
