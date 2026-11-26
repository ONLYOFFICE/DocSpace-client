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
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { insertFile, updateFile, updateFileStream } from "@docspace/shared/api/files";
import type { TFile } from "@docspace/shared/api/files/types";
import {
  buildSkillFile,
  parseSkillFile,
  SKILL_EXTENSION,
  toSkillName,
} from "@docspace/shared/utils/skillFile";

import SkillForm from "./SkillForm";

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
  /** The skill set a new skill is created in: the dialog opens empty. */
  folderId?: number | string | null;
  /** Opened by "View instructions": the instructions alone, not to be changed. */
  readOnly?: boolean;
  onClose?: () => void;
  refreshFiles?: () => Promise<unknown>;
  /** Drops what the list and the Info panel read of the skill, so they read it again. */
  forgetSkill?: (id: number | string) => void;
};

/**
 * Creates a skill in a skill set ("New skill", opened empty) or edits one: its name, which is also the file's title
 * and gives the command the chat calls it by, its description, which tells
 * the assistant when to use the skill on its own, and its instructions. The
 * file is rewritten in place as a new version and renamed when the name
 * changed; the Files service checks the frontmatter and names what it
 * refuses.
 */
const EditSkillDialog = ({
  file,
  folderId = null,
  readOnly = false,
  onClose,
  refreshFiles,
  forgetSkill,
}: EditSkillDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const isNew = !file && folderId !== null;
  // A new skill has nothing to read: its form opens at once.
  const [isLoading, setIsLoading] = React.useState(!isNew);
  const [isFailed, setIsFailed] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  // "Edit" in the instructions view turns the same dialog into the form.
  const [isViewing, setIsViewing] = React.useState(readOnly);
  // A new skill opens filled in: a name to change, what a description is
  // for, and the instructions laid out the way a skill is written.
  const [name, setName] = React.useState(() =>
    file ? titleOf(file) : isNew ? t("Common:NewSkill") : "",
  );
  const [description, setDescription] = React.useState(() =>
    isNew ? t("Common:SkillTemplateDescription") : "",
  );
  const [body, setBody] = React.useState(() =>
    isNew ? t("Common:SkillTemplateInstructions") : "",
  );
  // The name is not called wrong before the user has changed it.
  const [isNameChanged, setIsNameChanged] = React.useState(false);
  // The frontmatter the dialog does not edit (`license`, `allowed-tools`,
  // ...): written back as the file had it.
  const extraRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (!file) return undefined;
    let cancelled = false;
    readSkillText(file)
      .then((text) => {
        if (cancelled) return;
        const skill = parseSkillFile(text);
        extraRef.current = skill.extra;
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

  if (!file && !isNew) return null;

  const canEdit = !!file?.security?.Edit && !!file?.security?.Rename;

  if (isViewing && file)
    return (
      <ModalDialog
        visible
        displayType={ModalDialogType.modal}
        autoMaxHeight
        className={styles.dialog}
        onClose={onClose}
        dataTestId="view-skill-dialog"
      >
        <ModalDialog.Header>{titleOf(file)}</ModalDialog.Header>
        <ModalDialog.Body>
          {isFailed ? (
            <Text className={styles.message} data-testid="edit-skill-error">
              {t("Common:SomethingWentWrong")}
            </Text>
          ) : (
            <div className={styles.body}>
              {isLoading ? null : (
                <React.Suspense fallback={null}>
                  <SkillEditor
                    value={body}
                    isDisabled
                    onChange={setBody}
                    minHeight="0"
                    height="100%"
                    className={styles.editorFill}
                    withLineNumbers={false}
                  />
                </React.Suspense>
              )}
            </div>
          )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          {canEdit && !isFailed ? (
            <Button
              label={t("Common:EditButton")}
              size={ButtonSize.normal}
              primary
              onClick={() => setIsViewing(false)}
              isDisabled={isLoading}
              testId="view-skill-edit"
            />
          ) : null}
          <Button
            label={t("Common:CloseButton")}
            size={ButtonSize.normal}
            onClick={onClose}
            testId="view-skill-close"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );

  const skillName = toSkillName(name);
  const isValidName = skillName !== "";
  const canSave = !isLoading && !isFailed && isValidName && description.trim() !== "" && !isSaving;

  const onSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const text = buildSkillFile({ name: skillName, description, body, extra: extraRef.current });
      const title = name.trim();
      if (file) {
        await updateFileStream(file.id, new File([text], file.title, { type: "text/markdown" }), false, true);
        if (title !== titleOf(file)) await updateFile(file.id, `${title}${SKILL_EXTENSION}`);
        forgetSkill?.(file.id);
      } else {
        // The Files service checks the frontmatter and the set's skill limit.
        await insertFile(folderId as number | string, `${title}${SKILL_EXTENSION}`, new Blob([text], { type: "text/markdown" }));
      }
      await refreshFiles?.();
      toastr.success(t("Common:SkillSaved"));
      onClose?.();
    } catch (e) {
      toastr.error(e as Error);
      setIsSaving(false);
    }
  };

  // A skill is written and edited in the modal its instructions are read
  // in: one that takes most of the window, so the instructions have room.
  return (
    <ModalDialog
      visible
      displayType={ModalDialogType.modal}
      autoMaxHeight
      className={styles.dialog}
      withForm
      onSubmit={(e) => {
        e.preventDefault();
        void onSave();
      }}
      onClose={onClose}
      isCloseable={!isSaving}
      dataTestId="edit-skill-dialog"
    >
      <ModalDialog.Header>{isNew ? t("Common:NewSkill") : t("Common:EditSkill")}</ModalDialog.Header>
      <ModalDialog.Body>
        {isFailed ? (
          <Text className={styles.message} data-testid="edit-skill-error">
            {t("Common:SomethingWentWrong")}
          </Text>
        ) : (
          <SkillForm
            name={name}
            onNameChange={(value) => {
              setName(value);
              setIsNameChanged(true);
            }}
            isNameChanged={isNameChanged}
            description={description}
            onDescriptionChange={setDescription}
            body={body}
            onBodyChange={setBody}
            isLoading={isLoading}
            isSaving={isSaving}
          />
        )}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          primary
          type="submit"
          isLoading={isSaving}
          isDisabled={!canSave}
          testId="edit-skill-save"
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          isDisabled={isSaving}
          testId="edit-skill-cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export { EditSkillDialog as PureEditSkillDialog };

export default inject(({ dialogsStore, filesStore, skillsStore }: TStore) => ({
  file: dialogsStore.editSkillFile,
  folderId: dialogsStore.newSkillFolderId,
  readOnly: dialogsStore.editSkillReadOnly,
  onClose: () => {
    dialogsStore.setEditSkillFile(null);
    dialogsStore.setNewSkillFolderId(null);
  },
  refreshFiles: filesStore.refreshFiles,
  forgetSkill: skillsStore.forget,
}))(observer(EditSkillDialog));
