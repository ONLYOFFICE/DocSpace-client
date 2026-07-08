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

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { TextInput, InputType } from "@docspace/ui-kit/components/text-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { toastr } from "@docspace/ui-kit/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import type {
  TDocsConnectInfo,
  TDocsConnectConfigUpdate,
} from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import AddRuleDialog from "./sub-components/AddRuleDialog";

import styles from "./TenantPanel.module.scss";

type TAccessRule = {
  key: string;
  type: "allow" | "deny";
  value: string;
};

type TGeneralState = {
  header: string;
  secret: string;
  wopiEnabled: boolean;
  anonymous: boolean;
};

interface SettingsProps {
  info?: TDocsConnectInfo;
  copyToClipboard?: (value: string, t: TTranslation) => void;
  updateConfig?: (data: TDocsConnectConfigUpdate) => Promise<void>;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const Settings = ({ info, copyToClipboard, updateConfig }: SettingsProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  const [baseline, setBaseline] = useState<TGeneralState>(() => ({
    header: info?.config.security.header ?? "",
    secret: info?.config.security.secret ?? "",
    wopiEnabled: info?.config.wopi?.enable ?? false,
    anonymous: info?.config.server.isAnonymousSupport ?? false,
  }));
  const [general, setGeneral] = useState<TGeneralState>(baseline);
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  const [rules, setRules] = useState<TAccessRule[]>(() =>
    (info?.config.ipFilter?.rules ?? []).map((rule, index) => ({
      key: `${index}-${rule.address ?? ""}`,
      type: rule.allowed ? "allow" : "deny",
      value: rule.address ?? "",
    })),
  );
  const [addRuleDialogVisible, setAddRuleDialogVisible] = useState(false);
  const [ipFilteringEnabled, setIpFilteringEnabled] = useState(
    () => (info?.config.ipFilter?.rules ?? []).length > 0,
  );

  const [savedMaxDownload, setSavedMaxDownload] = useState(() =>
    info?.config.server.fileSizeLimit != null
      ? String(info.config.server.fileSizeLimit)
      : "",
  );
  const [maxDownloadBytes, setMaxDownloadBytes] = useState(savedMaxDownload);
  const [isSavingLimit, setIsSavingLimit] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);

  if (!info) return null;

  const isBusy = isSavingGeneral || isSavingLimit || isSavingRules;

  const hasChangesGeneral =
    general.header !== baseline.header ||
    general.secret !== baseline.secret ||
    general.wopiEnabled !== baseline.wopiEnabled ||
    general.anonymous !== baseline.anonymous;

  const hasChangesLimit = maxDownloadBytes !== savedMaxDownload;

  const serverPayload = (anonymous: boolean, maxDownload: string) => ({
    isAnonymousSupport: anonymous,
    fileSizeLimit: Number(maxDownload) || 0,
  });

  const onSaveGeneral = async () => {
    setIsSavingGeneral(true);
    try {
      await updateConfig?.({
        security: { secret: general.secret, header: general.header },
        wopi: { enable: general.wopiEnabled },
        server: serverPayload(general.anonymous, savedMaxDownload),
      });
      setBaseline(general);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const onCancelGeneral = () => {
    setGeneral(baseline);
  };

  const onSaveLimit = async () => {
    setIsSavingLimit(true);
    try {
      await updateConfig?.({
        server: serverPayload(baseline.anonymous, maxDownloadBytes),
      });
      setSavedMaxDownload(maxDownloadBytes);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsSavingLimit(false);
    }
  };

  const onCancelLimit = () => {
    setMaxDownloadBytes(savedMaxDownload);
  };

  const persistRules = async (next: TAccessRule[]) => {
    const prev = rules;
    setRules(next);
    setIsSavingRules(true);
    try {
      await updateConfig?.({
        ipFilter: {
          rules: next.map((rule) => ({
            address: rule.value,
            allowed: rule.type === "allow",
          })),
        },
      });
    } catch (e) {
      setRules(prev);
      toastr.error(e as Error);
    } finally {
      setIsSavingRules(false);
    }
  };

  const onAddRule = (type: "allow" | "deny", value: string) => {
    persistRules([...rules, { key: `${Date.now()}`, type, value }]);
  };

  const onDeleteRule = (key: string) => {
    persistRules(rules.filter((rule) => rule.key !== key));
  };

  const onToggleIpFiltering = () => {
    if (ipFilteringEnabled) {
      setIpFilteringEnabled(false);
      if (rules.length > 0) persistRules([]);
    } else {
      setIpFilteringEnabled(true);
    }
  };

  const limitField = (
    label: string,
    value: string,
    hint: string,
    onChange: (value: string) => void,
    onBlur?: () => void,
  ) => (
    <FieldContainer
      isVertical
      removeMargin
      labelVisible
      labelText={label}
      className={styles.limitField}
    >
      <TextInput
        type={InputType.text}
        value={value}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
        onBlur={onBlur}
        isDisabled={isBusy}
        scale
      />
      <Text fontSize="12px" className={styles.settingsHint}>
        {hint}
      </Text>
    </FieldContainer>
  );

  return (
    <div className={styles.settings}>
      <Text fontSize="16px" fontWeight={700}>
        {t("Common:SettingsGeneral")}
      </Text>

      <div className={styles.settingsRow}>
        <FieldContainer
          isVertical
          removeMargin
          labelVisible
          labelText={t("DocsConnect:JwtHeader")}
        >
          <TextInput
            type={InputType.text}
            value={general.header}
            onChange={(e) =>
              setGeneral((prev) => ({ ...prev, header: e.target.value }))
            }
            isDisabled={isBusy}
            scale
          />
        </FieldContainer>
        <FieldContainer
          isVertical
          removeMargin
          labelVisible
          labelText={t("DocsConnect:SecretKeyLabel")}
        >
          <div className={styles.secretField}>
            <TextInput
              type={secretRevealed ? InputType.text : InputType.password}
              value={general.secret}
              onChange={(e) =>
                setGeneral((prev) => ({ ...prev, secret: e.target.value }))
              }
              isDisabled={isBusy}
              scale
              className={styles.secretInput}
            />
            <div className={styles.secretIcons}>
              <IconButton
                iconName={secretRevealed ? EyeReactSvgUrl : EyeOffReactSvgUrl}
                size={16}
                onClick={() => setSecretRevealed((prev) => !prev)}
              />
              <IconButton
                iconName={CopyReactSvgUrl}
                size={16}
                onClick={() => copyToClipboard?.(general.secret, t)}
              />
            </div>
          </div>
        </FieldContainer>
      </div>

      <div className={styles.toggleGroup}>
        <Text fontWeight={600}>{t("DocsConnect:Wopi")}</Text>
        <div className={styles.toggleCard}>
          <div className={styles.toggleControl}>
            <ToggleButton
              label={t("DocsConnect:EnableWopi")}
              fontWeight={600}
              isChecked={general.wopiEnabled}
              isDisabled={isBusy}
              onChange={() =>
                setGeneral((prev) => ({
                  ...prev,
                  wopiEnabled: !prev.wopiEnabled,
                }))
              }
            />
          </div>
          <Text fontSize="13px" className={styles.toggleDescription}>
            {t("DocsConnect:EnableWopiDescription")}
          </Text>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <Text fontWeight={600}>{t("DocsConnect:AnonymousSupport")}</Text>
        <Text fontSize="13px" className={styles.settingsHint}>
          {t("DocsConnect:AnonymousSupportDescription")}
        </Text>
        <RadioButtonGroup
          className={styles.radioGroup}
          name="docs-connect-anonymous"
          orientation="vertical"
          spacing="12px"
          fontWeight={600}
          isDisabled={isBusy}
          selected={general.anonymous ? "yes" : "no"}
          onClick={(e) =>
            setGeneral((prev) => ({
              ...prev,
              anonymous: e.target.value === "yes",
            }))
          }
          options={[
            {
              value: "yes",
              label: (
                <>
                  {t("Common:Yes")}{" "}
                  <span className={styles.radioHint}>
                    {t("DocsConnect:AnonymousYesHint")}
                  </span>
                </>
              ),
            },
            {
              value: "no",
              label: (
                <>
                  {t("Common:No")}{" "}
                  <span className={styles.radioHint}>
                    {t("DocsConnect:AnonymousNoHint")}
                  </span>
                </>
              ),
            },
          ]}
        />
      </div>

      <SaveCancelButtons
        className={styles.saveButtons}
        onSaveClick={onSaveGeneral}
        onCancelClick={onCancelGeneral}
        showReminder={hasChangesGeneral}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        isSaving={isSavingGeneral}
        displaySettings
      />

      <Text fontSize="16px" fontWeight={700}>
        {t("DocsConnect:IpFiltering")}
      </Text>

      <div className={styles.toggleCard}>
        <div className={styles.toggleControl}>
          <ToggleButton
            label={t("DocsConnect:UseIpFiltering")}
            fontWeight={600}
            isChecked={ipFilteringEnabled}
            isDisabled={isBusy}
            onChange={onToggleIpFiltering}
          />
        </div>
        <Text fontSize="13px" className={styles.toggleDescription}>
          {t("DocsConnect:UseIpFilteringDescription")}
        </Text>
      </div>

      {ipFilteringEnabled ? (
        <>
          <div className={styles.settingsGroup}>
            <Text fontWeight={600}>{t("DocsConnect:AccessRules")}</Text>
            <Text fontSize="13px" className={styles.settingsHint}>
              {t("DocsConnect:AccessRulesDescription")}
            </Text>
          </div>

          {rules.length > 0 ? (
            <div className={styles.rulesList}>
              {rules.map((rule) => (
                <div key={rule.key} className={styles.ruleRow}>
                  <span
                    className={`${styles.ruleBadge} ${
                      rule.type === "deny" ? styles.ruleBadgeDeny : ""
                    }`}
                  >
                    {rule.type === "allow"
                      ? t("DocsConnect:RuleAllow")
                      : t("DocsConnect:RuleDeny")}
                  </span>
                  <Text className={styles.ruleValue}>{rule.value}</Text>
                  <IconButton
                    iconName={TrashReactSvgUrl}
                    size={16}
                    isDisabled={isBusy}
                    onClick={() => onDeleteRule(rule.key)}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div>
            <Button
              primary
              size={ButtonSize.small}
              label={t("DocsConnect:AddRule")}
              isDisabled={isBusy}
              onClick={() => setAddRuleDialogVisible(true)}
            />
          </div>

          {addRuleDialogVisible ? (
            <AddRuleDialog
              visible
              onClose={() => setAddRuleDialogVisible(false)}
              onAdd={onAddRule}
            />
          ) : null}
        </>
      ) : null}

      <div className={styles.settingsGroup}>
        <Text fontSize="16px" fontWeight={700}>
          {t("DocsConnect:FileSizeLimits")}
        </Text>
        <Text fontSize="13px" className={styles.settingsHint}>
          {t("DocsConnect:FileSizeLimitsDescription")}
        </Text>
      </div>

      <Text fontWeight={600}>{t("DocsConnect:DownloadLimits")}</Text>

      {limitField(
        t("DocsConnect:MaxDownloadBytes"),
        maxDownloadBytes,
        t("DocsConnect:MaxDownloadBytesDescription"),
        setMaxDownloadBytes,
      )}

      <SaveCancelButtons
        className={styles.saveButtons}
        onSaveClick={onSaveLimit}
        onCancelClick={onCancelLimit}
        showReminder={hasChangesLimit}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        isSaving={isSavingLimit}
        displaySettings
      />
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  copyToClipboard: docsConnectStore.copyToClipboard,
  updateConfig: docsConnectStore.updateConfig,
}))(observer(Settings));

