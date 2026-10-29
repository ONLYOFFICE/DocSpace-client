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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Checkbox } from "@onlyoffice/apps-ui-kit/components/checkbox";
import { Loader, LoaderTypes } from "@onlyoffice/apps-ui-kit/components/loader";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";
import { getServiceLimitDescription } from "@docspace/shared/utils/ai";

import type { TMetadataSelection } from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/types";
import { useStore } from "SRC_DIR/store/useStore";

import { useMetadataAIPanel } from "./hooks/useMetadataAIPanel";
import { useScrollToTop } from "./hooks/useScrollToTop";
import type { TMetadataAIMode } from "./types";
import { isSameEntry, METADATA_AI_PROMPT_MAX_LENGTH } from "./utils";
import AICallout from "./sub-components/AICallout";
import CustomFieldList from "./sub-components/CustomFieldList";
import FillForms from "./sub-components/FillForms";
import ReviewNotes from "./sub-components/ReviewNotes";
import ServiceLimitNotice from "./sub-components/ServiceLimitNotice";
import styles from "./MetadataAIPanel.module.scss";

type MetadataAIDialogProps = {
  item: TMetadataSelection;
  mode: TMetadataAIMode;
  onClose: () => void;
  onSaved: () => void;
};

const MetadataAIDialog = ({
  item,
  mode,
  onClose,
  onSaved,
}: MetadataAIDialogProps) => {
  const { t } = useTranslation(["Metadata", "Files", "Common"]);
  const { isAdmin, language } = useStore("authStore");
  const navigate = useNavigate();

  const {
    phase,
    metadata,
    forms,
    drafts,
    summary,
    error,
    serviceLimit,
    isSaving,
    canSave,
    prompt,
    overwrite,
    model,
    setPrompt,
    setOverwrite,
    runAI,
    setInput,
    changeDraft,
    removeDraft,
    revertField,
    revertCustomField,
    discard,
    save,
  } = useMetadataAIPanel({ item, mode, onSaved });

  const isFill = mode === "fill";
  const isAnalyzing = phase === "analyzing";
  const isReview = phase === "review" && !!summary;
  const bodyRef = useScrollToTop(isReview);
  const hasNothingToFill =
    isFill && phase !== "loading" && !forms.length && !drafts.length;
  const hasNoModel = model === null;

  const getCalloutError = () => {
    if (error) return error;
    if (hasNoModel) return t("Metadata:AINoModel");
    if (hasNothingToFill) return t("Metadata:AINothingToFill");

    return "";
  };

  const getServiceLimitNotice = () => {
    if (!serviceLimit) return undefined;

    const openLimits = () => {
      onClose();
      navigate("/portal-settings/ai-settings/limits");
    };

    return (
      <ServiceLimitNotice
        title={t("Common:AILimitReached")}
        description={getServiceLimitDescription(
          t,
          language,
          serviceLimit,
          isAdmin,
        )}
        buttonLabel={t("Common:ChangeAILimit")}
        onClick={isAdmin ? openLimits : undefined}
      />
    );
  };

  const customFields = metadata ? (
    <CustomFieldList
      drafts={drafts}
      metadata={metadata}
      filledKeys={summary?.filledCustomKeys}
      onChange={changeDraft}
      onRemove={isFill ? undefined : removeDraft}
      onRevert={isFill ? revertCustomField : undefined}
    />
  ) : null;

  const getTitle = () => {
    if (isFill) {
      if (isAnalyzing) return t("Metadata:AIFillingTitle");
      if (isReview) return t("Metadata:AIReviewAutofill");

      return t("Files:FillMetadata");
    }

    return isReview
      ? t("Metadata:AIReviewSuggestions")
      : t("Files:GenerateMetadata");
  };

  const submit = () => {
    if (canSave && !isSaving) save();
  };

  const loader = (
    <div className={styles.loader}>
      <Loader type={LoaderTypes.track} size="64px" />
    </div>
  );

  return (
    <ModalDialog
      visible
      withBodyScroll
      withoutPadding
      withForm
      displayType={ModalDialogType.aside}
      isBackButton={isReview}
      isCloseable={!isSaving}
      onBackClick={isSaving ? undefined : discard}
      onClose={isReview ? discard : onClose}
      onSubmit={submit}
      dataTestId="metadata_ai_panel"
    >
      <ModalDialog.Header>{getTitle()}</ModalDialog.Header>

      <ModalDialog.Body>
        {phase === "loading" ? (
          loader
        ) : (
          <div ref={bodyRef} className={styles.body} inert={isSaving}>
            <div className={styles.top}>
              {isReview ? (
                <ReviewNotes mode={mode} summary={summary} />
              ) : (
                <AICallout
                  title={
                    isFill
                      ? t("Files:FillMetadataWithAI")
                      : t("Files:SuggestMetadataWithAI")
                  }
                  description={
                    isFill
                      ? t("Metadata:AIFillDescription")
                      : t("Metadata:AISuggestDescription")
                  }
                  model={model ? t("Metadata:AIModel", { model }) : undefined}
                  buttonLabel={
                    isFill
                      ? t("Metadata:FillWithAI")
                      : t("Metadata:SuggestMetadata")
                  }
                  error={getCalloutError()}
                  notice={getServiceLimitNotice()}
                  isDisabled={
                    isAnalyzing ||
                    isSaving ||
                    hasNothingToFill ||
                    hasNoModel ||
                    !metadata
                  }
                  onClick={runAI}
                >
                  <Textarea
                    wrapperClassName={styles.prompt}
                    className={styles.promptField}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t("Metadata:AIPromptPlaceholder")}
                    maxLength={METADATA_AI_PROMPT_MAX_LENGTH}
                    heightTextArea="64px"
                    fontSize={13}
                    isDisabled={isAnalyzing}
                    dataTestId="metadata_ai_prompt_textarea"
                  />
                  {isFill ? (
                    <Checkbox
                      label={t("Metadata:OverwriteExistingValues")}
                      isChecked={overwrite}
                      isDisabled={isAnalyzing}
                      onChange={() => setOverwrite(!overwrite)}
                      dataTestId="metadata_ai_overwrite_checkbox"
                    />
                  ) : null}
                </AICallout>
              )}
            </div>

            {isFill ? (
              <FillForms
                metadata={metadata}
                forms={forms}
                filledFieldIds={summary?.filledFieldIds}
                customFields={drafts.length ? customFields : null}
                isAnalyzing={isAnalyzing}
                isReadOnly={!isReview}
                onChange={setInput}
                onRevert={revertField}
              />
            ) : null}

            {!isFill && isAnalyzing ? loader : null}

            {!isFill && isReview ? customFields : null}
          </div>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Metadata:SaveChanges")}
          isDisabled={!canSave}
          isLoading={isSaving}
          type="submit"
          testId="metadata_ai_save_button"
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={isReview ? t("Metadata:Discard") : t("Common:CancelButton")}
          isDisabled={isSaving}
          onClick={isReview ? discard : onClose}
          testId="metadata_ai_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const MetadataAIPanel = () => {
  const { metadataAIPanelData, setMetadataAIPanelData } =
    useStore("dialogsStore");
  const infoPanelStore = useStore("infoPanelStore");

  if (!metadataAIPanelData.visible) return null;

  const { item } = metadataAIPanelData;

  const close = () => setMetadataAIPanelData({ visible: false });

  const onSaved = () => {
    close();

    if (isSameEntry(infoPanelStore.infoPanelSelection, item)) {
      infoPanelStore.openMetadataTab();
    }
  };

  return (
    <MetadataAIDialog
      item={item}
      mode={metadataAIPanelData.mode}
      onClose={close}
      onSaved={onSaved}
    />
  );
};

export default observer(MetadataAIPanel);
