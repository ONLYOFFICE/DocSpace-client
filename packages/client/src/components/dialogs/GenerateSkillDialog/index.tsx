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
import { Trans, useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { ModalDialog, ModalDialogType } from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Label } from "@onlyoffice/apps-ui-kit/components/label";
import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { generateSkillWithAI } from "@docspace/shared/api/ai";
import {
  SKILL_DESCRIPTION_MAX_LENGTH,
  SKILL_TITLE_MAX_LENGTH,
  type TGenerateSkillError,
} from "@docspace/shared/api/ai/types";
import { getFileInfo } from "@docspace/shared/api/files";
import type { TTranslation } from "@docspace/shared/types";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";

import styles from "./GenerateSkillDialog.module.scss";

type GenerateSkillDialogProps = {
  roomId?: number | string | null;
  setGenerateSkillDialogVisible?: (visible: boolean) => void;
  openFileAction?: (item: never, t: TTranslation) => Promise<unknown>;
};

const getErrorMessage = (t: TTranslation, error: TGenerateSkillError) => {
  if (error.status === 503) return t("Common:CreateSkillWithAINoModel");
  // The provider's own words for a rate limit or a lack of credit.
  if (error.providerMessage) return error.providerMessage;
  // A 4xx carries the reason: the Files service's own refusal, localized.
  if (error.status && error.status < 500) return error.message;
  return t("Common:SomethingWentWrong");
};

/**
 * "Create skill with AI" in an Instructions room: the user names the skill
 * and describes it, the AI service writes the Markdown file and saves it in
 * the room. The request is synchronous, so the panel waits on it and closes
 * once the file exists; the file itself reaches the list through the socket.
 */
const GenerateSkillDialog = ({
  roomId,
  setGenerateSkillDialogVisible,
  openFileAction,
}: GenerateSkillDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isValidTitle, setIsValidTitle] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const onClose = () => {
    abortRef.current?.abort();
    setGenerateSkillDialogVisible?.(false);
  };

  const showCreated = (fileId: string, fileTitle: string) => {
    const open = async () => {
      toastr.clear(toastId);
      try {
        const file = await getFileInfo(fileId);
        await openFileAction?.(file as never, t);
      } catch (e) {
        toastr.error(e as Error);
      }
    };

    const toastId = toastr.success(
      <Trans
        t={t as TTranslation & TFunction}
        i18nKey="Common:CreateSkillWithAISuccess"
        values={{ title: fileTitle }}
        components={[
          <Link
            key="open"
            tag="a"
            isHovered
            color="accent"
            role="button"
            tabIndex={0}
            onClick={open}
            onKeyDown={(event: React.KeyboardEvent<Element>) => {
              if (event.key !== "Enter" && event.key !== " ") return;

              event.preventDefault();
              void open();
            }}
          />,
        ]}
      />,
      undefined,
      undefined,
      // Without a cross the toast closes on any click inside it, so the
      // Open link would be swallowed by the dismissal before its handler ran.
      true,
    );
  };

  const onSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setIsValidTitle(false);
      return;
    }
    if (!description.trim() || roomId == null || isLoading) return;

    const abort = new AbortController();
    abortRef.current = abort;
    setIsLoading(true);

    try {
      const skill = await generateSkillWithAI(
        { destId: roomId, title: trimmedTitle, description: description.trim() },
        abort.signal,
      );
      setGenerateSkillDialogVisible?.(false);
      showCreated(skill.id, skill.title);
    } catch (e) {
      if (abort.signal.aborted) return;
      toastr.error(getErrorMessage(t, e as TGenerateSkillError));
      setIsLoading(false);
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
        void onSubmit();
      }}
      onClose={onClose}
      isCloseable={!isLoading}
      dataTestId="generate-skill-dialog"
    >
      <ModalDialog.Header>{t("Common:CreateSkillWithAI")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.body}>
          <Text className={styles.description} fontSize="12px" lineHeight="16px">
            {t("Common:CreateSkillWithAIPanelDescription")}
          </Text>
          <InputParam
            id="generate-skill-title"
            title={`${t("Common:Name")}:`}
            placeholder={t("Common:EnterName")}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value.slice(0, SKILL_TITLE_MAX_LENGTH));
              setIsValidTitle(true);
            }}
            isValidTitle={isValidTitle}
            errorMessage={t("Common:RequiredField")}
            isAutoFocussed
            isDisabled={isLoading}
            dataTestId="generate-skill-title"
          />
          <div className={styles.field}>
            <Label
              htmlFor="generate-skill-description"
              text={`${t("Common:DescriptionLabel")}:`}
              display="display"
            />
            <Textarea
              id="generate-skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Common:CreateSkillWithAIPlaceholder")}
              maxLength={SKILL_DESCRIPTION_MAX_LENGTH}
              heightTextArea="240px"
              fontSize={13}
              isDisabled={isLoading}
              dataTestId="generate-skill-description"
            />
          </div>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:Create")}
          size={ButtonSize.normal}
          primary
          scale
          type="submit"
          isLoading={isLoading}
          isDisabled={!title.trim() || !description.trim()}
          testId="generate-skill-submit"
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="generate-skill-cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, selectedFolderStore, filesActionsStore }: TStore) => ({
  roomId: selectedFolderStore.id,
  setGenerateSkillDialogVisible: dialogsStore.setGenerateSkillDialogVisible,
  openFileAction: filesActionsStore.openFileAction,
}))(observer(GenerateSkillDialog));
