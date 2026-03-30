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

import isNil from "lodash/isNil";
import isEqual from "lodash/isEqual";
import { match, P } from "ts-pattern";
import React, { useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components";
import { testExternalDbConnection } from "@docspace/shared/api/settings";

import styles from "./ExternalDbModal.module.scss";
import type {
  ExternalDbModalProps,
  ExternalDbFormData,
} from "./ExternalDbModal.types";
import ExternalDbField from "./ExternalDbField";
import SupportLinks from "./SupportLinks";
import {
  filterRelevantFields,
  getFieldValidationRules,
  isFieldVisible,
} from "./ExternalDbField.utils";

const ExternalDbModal: React.FC<ExternalDbModalProps> = ({
  visible,
  onClose,
  onSave,
  selectedConsumer,
  isLoading: externalLoading = false,
  t,
  feedbackAndSupportUrl,
  portalSettingsUrl,
}) => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const defaultValues = useMemo((): ExternalDbFormData => {
    const defaults: ExternalDbFormData = {};

    selectedConsumer.props.forEach((prop) => {
      const name = prop.name;

      match(prop)
        .with({ type: P.union("text", "password") }, ({ value }) => {
          defaults[name] = value ?? "";
        })
        .with({ type: "number" }, ({ value }) => {
          defaults[name] = value;
        })
        .with({ type: "toggle" }, ({ value }) => {
          defaults[name] = Boolean(value);
        })
        .with({ type: "select" }, ({ value, options }) => {
          defaults[name] = String(value || options[0]);
        })
        .exhaustive();
    });

    return defaults;
  }, [selectedConsumer]);

  const [fieldsToRender, setFieldsToRender] = useState(() =>
    selectedConsumer.props.filter((field) =>
      isFieldVisible(field, defaultValues),
    ),
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<ExternalDbFormData>({
    defaultValues,
    mode: "onChange",
  });

  useWatch({
    control,
    compute: (fieldValues) => {
      if (!isNil(connected)) setConnected(null);

      const visibleFields = selectedConsumer.props.filter((field) =>
        isFieldVisible(field, fieldValues),
      );

      if (!isEqual(fieldsToRender, visibleFields)) {
        setFieldsToRender(visibleFields);
      }
    },
  });

  const handleTestConnection = async (): Promise<boolean> => {
    try {
      setIsTesting(true);
      const formData = watch();
      const filteredData = filterRelevantFields(formData, fieldsToRender);

      const { success, error } = await testExternalDbConnection(filteredData);

      if (error) toastr.error(error);
      setConnected(success);

      return success;
    } catch (error) {
      toastr.error(error as Error);
      setConnected(false);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ExternalDbFormData): Promise<void> => {
    try {
      const filteredData = filterRelevantFields(data, fieldsToRender);
      const success = await handleTestConnection();
      if (!success) return;

      await onSave(filteredData);
    } catch (error) {
      toastr.error(error as Error);
    }
  };

  return (
    <ModalDialog
      withForm
      withBodyScroll
      visible={visible}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>{selectedConsumer.title}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.modalBody}>
          {selectedConsumer.instruction && (
            <Text className={styles.instruction}>
              {selectedConsumer.instruction}
            </Text>
          )}

          {fieldsToRender.map((fieldConfig) => (
            <Controller
              key={fieldConfig.name}
              name={fieldConfig.name as keyof ExternalDbFormData}
              control={control}
              rules={getFieldValidationRules(fieldConfig, t)}
              render={({ field }) => (
                <ExternalDbField
                  field={fieldConfig}
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                />
              )}
            />
          ))}
          <div className={styles.testConnectionSection}>
            <Button
              className={styles.testButton}
              label={t("Common:TestConnection")}
              onClick={handleTestConnection}
              isLoading={isTesting}
              isDisabled={!isValid || externalLoading}
            />
            {match(connected)
              .with(true, () => (
                <Text className={styles.connectedText}>
                  {t("Common:Connected")}
                </Text>
              ))
              .with(false, () => (
                <Text className={styles.connectionFailedText}>
                  {t("Common:ConnectionFailed")}
                </Text>
              ))
              .otherwise(() => null)}
          </div>
          <SupportLinks
            feedbackAndSupportUrl={feedbackAndSupportUrl}
            portalSettingsUrl={portalSettingsUrl}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          label={t("Common:Enable")}
          type="submit"
          isDisabled={!isValid || externalLoading || connected === false}
          isLoading={externalLoading}
        />
        <Button
          scale
          label={t("Common:CancelButton")}
          onClick={onClose}
          isDisabled={externalLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ExternalDbModal;
