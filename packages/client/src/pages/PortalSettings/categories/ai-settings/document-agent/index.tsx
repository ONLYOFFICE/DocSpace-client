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

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { ComboBox, type TOption } from "@onlyoffice/apps-ui-kit/components/combobox";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { RadioButtonGroup } from "@onlyoffice/apps-ui-kit/components/radio-button-group";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { TextInput, InputSize, InputType } from "@onlyoffice/apps-ui-kit/components/text-input";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";

import type {
  TDocumentAgentReasoning,
  TDocumentAgentSettings,
  TDocumentAgentTaskLog,
} from "@docspace/shared/api/ai/types";

import type AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";

import styles from "./DocumentAgent.module.scss";
import { DocumentAgentLoader } from "./DocumentAgentLoader";

type TDocumentAgentProps = {
  documentAgentInitied?: AISettingsStore["documentAgentInitied"];
  documentAgentSettings?: AISettingsStore["documentAgentSettings"];
  updateDocumentAgentSettings?: AISettingsStore["updateDocumentAgentSettings"];
  resetDocumentAgentSettings?: AISettingsStore["resetDocumentAgentSettings"];
};

const BYTES_PER_MB = 1024 * 1024;

/**
 * The agent's own ceilings (`AGENT_MAX_TOOL_CALLS`, `AGENT_MAX_FILE_BYTES`
 * defaults): a request may only lower them, and a higher value is silently
 * clamped, so the fields stop there.
 */
const MAX_TOOL_CALLS = 150;
const MAX_FILE_MB = 32;
const FIELD_MAX: Record<"maxToolCalls" | "maxFileMb", number> = {
  maxToolCalls: MAX_TOOL_CALLS,
  maxFileMb: MAX_FILE_MB,
};


const asPositiveInt = (value: string): number | null => {
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number > 0 ? number : null;
};

/** Text fields hold strings while being typed; the settings hold numbers. */
type TDraft = Omit<TDocumentAgentSettings, "maxToolCalls" | "maxFileBytes"> & {
  maxToolCalls: string;
  maxFileMb: string;
};

const toDraft = (settings: TDocumentAgentSettings): TDraft => ({
  ...settings,
  maxToolCalls: String(settings.maxToolCalls),
  maxFileMb: String(Math.round(settings.maxFileBytes / BYTES_PER_MB)),
});

const fromDraft = (draft: TDraft): TDocumentAgentSettings | null => {
  const maxToolCalls = asPositiveInt(draft.maxToolCalls);
  const maxFileMb = asPositiveInt(draft.maxFileMb);

  if (maxToolCalls === null || maxFileMb === null) {
    return null;
  }

  const { maxFileMb: _, ...rest } = draft;

  return {
    ...rest,
    maxToolCalls,
    maxFileBytes: maxFileMb * BYTES_PER_MB,
  };
};

const DocumentAgentComponent = ({
  documentAgentInitied,
  documentAgentSettings,
  updateDocumentAgentSettings,
  resetDocumentAgentSettings,
}: TDocumentAgentProps) => {
  const { t } = useTranslation(["Common"]);

  const { useProfilesStore } = useStores();
  const profiles = useProfilesStore((s) => s.profiles);
  const defaultProfile = useProfilesStore((s) => s.defaultProfile);
  const ensureProfiles = useProfilesStore((s) => s.ensureProfiles);

  // The chat starts knowing only its assigned profiles; the model combo box
  // lists the whole catalogue.
  React.useEffect(() => {
    void ensureProfiles();
  }, [ensureProfiles]);

  const [draft, setDraft] = React.useState<TDraft | null>(null);
  const [saveRequestRunning, setSaveRequestRunning] = React.useState(false);

  React.useEffect(() => {
    if (documentAgentSettings) setDraft(toDraft(documentAgentSettings));
  }, [documentAgentSettings]);

  // The portal's default profile first, then the rest of the catalogue.
  const profileOptions = React.useMemo<TOption[]>(
    () => [
      ...(defaultProfile ? [{ key: defaultProfile.id, label: defaultProfile.name }] : []),
      ...profiles
        .filter((profile) => profile.id !== defaultProfile?.id)
        .map((profile) => ({ key: profile.id, label: profile.name })),
    ],
    [profiles, defaultProfile],
  );

  const reasoningOptions = React.useMemo<TOption[]>(
    () => [
      { key: "default", label: t("Common:DocumentAgentReasoningDefault") },
      { key: "off", label: t("Common:DocumentAgentReasoning_off") },
      { key: "low", label: t("Common:DocumentAgentReasoning_low") },
      { key: "medium", label: t("Common:DocumentAgentReasoning_medium") },
      { key: "high", label: t("Common:DocumentAgentReasoning_high") },
      { key: "max", label: t("Common:DocumentAgentReasoning_max") },
    ],
    [t],
  );

  if (!documentAgentInitied || !draft) return <DocumentAgentLoader />;

  const patch = (changes: Partial<TDraft>) =>
    setDraft((prev) => (prev ? { ...prev, ...changes } : prev));

  // Digits only, and nothing above the agent's ceiling: a larger number
  // is refused as typed, the field keeps its value.
  const onText =
    (field: "maxToolCalls" | "maxFileMb") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (value !== "" && !/^\d+$/.test(value)) return;
      if (value !== "" && Number(value) > FIELD_MAX[field]) return;
      patch({ [field]: value });
    };

  const parsed = fromDraft(draft);
  const isDirty =
    !!documentAgentSettings &&
    JSON.stringify(toDraft(documentAgentSettings)) !== JSON.stringify(draft);
  const isSaveDisabled = !parsed || !isDirty || saveRequestRunning;

  const onSave = async () => {
    if (!parsed) return;

    setSaveRequestRunning(true);
    try {
      await updateDocumentAgentSettings?.(parsed);
      toastr.success(t("Common:ChangesSavedSuccessfully"));
    } catch (e) {
      console.error(e);
      toastr.error(e as string);
    }
    setSaveRequestRunning(false);
  };

  const onReset = async () => {
    setSaveRequestRunning(true);
    try {
      await resetDocumentAgentSettings?.();
      toastr.success(t("Common:ChangesSavedSuccessfully"));
    } catch (e) {
      console.error(e);
      toastr.error(e as string);
    }
    setSaveRequestRunning(false);
  };

  // Nothing chosen yet, or a profile that is gone, shows as the portal's
  // default; the setting stays null until a model is picked by hand.
  const selectedProfile =
    profileOptions.find((option) => option.key === draft.profileId) ??
    profileOptions[0] ??
    ({ key: "none", label: t("Common:SelectAction") } as TOption);
  const selectedReasoning =
    reasoningOptions.find((option) => option.key === draft.reasoning) ?? reasoningOptions[0];

  const fieldsDisabled = !draft.enabled || saveRequestRunning;

  const numberField = (
    label: string,
    field: "maxToolCalls" | "maxFileMb",
    hint: string,
  ) => {
    const value = draft[field];
    const hasError = asPositiveInt(value) === null;

    return (
      <FieldContainer labelVisible isVertical labelText={label} removeMargin hasError={hasError}>
        <TextInput
          type={InputType.text}
          inputMode="numeric"
          size={InputSize.base}
          scale
          value={value}
          maxLength={String(FIELD_MAX[field]).length}
          onChange={onText(field)}
          isDisabled={fieldsDisabled}
          hasError={hasError}
          testId={`document-agent-${field}-input`}
        />
        <Text className={styles.hint}>{hint}</Text>
      </FieldContainer>
    );
  };

  const taskLogOptions = (
    [
      ["never", t("Common:DocumentAgentTaskLogNever")],
      ["onFailure", t("Common:DocumentAgentTaskLogOnFailure")],
      ["always", t("Common:DocumentAgentTaskLogAlways")],
    ] as [TDocumentAgentTaskLog, string][]
  ).map(([value, label]) => ({ value, label, dataTestId: `document-agent-tasklog-${value}` }));

  return (
    <div className={styles.container} data-testid="document-agent-settings">
      <Text className={styles.description} lineHeight="20px">
        {t("Common:DocumentAgentDescription")}
      </Text>

      <div className={styles.toggleBox}>
        <ToggleButton
          className={styles.toggle}
          isChecked={draft.enabled}
          onChange={() => patch({ enabled: !draft.enabled })}
          isDisabled={saveRequestRunning}
          dataTestId="document-agent-enabled-toggle"
        />
        <div className={styles.toggleCaption}>
          <Text fontWeight={600} lineHeight="20px" noSelect>
            {t("Common:DocumentAgentEnable")}
          </Text>
          <Text fontSize="12px" lineHeight="16px">
            {t("Common:DocumentAgentEnableHint")}
          </Text>
        </div>
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionTitle} fontSize="16px" fontWeight={700} lineHeight="22px">
          {t("Common:DocumentAgentModelSection")}
        </Text>

        <FieldContainer labelVisible isVertical labelText={t("Common:AIAgentModel")} removeMargin>
          <ComboBox
            options={profileOptions}
            selectedOption={selectedProfile}
            onSelect={(option) => patch({ profileId: String(option.key) })}
            scaled
            scaledOptions
            dropDownMaxHeight={profileOptions.length > 7 ? 300 : undefined}
            isDefaultMode
            displaySelectedOption
            isDisabled={fieldsDisabled}
            dataTestId="document-agent-profile-combobox"
          />
          <Text className={styles.hint}>{t("Common:DocumentAgentModelHint")}</Text>
        </FieldContainer>

        <FieldContainer
          labelVisible
          isVertical
          labelText={t("Common:DocumentAgentReasoning")}
          removeMargin
        >
          <ComboBox
            options={reasoningOptions}
            selectedOption={selectedReasoning}
            onSelect={(option) => patch({ reasoning: option.key as TDocumentAgentReasoning })}
            scaled
            scaledOptions
            isDefaultMode
            displaySelectedOption
            isDisabled={fieldsDisabled}
            dataTestId="document-agent-reasoning-combobox"
          />
          <Text className={styles.hint}>{t("Common:DocumentAgentReasoningHint")}</Text>
        </FieldContainer>
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionTitle} fontSize="16px" fontWeight={700} lineHeight="22px">
          {t("Common:DocumentAgentLimitsSection")}
        </Text>

        {numberField(
          t("Common:DocumentAgentMaxToolCalls"),
          "maxToolCalls",
          t("Common:DocumentAgentMaxToolCallsHint"),
        )}
        {numberField(
          t("Common:DocumentAgentMaxFileSize"),
          "maxFileMb",
          t("Common:DocumentAgentMaxFileSizeHint"),
        )}
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionTitle} fontSize="16px" fontWeight={700} lineHeight="22px">
          {t("Common:DocumentAgentResultsSection")}
        </Text>

        <FieldContainer
          labelVisible
          isVertical
          labelText={t("Common:DocumentAgentTaskLog")}
          removeMargin
        >
          <RadioButtonGroup
            className={styles.radioGroup}
            name="document-agent-tasklog"
            orientation="vertical"
            spacing="12px"
            fontSize="13px"
            options={taskLogOptions}
            selected={draft.taskLog}
            onClick={(e) => patch({ taskLog: e.target.value as TDocumentAgentTaskLog })}
            isDisabled={fieldsDisabled}
            dataTestId="document-agent-tasklog-group"
          />
          <Text className={styles.hint}>{t("Common:DocumentAgentTaskLogHint")}</Text>
        </FieldContainer>
      </div>

      <div className={styles.buttonContainer}>
        <Button
          primary
          size={ButtonSize.small}
          label={t("Common:SaveButton")}
          scale={false}
          onClick={onSave}
          isLoading={saveRequestRunning}
          isDisabled={isSaveDisabled}
          testId="document-agent-save-button"
        />
        <Button
          size={ButtonSize.small}
          label={t("Common:ResetSettings")}
          scale={false}
          onClick={onReset}
          isDisabled={saveRequestRunning}
          testId="document-agent-reset-button"
        />
      </div>
    </div>
  );
};

export const DocumentAgent = inject(({ aiSettingsStore }: TStore) => {
  return {
    documentAgentInitied: aiSettingsStore.documentAgentInitied,
    documentAgentSettings: aiSettingsStore.documentAgentSettings,
    updateDocumentAgentSettings: aiSettingsStore.updateDocumentAgentSettings,
    resetDocumentAgentSettings: aiSettingsStore.resetDocumentAgentSettings,
  };
})(observer(DocumentAgentComponent));

export { DocumentAgentLoader };
