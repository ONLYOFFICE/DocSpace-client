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
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { ComboBox } from "@docspace/ui-kit/components/combobox";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

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
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const Settings = ({ info, copyToClipboard }: SettingsProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  const [baseline, setBaseline] = useState<TGeneralState>(() => ({
    header: info?.config.security.header ?? "",
    secret: info?.config.security.secret ?? "",
    wopiEnabled: true,
    anonymous: info?.config.server.isAnonymousSupport ?? false,
  }));
  const [general, setGeneral] = useState<TGeneralState>(baseline);
  const [secretRevealed, setSecretRevealed] = useState(false);

  const [rules, setRules] = useState<TAccessRule[]>([]);
  const [addingRule, setAddingRule] = useState(false);
  const [newRuleType, setNewRuleType] = useState<"allow" | "deny">("allow");
  const [newRuleValue, setNewRuleValue] = useState("");

  const [requestFiltering, setRequestFiltering] = useState({
    useIpFiltering: false,
    allowPrivateIp: false,
    allowMetaIp: false,
  });

  const [limits, setLimits] = useState({
    maxDownloadBytes: "104857600",
    word: "100",
    excel: "100",
    powerPoint: "100",
    visio: "100",
  });

  if (!info) return null;

  const hasChanges =
    general.header !== baseline.header ||
    general.secret !== baseline.secret ||
    general.wopiEnabled !== baseline.wopiEnabled ||
    general.anonymous !== baseline.anonymous;

  const onSave = () => {
    setBaseline(general);
  };

  const onCancel = () => {
    setGeneral(baseline);
  };

  const ruleTypeOptions = [
    { key: "allow", label: t("DocsConnect:RuleAllow") },
    { key: "deny", label: t("DocsConnect:RuleDeny") },
  ];

  const onAddRule = () => {
    const value = newRuleValue.trim();
    if (!value) return;

    setRules((prev) => [
      ...prev,
      { key: `${Date.now()}`, type: newRuleType, value },
    ]);
    setNewRuleValue("");
    setNewRuleType("allow");
    setAddingRule(false);
  };

  const onDeleteRule = (key: string) => {
    setRules((prev) => prev.filter((rule) => rule.key !== key));
  };

  const limitField = (
    label: string,
    value: string,
    hint: string,
    onChange: (value: string) => void,
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

      <div className={styles.wopiGroup}>
        <Text fontWeight={600}>{t("DocsConnect:Wopi")}</Text>
        <div className={styles.wopiCard}>
          <div className={styles.wopiToggle}>
            <ToggleButton
              label={t("DocsConnect:EnableWopi")}
              fontWeight={600}
              isChecked={general.wopiEnabled}
              onChange={() =>
                setGeneral((prev) => ({
                  ...prev,
                  wopiEnabled: !prev.wopiEnabled,
                }))
              }
            />
          </div>
          <Text fontSize="13px" className={styles.wopiDescription}>
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

      <div className={styles.settingsButtons}>
        <Button
          primary
          size={ButtonSize.small}
          label={t("Common:SaveButton")}
          isDisabled={!hasChanges}
          onClick={onSave}
        />
        <Button
          size={ButtonSize.small}
          label={t("Common:CancelButton")}
          isDisabled={!hasChanges}
          onClick={onCancel}
        />
      </div>

      <Text fontSize="16px" fontWeight={700}>
        {t("DocsConnect:IpFiltering")}
      </Text>

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
                onClick={() => onDeleteRule(rule.key)}
              />
            </div>
          ))}
        </div>
      ) : null}

      {addingRule ? (
        <div className={styles.addRuleRow}>
          <ComboBox
            options={ruleTypeOptions}
            selectedOption={
              ruleTypeOptions.find((option) => option.key === newRuleType) ??
              ruleTypeOptions[0]
            }
            onSelect={(option) =>
              setNewRuleType(option.key === "deny" ? "deny" : "allow")
            }
            scaled={false}
          />
          <TextInput
            type={InputType.text}
            value={newRuleValue}
            onChange={(e) => setNewRuleValue(e.target.value)}
            placeholder="192.168.1.0/24"
            scale
          />
          <Button
            primary
            size={ButtonSize.small}
            label={t("Common:AddButton")}
            isDisabled={!newRuleValue.trim()}
            onClick={onAddRule}
          />
          <Button
            size={ButtonSize.small}
            label={t("Common:CancelButton")}
            onClick={() => {
              setAddingRule(false);
              setNewRuleValue("");
            }}
          />
        </div>
      ) : (
        <div>
          <Button
            primary
            size={ButtonSize.small}
            label={t("DocsConnect:AddRule")}
            onClick={() => setAddingRule(true)}
          />
        </div>
      )}

      <div className={styles.settingsGroup}>
        <Text fontWeight={600}>{t("DocsConnect:RequestFiltering")}</Text>
        <Text fontSize="13px" className={styles.settingsHint}>
          {t("DocsConnect:RequestFilteringDescription")}
        </Text>
      </div>

      <div className={styles.checkboxGroup}>
        <div className={styles.checkboxItem}>
          <Checkbox
            label={t("DocsConnect:UseIpFiltering")}
            isChecked={requestFiltering.useIpFiltering}
            onChange={() =>
              setRequestFiltering((prev) => ({
                ...prev,
                useIpFiltering: !prev.useIpFiltering,
              }))
            }
          />
          <Text fontSize="13px" className={styles.settingsHint}>
            {t("DocsConnect:UseIpFilteringDescription")}
          </Text>
        </div>
        <div className={styles.checkboxItem}>
          <Checkbox
            label={t("DocsConnect:AllowPrivateIp")}
            isChecked={requestFiltering.allowPrivateIp}
            onChange={() =>
              setRequestFiltering((prev) => ({
                ...prev,
                allowPrivateIp: !prev.allowPrivateIp,
              }))
            }
          />
          <Text fontSize="13px" className={styles.settingsHint}>
            {t("DocsConnect:AllowPrivateIpDescription")}
          </Text>
        </div>
        <div className={styles.checkboxItem}>
          <Checkbox
            label={t("DocsConnect:AllowMetaIp")}
            isChecked={requestFiltering.allowMetaIp}
            onChange={() =>
              setRequestFiltering((prev) => ({
                ...prev,
                allowMetaIp: !prev.allowMetaIp,
              }))
            }
          />
          <Text fontSize="13px" className={styles.settingsHint}>
            {t("DocsConnect:AllowMetaIpDescription")}
          </Text>
        </div>
      </div>

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
        limits.maxDownloadBytes,
        t("DocsConnect:MaxDownloadBytesDescription"),
        (value) => setLimits((prev) => ({ ...prev, maxDownloadBytes: value })),
      )}

      <div className={styles.settingsGroup}>
        <Text fontWeight={600}>{t("DocsConnect:InputFileSizeLimits")}</Text>
        <Text fontSize="13px" className={styles.settingsHint}>
          {t("DocsConnect:InputFileSizeLimitsDescription")}
        </Text>
      </div>

      {limitField(
        t("DocsConnect:WordDocumentsLimit"),
        limits.word,
        t("DocsConnect:MaxUncompressedSize", { type: "Word" }),
        (value) => setLimits((prev) => ({ ...prev, word: value })),
      )}
      {limitField(
        t("DocsConnect:ExcelDocumentsLimit"),
        limits.excel,
        t("DocsConnect:MaxUncompressedSize", { type: "Excel" }),
        (value) => setLimits((prev) => ({ ...prev, excel: value })),
      )}
      {limitField(
        t("DocsConnect:PowerPointDocumentsLimit"),
        limits.powerPoint,
        t("DocsConnect:MaxUncompressedSize", { type: "PowerPoint" }),
        (value) => setLimits((prev) => ({ ...prev, powerPoint: value })),
      )}
      {limitField(
        t("DocsConnect:VisioDocumentsLimit"),
        limits.visio,
        t("DocsConnect:MaxUncompressedSize", { type: "Visio" }),
        (value) => setLimits((prev) => ({ ...prev, visio: value })),
      )}
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  copyToClipboard: docsConnectStore.copyToClipboard,
}))(observer(Settings));
