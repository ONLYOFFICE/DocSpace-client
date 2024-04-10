// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useState, useEffect, useRef } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { LabledInput } from "./LabledInput";
import styled, { css } from "styled-components";
import { Hint } from "../styled-components";
import { SSLVerification } from "./SSLVerification";
import SecretKeyInput from "./SecretKeyInput";
import { useTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";

const ModalDialogContainer = styled(ModalDialog)`
  .modal-body {
    overflow-y: auto;
  }
`;

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
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 10px;
          `
        : css`
            margin-right: 10px;
          `}
  }
`;

function validateUrl(url) {
  try {
    new URL(url);
  } catch (error) {
    return false;
  }
  return true;
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

  const [isResetVisible, setIsResetVisible] = useState(isSettingsModal);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isValid, setIsValid] = useState({
    name: true,
    uri: true,
    secretKey: true,
  });

  const { t } = useTranslation(["Webhooks", "Common"]);

  const [webhookInfo, setWebhookInfo] = useState({
    id: webhook ? webhook.id : 0,
    name: webhook ? webhook.name : "",
    uri: webhook ? webhook.uri : "",
    secretKey: "",
    enabled: webhook ? webhook.enabled : true,
    ssl: webhook ? webhook.ssl : true,
  });

  const [passwordInputKey, setPasswordInputKey] = useState(0);

  const submitButtonRef = useRef(null);

  const onModalClose = () => {
    onClose();
    isSettingsModal && setIsResetVisible(true);
  };

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

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
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

  const cleanUpEvent = () => window.removeEventListener("keyup", onKeyPress);

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return cleanUpEvent;
  }, []);

  useEffect(() => {
    setWebhookInfo({
      id: webhook ? webhook.id : 0,
      name: webhook ? webhook.name : "",
      uri: webhook ? webhook.uri : "",
      secretKey: "",
      enabled: webhook ? webhook.enabled : true,
      ssl: webhook ? webhook.ssl : true,
    });
  }, [webhook]);

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onModalClose();

  return (
    <ModalDialogContainer
      withFooterBorder
      visible={visible}
      onClose={onModalClose}
      displayType="aside"
    >
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledWebhookForm onSubmit={onFormSubmit}>
          {!isSettingsModal && <Hint>{t("WebhookCreationHint")}</Hint>}
          <LabledInput
            id={additionalId + "-name-input"}
            label={t("WebhookName")}
            placeholder={t("EnterWebhookName")}
            name="name"
            value={webhookInfo.name}
            onChange={onInputChange}
            hasError={!isValid.name}
            className={isSettingsModal ? "margin-0" : ""}
            isDisabled={isLoading}
            required
          />
          <LabledInput
            id={additionalId + "-payload-url-input"}
            label={t("PayloadUrl")}
            placeholder={t("EnterUrl")}
            name="uri"
            value={webhookInfo.uri}
            onChange={onInputChange}
            hasError={!isValid.uri}
            isDisabled={isLoading}
            required
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

          <button type="submit" ref={submitButtonRef} hidden></button>
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
            primary={true}
            onClick={handleSubmitClick}
            isDisabled={isLoading}
            isLoading={isLoading}
          />
          <Button
            id="cancel-button"
            label={t("Common:CancelButton")}
            size="normal"
            onClick={onModalClose}
          />
        </Footer>
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default WebhookDialog;
