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

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Checkbox } from "@onlyoffice/apps-ui-kit/components/checkbox";
import { Loader, LoaderTypes } from "@onlyoffice/apps-ui-kit/components/loader";
import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Textarea } from "@onlyoffice/apps-ui-kit/components/textarea";

import type { TMetadataSelection } from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/types";
import { useStore } from "SRC_DIR/store/useStore";

import { useMetadataAIPanel } from "./hooks/useMetadataAIPanel";
import type { TMetadataAIMode } from "./types";
import { METADATA_AI_PROMPT_MAX_LENGTH } from "./utils";
import AICallout from "./sub-components/AICallout";
import CustomFieldList from "./sub-components/CustomFieldList";
import FillForms from "./sub-components/FillForms";
import ReviewNotes from "./sub-components/ReviewNotes";
import styles from "./MetadataAIPanel.module.scss";

type MetadataAIDialogProps = {
  item: TMetadataSelection;
  mode: TMetadataAIMode;
  onClose: () => void;
};

const MetadataAIDialog = ({ item, mode, onClose }: MetadataAIDialogProps) => {
  const { t } = useTranslation(["Metadata", "Files", "Common"]);

  const {
    phase,
    metadata,
    forms,
    drafts,
    summary,
    error,
    isSaving,
    canSave,
    prompt,
    overwrite,
    setPrompt,
    setOverwrite,
    runAI,
    setInput,
    changeDraft,
    removeDraft,
    save,
  } = useMetadataAIPanel({ item, mode, onClose });

  const isFill = mode === "fill";
  const isAnalyzing = phase === "analyzing";
  const isReview = phase === "review" && !!summary;
  const hasNothingToFill =
    isFill && phase !== "loading" && !forms.length && !drafts.length;

  const customFields = metadata ? (
    <CustomFieldList
      drafts={drafts}
      metadata={metadata}
      onChange={changeDraft}
      onRemove={removeDraft}
    />
  ) : null;

  const getTitle = () => {
    if (isFill) {
      if (isAnalyzing) return t("Metadata:AIFillingTitle");
      if (isReview) return t("Metadata:AIReviewAutofill");

      return t("Files:FillMetadataWithAI");
    }

    return isReview
      ? t("Metadata:AIReviewSuggestions")
      : t("Files:SuggestMetadataWithAI");
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
      displayType={ModalDialogType.aside}
      onClose={onClose}
      dataTestId="metadata_ai_panel"
    >
      <ModalDialog.Header>{getTitle()}</ModalDialog.Header>

      <ModalDialog.Body>
        {phase === "loading" ? (
          loader
        ) : (
          <div className={styles.body}>
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
                  buttonLabel={
                    isFill
                      ? t("Metadata:FillWithAI")
                      : t("Metadata:SuggestMetadata")
                  }
                  error={
                    error || (hasNothingToFill ? t("Metadata:AINothingToFill") : "")
                  }
                  isDisabled={isAnalyzing || isSaving || hasNothingToFill}
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
                forms={forms}
                customFields={drafts.length ? customFields : null}
                isAnalyzing={isAnalyzing}
                onChange={setInput}
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
          onClick={save}
          testId="metadata_ai_save_button"
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={isReview ? t("Metadata:Discard") : t("Common:CancelButton")}
          isDisabled={isSaving}
          onClick={onClose}
          testId="metadata_ai_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const MetadataAIPanel = () => {
  const { metadataAIPanelData, setMetadataAIPanelData } =
    useStore("dialogsStore");

  if (!metadataAIPanelData.visible) return null;

  return (
    <MetadataAIDialog
      item={metadataAIPanelData.item}
      mode={metadataAIPanelData.mode}
      onClose={() => setMetadataAIPanelData({ visible: false })}
    />
  );
};

export default observer(MetadataAIPanel);
