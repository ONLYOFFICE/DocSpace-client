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

import React from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ReactSVG } from "react-svg";

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
  type TGenerateSkillResult,
} from "@docspace/shared/api/ai/types";
import { getFileInfo, insertFile } from "@docspace/shared/api/files";
import type { TTranslation } from "@docspace/shared/types";
import {
  getServiceLimitChatError,
  getServiceLimitDescription,
} from "@docspace/shared/utils/ai";

import InputParam from "SRC_DIR/components/CreateEditDialogParams/InputParam";

import styles from "./GenerateSkillDialog.module.scss";

// CodeMirror is loaded with the first generated skill, not with the panels.
const SkillEditor = React.lazy(() => import("./SkillEditor"));

const WIDTH_STORAGE_KEY = "generate-skill-panel-width";
// The default aside width is the narrowest the panel goes.
const MIN_WIDTH = 480;
// The page keeps at least this much room beside the panel.
const MIN_PAGE_GAP = 120;

const getMaxWidth = () => Math.max(MIN_WIDTH, window.innerWidth - MIN_PAGE_GAP);

const readStoredWidth = () => {
  try {
    const stored = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    return stored >= MIN_WIDTH ? Math.min(stored, getMaxWidth()) : MIN_WIDTH;
  } catch {
    return MIN_WIDTH;
  }
};

/**
 * The panel's width, dragged from its inner edge and remembered per browser.
 * On a phone the aside is full width and the handle is hidden.
 */
const usePanelWidth = () => {
  const [width, setWidth] = React.useState(readStoredWidth);
  const widthRef = React.useRef(width);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const isRtl = document.documentElement.dataset.dir === "rtl";

    const onMove = (event: PointerEvent) => {
      const next = isRtl ? event.clientX : window.innerWidth - event.clientX;
      widthRef.current = Math.min(Math.max(next, MIN_WIDTH), getMaxWidth());
      setWidth(widthRef.current);
    };
    const onUp = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      try {
        localStorage.setItem(WIDTH_STORAGE_KEY, String(widthRef.current));
      } catch {
        // Storage is unavailable: the width lasts for this panel only.
      }
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  };

  return { width, onPointerDown };
};

// The server folds the title into the skill name and keeps only letters and
// digits of it, so a title without any has no name.
const HAS_NAME_CHARS = /[\p{L}\p{N}]/u;

type GenerateSkillDialogProps = {
  roomId?: number | string | null;
  isAdmin?: boolean;
  language?: string;
  setGenerateSkillDialogVisible?: (visible: boolean) => void;
  openFileAction?: (item: never, t: TTranslation) => Promise<unknown>;
};

// The statuses read as in the metadata AI panel (getMetadataAIError); the
// server's own text is for developers and never shown.
const getGenerateError = (
  t: TTranslation,
  language: string,
  isAdmin: boolean,
  error: TGenerateSkillError,
) => {
  const serviceLimit = getServiceLimitChatError({
    code: error.code,
    message: error.providerMessage,
  });
  if (serviceLimit) {
    return getServiceLimitDescription(t, language, serviceLimit, isAdmin);
  }

  switch (error.status) {
    case 403:
      return t("Common:AccessDenied");
    case 429:
      return t("Metadata:AIBusy");
    case 502:
      return t("Metadata:AIFailed");
    case 503:
      return t("Common:CreateSkillWithAINoModel");
    case 504:
      return t("Metadata:AITimeout");
    default:
      return t("Common:SomethingWentWrong");
  }
};

/**
 * "Create skill with AI" in an Instructions room, laid out as the metadata AI
 * panel: the user names the skill and describes it, "Generate skill" has the
 * AI service write the Markdown file, and the result opens in an editor.
 * Nothing is stored until Save, which uploads the text as edited; the Files
 * service validates its frontmatter then, and the file reaches the list
 * through the socket.
 */
const GenerateSkillDialog = ({
  roomId,
  isAdmin = false,
  language = "en",
  setGenerateSkillDialogVisible,
  openFileAction,
}: GenerateSkillDialogProps) => {
  const { t } = useTranslation(["Common", "Metadata"]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isValidTitle, setIsValidTitle] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [skill, setSkill] = React.useState<TGenerateSkillResult | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const { width, onPointerDown } = usePanelWidth();

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const isBusy = isGenerating || isSaving;
  const canGenerate = !!title.trim() && !!description.trim() && roomId != null;
  const canSave = !!skill?.content.trim() && roomId != null;

  const onClose = () => {
    abortRef.current?.abort();
    setGenerateSkillDialogVisible?.(false);
  };

  const showCreated = (fileId: number | string, fileTitle: string) => {
    const open = async () => {
      toastr.clear(toastId);
      try {
        const file = await getFileInfo(fileId as number);
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

  const onGenerate = async () => {
    const trimmedTitle = title.trim();
    if (!canGenerate || isBusy) return;
    if (!HAS_NAME_CHARS.test(trimmedTitle)) {
      setIsValidTitle(false);
      return;
    }

    const abort = new AbortController();
    abortRef.current = abort;
    setError("");
    setIsGenerating(true);

    try {
      setSkill(
        await generateSkillWithAI(
          { destId: roomId!, title: trimmedTitle, description: description.trim() },
          abort.signal,
        ),
      );
    } catch (e) {
      if (abort.signal.aborted) return;
      setError(
        getGenerateError(t, language, isAdmin, e as TGenerateSkillError),
      );
    }
    setIsGenerating(false);
  };

  const onSave = async () => {
    if (!skill || !canSave || isBusy) return;

    setIsSaving(true);

    try {
      const file = await insertFile(
        roomId!,
        `${skill.name}.md`,
        new Blob([skill.content], { type: "text/markdown" }),
      );
      setGenerateSkillDialogVisible?.(false);
      showCreated(file.id, file.title);
    } catch (e) {
      // The Files service names what it refused: a broken frontmatter after
      // an edit, or the room's skill limit.
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
      // The preview hides the form; the back arrow returns to it and drops
      // the generated text, which "Generate skill" writes anew.
      isBackButton={!!skill}
      onBackClick={isSaving ? undefined : () => setSkill(null)}
      // `style` lands on the dialog element, below the root that resolves
      // `--modal-dialog-aside-default-width` into the aside width, so the
      // resolved variable itself is set here and the aside inherits it.
      style={{ "--modal-dialog-aside-width": `${width}px` } as React.CSSProperties}
      dataTestId="generate-skill-dialog"
    >
      <ModalDialog.Header>{t("Common:CreateSkillWithAI")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div
          className={styles.resizer}
          role="separator"
          aria-orientation="vertical"
          onPointerDown={onPointerDown}
          data-testid="generate-skill-resizer"
        />
        {skill ? (
          <div className={styles.body}>
            <React.Suspense fallback={null}>
              <SkillEditor
                value={skill.content}
                isDisabled={isBusy}
                onChange={(content) => setSkill({ ...skill, content })}
              />
            </React.Suspense>
          </div>
        ) : (
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
              errorMessage={t("Common:SkillNameNeedsLetterOrDigit")}
              isAutoFocussed
              isDisabled={isBusy}
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
                heightTextArea="120px"
                fontSize={13}
                isDisabled={isBusy}
                dataTestId="generate-skill-description"
              />
            </div>
            <Button
              scale
              size={ButtonSize.small}
              icon={<ReactSVG className={styles.runIcon} src={AISvgUrl} />}
              label={t("Common:GenerateSkill")}
              isLoading={isGenerating}
              isDisabled={!canGenerate || isSaving}
              onClick={() => void onGenerate()}
              testId="generate-skill-run-button"
            />
            {error ? (
              <Text className={styles.error} fontSize="12px" lineHeight="16px">
                {error}
              </Text>
            ) : null}
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
          isDisabled={!canSave || isGenerating}
          testId="generate-skill-save"
        />
        <Button
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isSaving}
          testId="generate-skill-cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ authStore, dialogsStore, selectedFolderStore, filesActionsStore }: TStore) => ({
    roomId: selectedFolderStore.id,
    isAdmin: authStore.isAdmin,
    language: authStore.language,
    setGenerateSkillDialogVisible: dialogsStore.setGenerateSkillDialogVisible,
    openFileAction: filesActionsStore.openFileAction,
  }),
)(observer(GenerateSkillDialog));
