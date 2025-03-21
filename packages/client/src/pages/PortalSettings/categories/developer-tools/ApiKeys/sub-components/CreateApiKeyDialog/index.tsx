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

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import capitalize from "lodash/capitalize";
import copy from "copy-to-clipboard";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { withTranslation } from "react-i18next";
import { createApiKey } from "@docspace/shared/api/api-keys";
import { TApiKey, TApiKeyRequest } from "@docspace/shared/api/api-keys/types";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { InputBlock } from "@docspace/shared/components/input-block";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { toastr } from "@docspace/shared/components/toast";
import { globalColors } from "@docspace/shared/themes";
import { CreateApiKeyDialogProps } from "../../types";

const StyledBodyContent = styled.div`
  .api-key_name {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 16px;
  }

  .api-key_name-body-container {
    display: flex;
    gap: 4px;
    margin-top: 16px;
  }

  .api-key_lifetime {
    display: flex;
  }

  .api-key_toggle {
    margin-inline-start: auto;
    margin-inline-end: 28px;
  }

  .api-key_lifetime-description {
    color: ${(props) => props.theme.text.disableColor};
  }

  .api-key_lifetime-input-block {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .api-key_lifetime-input {
    max-width: 100px;
  }
`;

const CreateApiKeyDialog = (props: CreateApiKeyDialogProps) => {
  const { t, tReady, isVisible, setIsVisible, setListItems } = props;

  const [isRequestRunning, setIsRequestRunning] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [secretKey, setSecretKey] = useState<TApiKey>();
  const [expiresInDays, setExpiresInDays] = useState("7");
  const inputRef = useRef<HTMLInputElement>(null);

  const onClose = () => {
    setIsVisible(false);
  };

  const onGenerate = () => {
    if (!inputValue) {
      setIsValid(false);
      return;
    }

    const newKey = { name: inputValue } as TApiKeyRequest;
    if (expiresInDays) newKey.expiresInDays = expiresInDays;

    setIsRequestRunning(true);
    createApiKey(newKey)
      .then((key) => {
        setSecretKey(key);
        setListItems((prev) => [...prev, key]);
      })
      .catch((err) => toastr.error(err))
      .finally(() => setIsRequestRunning(false));
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !isRequestRunning) {
      secretKey ? onClose() : onGenerate();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, [inputValue, secretKey]);

  useEffect(() => {
    if (secretKey && inputRef) inputRef.current?.select();
  }, [inputRef, secretKey]);

  const createBody = (
    <StyledBodyContent>
      <Text noSelect>{t("Settings:CreateNewSecretKeyDialogDescription")}</Text>
      <div className="api-key_name">
        <Text fontSize="13px" fontWeight={600}>
          {t("Common:Name")}
        </Text>
        <TextInput
          placeholder={t("Settings:CreateNewSecretKeyDialogPlaceholder")}
          value={inputValue}
          type={InputType.text}
          isAutoFocussed
          onChange={(e) => {
            setIsValid(true);
            setInputValue(e.target.value);
          }}
          hasError={!isValid}
          scale
        />
      </div>
      <div className="api-key_name">
        <div className="api-key_lifetime">
          <Text fontSize="13px" fontWeight={600}>
            {t("Settings:KeyLifetime")}
          </Text>
          <ToggleButton
            className="api-key_toggle"
            isChecked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
        </div>
        <Text
          fontSize="12px"
          fontWeight={400}
          className="api-key_lifetime-description"
        >
          {t("Settings:KeyLifetimeDescription")}
        </Text>
        {isChecked ? (
          <div className="api-key_lifetime-input-block">
            <TextInput
              className="api-key_lifetime-input"
              value={expiresInDays}
              type={InputType.text}
              onChange={(e) => {
                setExpiresInDays(e.target.value);
              }}
            />
            <Text fontSize="13px" fontWeight={600}>
              {capitalize(t("Common:Days"))}
            </Text>
          </div>
        ) : null}
      </div>
    </StyledBodyContent>
  );

  const keyBody = (
    <StyledBodyContent>
      <Text noSelect>{t("Settings:CreateNewSecretKeyDialogDescription")}</Text>
      <div className="api-key_name">
        <InputBlock
          forwardedRef={inputRef}
          value={secretKey?.key || ""}
          type={InputType.text}
          isAutoFocussed
          isReadOnly
          onFocus={(e) => e.target.select()}
          scale
          iconName={CopyReactSvgUrl}
          iconColor={globalColors.lightGrayDark}
          isIconFill
          onIconClick={() => {
            copy(secretKey?.key || "");
            toastr.success(t("Settings:ApiKeyCopied"));
          }}
        />
      </div>
      {expiresInDays ? (
        <div className="api-key_name-body-container">
          <Text fontSize="12px" fontWeight={600}>
            {t("Settings:ApiKeyLifetime")}
          </Text>
          <Text fontSize="12px">
            {t("Settings:ApiKeyWillBeDeleted", {
              days: expiresInDays,
            })}
          </Text>
        </div>
      ) : null}
    </StyledBodyContent>
  );

  const createFooter = (
    <>
      <Button
        key="OkButton"
        label={t("Webhooks:Generate")}
        size={ButtonSize.normal}
        primary
        onClick={onGenerate}
        scale
      />
      <Button
        key="CancelButton"
        label={t("Common:CancelButton")}
        size={ButtonSize.normal}
        onClick={onClose}
        scale
      />
    </>
  );

  const keyFooter = (
    <Button
      key="OkButton"
      label={t("Common:Done")}
      size={ButtonSize.normal}
      primary
      onClick={onClose}
      scale
    />
  );

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={isVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {t("Settings:CreateNewSecretKey")}
      </ModalDialog.Header>
      <ModalDialog.Body>{secretKey ? keyBody : createBody}</ModalDialog.Body>
      <ModalDialog.Footer>
        {secretKey ? keyFooter : createFooter}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["Webhooks", "Files", "Common"])(
  CreateApiKeyDialog,
);
