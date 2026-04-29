// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ComboBox, type TOption } from "@docspace/ui-kit/components/combobox";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { InputSize, InputType } from "@docspace/ui-kit/components/text-input";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import {
  useFormsDbSettingsStore,
  type DatabaseType,
} from "../../../_store/FormsDbSettingsStore";
import { useFormsSettingsStore } from "../../../_store/FormsSettingsStore";
import { useFormsTourStore } from "../../../_store/FormsTourStore";
import {
  testDbConnection,
  saveDbConfig,
  setRoomFormSettings,
} from "../../../_api/dbSettings";

import styles from "./SettingsPanel.module.scss";

const DB_TYPE_OPTIONS: TOption[] = [{ key: "MySQL", label: "MySQL" }];

type ConnectDatabaseFormProps = {
  inline?: boolean;
};

const ConnectDatabaseForm = ({ inline }: ConnectDatabaseFormProps) => {
  const { t } = useTranslation(["Common"]);
  const store = useFormsDbSettingsStore();
  const { roomId } = useFormsSettingsStore();
  const tourStore = useFormsTourStore();

  React.useEffect(() => {
    if (inline && roomId && !tourStore.showMockItems) {
      store.fetchConfig(roomId);
    }
  }, [inline, roomId, store, tourStore.showMockItems]);

  // During the tour, always show DB export as off so the connection form
  // doesn't appear and no API calls are made.
  const sendToDb = tourStore.showMockItems ? false : store.sendToDb;

  const selectedDbType = React.useMemo(
    () =>
      DB_TYPE_OPTIONS.find((o) => o.key === store.databaseType) ??
      DB_TYPE_OPTIONS[0],
    [store.databaseType],
  );

  const onDbTypeChange = React.useCallback(
    (option: TOption) => {
      store.setDatabaseType(option.key as DatabaseType);
    },
    [store],
  );

  const onTestConnection = React.useCallback(async () => {
    if (!store.host.trim() || !store.port.trim()) {
      toastr.error(t("Common:EmptyFieldError"));
      return;
    }

    store.setIsTesting(true);
    try {
      const result = await testDbConnection(store.formData);
      if (result?.success) {
        toastr.success(t("Common:ConnectionSuccessful"));
      } else {
        toastr.error(result?.error || t("Common:ConnectionFailed"));
      }
    } catch {
      toastr.error(t("Common:ConnectionFailed"));
    } finally {
      store.setIsTesting(false);
    }
  }, [store, t]);

  const onToggleXlsx = React.useCallback(async () => {
    const newValue = !store.collectXlsx;
    store.setCollectXlsx(newValue);
    try {
      await setRoomFormSettings(roomId, { saveFormAsXLSX: newValue });
    } catch {
      toastr.error(t("Common:SomethingWentWrong"));
      store.setCollectXlsx(!newValue);
    }
  }, [store, roomId, t]);

  const onToggleSendToDb = React.useCallback(async () => {
    const newValue = !store.sendToDb;
    store.setSendToDb(newValue);
    if (!newValue) {
      try {
        await setRoomFormSettings(roomId, { sendFormToExternalDB: false });
      } catch {
        toastr.error(t("Common:SomethingWentWrong"));
        store.setSendToDb(true);
      }
    }
  }, [store, roomId, t]);

  const onSave = React.useCallback(async () => {
    store.setIsSaving(true);
    try {
      await Promise.all([
        setRoomFormSettings(roomId, { sendFormToExternalDB: true }),
        saveDbConfig(store.formData),
      ]);
      toastr.success(t("Common:ChangesSavedSuccessfully"));
    } catch {
      toastr.error(t("Common:SomethingWentWrong"));
    } finally {
      store.setIsSaving(false);
    }
  }, [store, roomId, t]);

  return (
    <div className={inline ? styles.inlineBody : styles.panelBody}>
      <div className={styles.toggleBlock}>
        <div className={styles.toggleHeader}>
          <Text fontSize="16px" fontWeight={700}>
            {t("Common:CollectResultsInXlsx")}
          </Text>
          <ToggleButton
            className={styles.toggle}
            isChecked={store.collectXlsx}
            onChange={onToggleXlsx}
          />
        </div>
        <Text fontSize="12px" fontWeight={400}>
          {t("Common:CollectResultsInXlsxDescription")}
        </Text>
      </div>

      <div className={styles.toggleBlock}>
        <div className={styles.toggleHeader}>
          <Text fontSize="16px" fontWeight={700}>
            {t("Common:ExportResultsToDatabase")}
          </Text>
          <ToggleButton
            className={styles.toggle}
            isChecked={sendToDb}
            isDisabled={tourStore.showMockItems}
            onChange={onToggleSendToDb}
          />
        </div>
        <Text fontSize="12px" fontWeight={400}>
          {t("Common:ExportResultsToDatabaseDescription")}
        </Text>
      </div>

      {sendToDb ? (
        <div className={styles.formBlock}>
          <div className={styles.fieldGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:DatabaseType")}
            </Text>
            <ComboBox
              scaled
              scaledOptions
              options={DB_TYPE_OPTIONS}
              selectedOption={selectedDbType}
              onSelect={onDbTypeChange}
              dropDownMaxHeight={200}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:DatabaseHost")}
            </Text>
            <TextInput
              scale
              type={InputType.text}
              value={store.host}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                store.setHost(e.target.value)
              }
              size={InputSize.base}
              placeholder="localhost"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:DatabasePort")}
            </Text>
            <TextInput
              scale
              type={InputType.text}
              value={store.port}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value.replace(/\D/g, "");
                store.setPort(v);
              }}
              size={InputSize.base}
              placeholder="3306"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:DatabaseName")}
            </Text>
            <TextInput
              scale
              type={InputType.text}
              value={store.databaseName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                store.setDatabaseName(e.target.value)
              }
              size={InputSize.base}
              placeholder="docspace_forms"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:User")}
            </Text>
            <TextInput
              scale
              type={InputType.text}
              value={store.user}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                store.setUser(e.target.value)
              }
              size={InputSize.base}
              placeholder="root"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:Password")}
            </Text>
            <PasswordInput
              simpleView
              passwordSettings={{ minLength: 0 }}
              inputValue={store.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                store.setPassword(e.target.value)
              }
              size={InputSize.base}
              placeholder="••••••••"
            />
          </div>

          <Checkbox
            label={t("Common:UseSSL")}
            isChecked={store.useSsl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              store.setUseSsl(e.target.checked)
            }
          />

          <div className={styles.testButtonWrapper}>
            <Button
              label={t("Common:TestConnection")}
              size={ButtonSize.normal}
              onClick={onTestConnection}
              isLoading={store.isTesting}
              scale
            />
          </div>

          <div className={styles.buttonWrapper}>
            <Button
              primary
              size={ButtonSize.normal}
              label={t("Common:SaveButton")}
              onClick={onSave}
              isLoading={store.isSaving}
              scale
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default observer(ConnectDatabaseForm);
