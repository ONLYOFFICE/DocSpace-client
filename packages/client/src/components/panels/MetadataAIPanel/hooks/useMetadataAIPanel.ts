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

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  fillMetadataWithAI,
  generateMetadataWithAI,
  getProfileAssignments,
  getProfilesList,
} from "@docspace/shared/api/ai";
import {
  getEntryMetadata,
  setMetadataCustomFields,
  setMetadataValues,
} from "@docspace/shared/api/metadata";
import type { TEntryMetadata } from "@docspace/shared/api/metadata/types";
import type { TMetadataInput } from "@docspace/shared/utils/metadata";

import type {
  TCustomFieldDraft,
  TMetadataSelection,
  TTemplateForm,
} from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/types";
import {
  getChangedValues,
  getEntryKind,
  isTemplateFormValid,
  toCustomFieldDrafts,
} from "SRC_DIR/pages/Home/InfoPanel/Body/views/Metadata/utils";

import type {
  TMetadataAIMode,
  TMetadataAIPhase,
  TMetadataAISummary,
} from "../types";
import {
  applyAICustomValues,
  applyAIValues,
  getFillCustomFieldChanges,
  getFillNotFound,
  getMetadataAIError,
  getMetadataAIModel,
  getMetadataAIServiceLimit,
  getSkippedTitles,
  getSuggestNotFound,
  getTemplateForms,
  isMetadataAINoModel,
  isValidSuggestion,
  revertAICustomValue,
  revertAIValue,
  toCustomFieldRequests,
  toSuggestionDrafts,
  withoutAIChange,
} from "../utils";
import { useUndoHistory } from "./useUndoHistory";

type TUseMetadataAIPanel = {
  item: TMetadataSelection;
  mode: TMetadataAIMode;
  onSaved: () => void;
};

export const useMetadataAIPanel = ({
  item,
  mode,
  onSaved,
}: TUseMetadataAIPanel) => {
  const { t } = useTranslation(["Metadata", "Common"]);

  const [phase, setPhase] = useState<TMetadataAIPhase>("loading");
  const [metadata, setMetadata] = useState<TEntryMetadata | null>(null);
  const [forms, setForms] = useState<TTemplateForm[]>([]);
  const [drafts, setDrafts] = useState<TCustomFieldDraft[]>([]);
  const [summary, setSummary] = useState<TMetadataAISummary | null>(null);
  const [error, setError] = useState("");
  const [serviceLimit, setServiceLimit] =
    useState<ReturnType<typeof getMetadataAIServiceLimit>>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [model, setModel] = useState<string | null | undefined>();

  const controller = useRef<AbortController | null>(null);
  const beforeRun = useRef<{
    forms: TTemplateForm[];
    drafts: TCustomFieldDraft[];
  } | null>(null);
  const history = useUndoHistory<{
    forms: TTemplateForm[];
    drafts: TCustomFieldDraft[];
    summary: TMetadataAISummary | null;
  }>();
  const resetHistory = history.reset;

  const recordStep = (key: string | null = null) =>
    history.record({ forms, drafts, summary }, key);

  const kind = getEntryKind(item);
  const id = Number(item.id);

  useEffect(() => {
    const abort = new AbortController();
    controller.current = abort;

    getEntryMetadata(kind, id, abort.signal)
      .then((data) => {
        setMetadata(data);
        setForms(getTemplateForms(data));
        if (mode === "fill") setDrafts(toCustomFieldDrafts(data.customFields));
      })
      .catch(() => {
        if (!abort.signal.aborted) setError(t("Common:SomethingWentWrong"));
      })
      .finally(() => {
        if (!abort.signal.aborted) setPhase("ready");
      });

    return () => controller.current?.abort();
  }, [kind, id]);

  useEffect(() => {
    let isActive = true;

    Promise.all([getProfilesList(), getProfileAssignments()])
      .then(([profiles, assignments]) => {
        if (isActive) setModel(getMetadataAIModel(profiles, assignments));
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);

  const fill = async (signal: AbortSignal) => {
    const result = await fillMetadataWithAI(
      { kind, id, dryRun: true, overwrite, prompt: prompt.trim() || undefined },
      signal,
    );

    if (!result.sources.length) {
      setError(t("Metadata:AIAllFieldsSet"));
      setPhase("ready");
      return;
    }

    const nextForms = applyAIValues(forms, result.filled, overwrite);
    const nextDrafts = applyAICustomValues(drafts, result.filled);

    setForms(nextForms.forms);
    setDrafts(nextDrafts.drafts);
    setSummary({
      count: nextForms.fieldIds.length + nextDrafts.keys.length,
      notFound: getFillNotFound(result.unresolved, forms),
      skipped: getSkippedTitles(result.skipped),
      filledFieldIds: nextForms.fieldIds,
      filledCustomKeys: nextDrafts.keys,
    });
    setPhase("review");
  };

  const suggest = async (signal: AbortSignal, data: TEntryMetadata) => {
    const result = await generateMetadataWithAI(
      { kind, id, prompt: prompt.trim() || undefined },
      signal,
    );
    const suggestions = toSuggestionDrafts(result.fields, data);

    setDrafts(suggestions);
    setSummary({
      count: suggestions.length,
      notFound: getSuggestNotFound(result.fields, data),
      skipped: getSkippedTitles(result.skipped),
    });
    setPhase("review");
  };

  const runAI = async () => {
    if (!metadata) return;

    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    beforeRun.current = { forms, drafts };
    resetHistory();

    setError("");
    setServiceLimit(null);
    setPhase("analyzing");

    try {
      if (mode === "fill") await fill(abort.signal);
      else await suggest(abort.signal, metadata);
    } catch (e) {
      if (abort.signal.aborted) return;

      const limit = getMetadataAIServiceLimit(e);

      if (limit) setServiceLimit(limit);
      else if (isMetadataAINoModel(e)) setModel(null);
      else setError(getMetadataAIError(t, e));
      setPhase("ready");
    }
  };

  const setInput = (
    templateId: number,
    fieldId: number,
    input: TMetadataInput,
  ) => {
    recordStep(`field:${fieldId}`);
    setForms((prev) =>
      prev.map((form) =>
        form.template.id === templateId
          ? { ...form, inputs: { ...form.inputs, [fieldId]: input } }
          : form,
      ),
    );
  };

  const changeDraft = (draft: TCustomFieldDraft) => {
    recordStep(`custom:${draft.key}`);
    setDrafts((prev) =>
      prev.map((current) => (current.key === draft.key ? draft : current)),
    );
  };

  const removeDraft = (key: string) => {
    recordStep();
    setDrafts((prev) => prev.filter((draft) => draft.key !== key));
  };

  const revertField = (templateId: number, fieldId: number) => {
    recordStep();
    setForms((prev) => revertAIValue(prev, templateId, fieldId));
    setSummary((prev) => prev && withoutAIChange(prev, { fieldId }));
  };

  const revertCustomField = (key: string) => {
    if (!metadata) return;

    recordStep();
    setDrafts((prev) => revertAICustomValue(prev, metadata.customFields, key));
    setSummary((prev) => prev && withoutAIChange(prev, { customKey: key }));
  };

  const restore = (step: ReturnType<typeof history.undo>) => {
    if (!step) return;

    setForms(step.forms);
    setDrafts(step.drafts);
    setSummary(step.summary);
  };

  const undo = () => restore(history.undo({ forms, drafts, summary }));
  const redo = () => restore(history.redo({ forms, drafts, summary }));

  const discard = () => {
    if (phase !== "review" || !beforeRun.current) return;

    resetHistory();
    setForms(beforeRun.current.forms);
    setDrafts(beforeRun.current.drafts);
    setSummary(null);
    setPhase("ready");
  };

  const values = forms.flatMap(getChangedValues);
  const customChanges =
    mode === "fill" && metadata
      ? getFillCustomFieldChanges(metadata.customFields, drafts)
      : [];

  const canSave =
    phase !== "analyzing" &&
    (mode === "fill"
      ? forms.every(isTemplateFormValid) &&
        (values.length > 0 || customChanges.length > 0)
      : !!metadata &&
        toCustomFieldRequests(drafts).length > 0 &&
        drafts.every((draft) => isValidSuggestion(draft, metadata, drafts)));

  const save = async () => {
    setIsSaving(true);

    try {
      if (mode === "fill") {
        if (values.length) await setMetadataValues(kind, id, values);
        if (customChanges.length) {
          await setMetadataCustomFields(kind, id, customChanges);
        }
      } else {
        await setMetadataCustomFields(kind, id, toCustomFieldRequests(drafts));
      }

      toastr.success(t("Common:ChangesSavedSuccessfully"));
      onSaved();
    } catch (e) {
      toastr.error(e as string);
      setIsSaving(false);
    }
  };

  return {
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
    undo,
    redo,
    discard,
    save,
  };
};
