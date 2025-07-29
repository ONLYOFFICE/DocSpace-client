// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useEffect, useRef } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";
import { LabledInput } from "./LabledInput";
import { SSLVerification } from "./SSLVerification";
import SecretKeyInput from "./SecretKeyInput";
import TriggersForm from "./TriggersForm";

const StyledWebhookForm = styled.form`
  margin-top: 7px;

  .margin-0 {
    margin: 0;
  }
`;

const Footer = styled.div`
  width: 100%;
  display: flex;

  button {
    width: 100%;
  }
  button:first-of-type {
    margin-inline-end: 10px;
  }
`;

function validateUrl(url) {
  return URL.canParse(url);
}

const WebhookDialog = (props) => {
  const {
    visible,
    onClose,
    header,
    isSettingsModal,
    onSubmit,
    webhook,
    additionalId,
  } = props;

  const { t } = useTranslation(["Webhooks", "Common"]);
  const submitButtonRef = useRef(null);

  const [isResetVisible, setIsResetVisible] = useState(isSettingsModal);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isValid, setIsValid] = useState({
    name: true,
    uri: true,
    secretKey: true,
  });
  const [webhookInfo, setWebhookInfo] = useState({
    id: webhook ? webhook.id : 0,
    name: webhook ? webhook.name : "",
    uri: webhook ? webhook.uri : "",
    secretKey: "",
    enabled: webhook ? webhook.enabled : true,
    ssl: webhook ? webhook.ssl : true,
    triggers: webhook ? webhook.triggers : 0,
    targetId: webhook ? webhook?.targetId : "",
  });
  const [passwordInputKey, setPasswordInputKey] = useState(0);
  const [triggerAll, setTriggerAll] = useState(
    webhook ? webhook.triggers === 0 : true,
  );

  const onModalClose = () => {
    onClose();
    isSettingsModal && setIsResetVisible(true);
  };

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onModalClose();

  const cleanUpEvent = () => window.removeEventListener("keyup", onKeyPress);

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return cleanUpEvent;
  }, []);

  const onInputChange = (e) => {
    if (e.target.name) {
      !isValid[e.target.name] &&
        setIsValid((prevIsValid) => ({
          ...prevIsValid,
          [e.target.name]: true,
        }));
      setWebhookInfo((prevWebhookInfo) => ({
        ...prevWebhookInfo,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const toggleTrigger = (triggerValue) => {
    setWebhookInfo((prev) => ({
      ...prev,
      triggers: prev.triggers ^ triggerValue,
    }));
  };

  const validateForm = () => {
    const isUrlValid = validateUrl(webhookInfo.uri);
    setIsValid(() => ({
      uri: isUrlValid,
      name: webhookInfo.name !== "",
      secretKey: isPasswordValid,
    }));

    return isUrlValid && (isPasswordValid || isResetVisible);
  };

  const handleSubmitClick = () => {
    validateForm() && submitButtonRef.current.click();
  };

  const handleOnChangeTriggerAll = (value) => {
    setTriggerAll(value === "true");
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (triggerAll) webhookInfo.triggers = 0;
      await onSubmit(webhookInfo);
      isSettingsModal
        ? toastr.success(t("WebhookEditedSuccessfully"))
        : toastr.success(t("WebhookCreated"));
      setWebhookInfo({
        id: webhook ? webhook.id : 0,
        name: "",
        uri: "",
        secretKey: "",
        enabled: true,
        triggers: 0,
        targetId: "",
      });
      setIsPasswordValid(false);
      setPasswordInputKey((prevKey) => prevKey + 1);
      onModalClose();
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setWebhookInfo({
      id: webhook ? webhook.id : 0,
      name: webhook ? webhook.name : "",
      uri: webhook ? webhook.uri : "",
      secretKey: "",
      enabled: webhook ? webhook.enabled : true,
      ssl: webhook ? webhook.ssl : true,
      triggers: webhook ? webhook.triggers : 0,
      targetId: webhook ? webhook.targetId : "",
    });
    setTriggerAll(webhook ? webhook.triggers === 0 : true);
  }, [webhook]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onModalClose}
      displayType="aside"
      withBodyScroll
    >
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledWebhookForm onSubmit={onFormSubmit}>
          <LabledInput
            id={`${additionalId}-name-input`}
            label={t("WebhookName")}
            placeholder={t("EnterWebhookName")}
            name="name"
            value={webhookInfo.name}
            onChange={onInputChange}
            hasError={!isValid.name}
            className={isSettingsModal ? "margin-0" : ""}
            isDisabled={isLoading}
            required
            dataTestId="webhook_name_input"
          />
          <LabledInput
            id={`${additionalId}-payload-url-input`}
            label={t("PayloadUrl")}
            placeholder={t("EnterUrl")}
            name="uri"
            value={webhookInfo.uri}
            onChange={onInputChange}
            hasError={!isValid.uri}
            isDisabled={isLoading}
            required
            dataTestId="payload_url_input"
          />
          <SecretKeyInput
            isResetVisible={isResetVisible}
            name="secretKey"
            value={webhookInfo.secretKey}
            onChange={onInputChange}
            isPasswordValid={isValid.secretKey}
            setIsPasswordValid={setIsPasswordValid}
            setIsResetVisible={setIsResetVisible}
            passwordInputKey={passwordInputKey}
            additionalId={additionalId}
            isDisabled={isLoading}
          />
          <SSLVerification
            value={webhookInfo.ssl}
            onChange={onInputChange}
            isDisabled={isLoading}
          />
          <TriggersForm
            isDisabled={isLoading}
            triggers={webhookInfo.triggers}
            toggleTrigger={toggleTrigger}
            triggerAll={triggerAll}
            onChange={handleOnChangeTriggerAll}
          />
          <LabledInput
            id={`${additionalId}-target-id-input`}
            label={t("TargetId")}
            placeholder={t("EnterTargetId")}
            name="targetId"
            value={webhookInfo.targetId}
            onChange={onInputChange}
            isDisabled={isLoading}
            maxLength={36}
            dataTestId="target-id-input"
          />
          <button
            type="submit"
            ref={submitButtonRef}
            hidden
            aria-label="submit"
          />
        </StyledWebhookForm>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Footer>
          <Button
            id={isSettingsModal ? "save-button" : "create-button"}
            label={
              isSettingsModal ? t("Common:SaveButton") : t("Common:Create")
            }
            size="normal"
            primary
            onClick={handleSubmitClick}
            isDisabled={isLoading}
            isLoading={isLoading}
            testId="webhook_submit_button"
          />
          <Button
            id="cancel-button"
            label={t("Common:CancelButton")}
            size="normal"
            testId="webhook_cancel_button"
            onClick={onModalClose}
          />
        </Footer>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default WebhookDialog;
