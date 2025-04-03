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

import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import capitalize from "lodash/capitalize";
import copy from "copy-to-clipboard";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { withTranslation } from "react-i18next";
import { createApiKey, getApiKeys } from "@docspace/shared/api/api-keys";
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
import { Tabs, TabsTypes, TTabItem } from "@docspace/shared/components/tabs";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { toastr } from "@docspace/shared/components/toast";
import { globalColors } from "@docspace/shared/themes";
import { CreateApiKeyDialogProps, TPermissionsList } from "../../types";
import {
  getCategoryTranslation,
  getFilteredOptions,
  getItemPermissions,
  PermissionGroup,
  sortPermissions,
} from "../../utils";

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

  .sticky-indent {
    display: none;
  }

  .api-key_permission-tab {
    width: 100%;
  }

  .api-key_permission-container {
    display: grid;
    grid-template-columns: 1fr minmax(50px, auto) minmax(50px, auto);
    gap: 8px 0;
  }

  .separator {
    padding: 15px 0px 9px;
    margin-bottom: 6px;
    border-bottom: ${(props) => props.theme.oauth.clientForm.headerBorder};
  }

  .api-key_permission-container-text {
    display: flex;
    justify-content: center;
  }

  .api-key_permission-checkbox {
    justify-content: center;
    margin-left: 12px;
  }

  .api-key_permission-row {
    margin-bottom: 8px;
  }
`;

const CreateApiKeyDialog = (props: CreateApiKeyDialogProps) => {
  const {
    t,
    tReady,
    isVisible,
    setIsVisible,
    setListItems,
    actionItem,
    permissions,
    setActionItem,
    onChangeApiKeyParams,
    isRequestRunning: isRequestRunningProp,
  } = props;

  const selectedOption = getItemPermissions(
    permissions,
    actionItem?.permissions,
  );

  const isEdit = !!actionItem;

  const [isRequestRunning, setIsRequestRunning] = useState(false);
  const [inputValue, setInputValue] = useState(
    actionItem?.name ?? t("Settings:NewSecretKey"),
  );
  const [isValid, setIsValid] = useState(true);
  const [isValidLifeTime, setIsValidLifeTime] = useState(true);
  const [lifetimeIsChecked, setLifetimeIsChecked] = useState(false);
  const [secretKey, setSecretKey] = useState<TApiKey>();
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [selectedItemId, setSelectedItemId] = useState(selectedOption);
  const [filteredOpt, setFilteredOpt] = useState<TPermissionsList>();

  const getRestrictedOptions = () => {
    const list: string[] = [];
    if (filteredOpt) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(filteredOpt).forEach(([_, value]) => {
        if (value.isWrite.isChecked) {
          list.push(value.isWrite.name);
          list.push(value.isRead.name);
        } else if (value.isRead.isChecked) list.push(value.isRead.name);
      });
    }
    return list;
  };

  const getPermissionsList = useCallback(() => {
    if (!filteredOpt) return [];

    const list: React.ReactNode[] = [];
    Object.entries(filteredOpt).forEach(([key, value]) => {
      const category = getCategoryTranslation(key as PermissionGroup, t);
      const readIsDisabled = value?.isWrite?.isChecked;

      list.push(
        <React.Fragment key={key}>
          <Text
            className="api-key_permission-row"
            fontSize="13px"
            fontWeight={600}
          >
            {category}
          </Text>

          {value.isRead ? (
            <Checkbox
              className="api-key_permission-row api-key_permission-checkbox"
              isChecked={value.isRead.isChecked || readIsDisabled}
              onChange={() => {
                const obj = { ...filteredOpt };
                obj[key].isRead.isChecked = !value.isRead.isChecked;
                setFilteredOpt(obj);
              }}
              isDisabled={readIsDisabled || isRequestRunning}
            />
          ) : (
            <div />
          )}
          {value.isWrite ? (
            <Checkbox
              className="api-key_permission-row api-key_permission-checkbox"
              isChecked={value.isWrite.isChecked}
              onChange={() => {
                const obj = { ...filteredOpt };
                obj[key].isWrite.isChecked = !value.isWrite.isChecked;
                setFilteredOpt(obj);
              }}
              isDisabled={isRequestRunning}
            />
          ) : (
            <div />
          )}
        </React.Fragment>,
      );
    });

    return sortPermissions(list);
  }, [filteredOpt]);

  const permissionsList = getPermissionsList();

  const tabsItems = [
    {
      id: "all",
      name: "All",
      content: null,
    },
    {
      id: "restricted",
      name: "Restricted",
      content: (
        <div className="api-key_permission-tab">
          <div className="api-key_permission-container">
            <Text fontSize="13px" fontWeight={600} className="separator">
              {t("OAuth:ScopesHeader")}
            </Text>
            <Text
              className="api-key_permission-container-text separator"
              fontWeight={600}
            >
              {t("OAuth:Read")}
            </Text>
            <Text
              className="api-key_permission-container-text separator"
              fontWeight={600}
            >
              {t("OAuth:Write")}
            </Text>

            {permissionsList.map((item) => {
              return item;
            })}
          </div>
        </div>
      ),
    },
    {
      id: "readonly",
      name: "Read only",
      content: null,
    },
  ];

  const inputRef = useRef<HTMLInputElement>(null);

  const onClose = () => {
    setActionItem(null);
    setIsVisible(false);
  };

  const onGenerate = () => {
    if (!inputValue) {
      setIsValid(false);
      return;
    }

    if (!expiresInDays) {
      setIsValidLifeTime(false);
      return;
    }

    let selectedPermissions: string[] = ["*"];

    switch (selectedItemId) {
      case "all":
        selectedPermissions = ["*"];
        break;
      case "restricted":
        selectedPermissions = getRestrictedOptions();
        break;
      case "readonly": {
        selectedPermissions = permissions.filter((p) => p.includes("read"));
        break;
      }
      default:
        break;
    }

    const newKey = {
      name: inputValue,
      permissions: selectedPermissions,
    } as TApiKeyRequest;
    if (lifetimeIsChecked) newKey.expiresInDays = expiresInDays;

    if (isEdit) {
      onChangeApiKeyParams(actionItem.id, newKey);
    } else {
      setIsRequestRunning(true);
      createApiKey(newKey)
        .then(async (key) => {
          setSecretKey(key);
          const newKeys = await getApiKeys();
          if (newKeys) setListItems(newKeys);
          toastr.success(t("Settings:SecretKeyCreated"));
          // setListItems((prev) => [...prev, key]);
        })
        .catch((err) => toastr.error(err))
        .finally(() => setIsRequestRunning(false));
    }
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !isRequestRunning) {
      secretKey ? onClose() : onGenerate();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const onSelectPermission = (data: TTabItem) => {
    switch (data.id) {
      case "all":
        setSelectedItemId("all");
        break;
      case "restricted":
        setSelectedItemId("restricted");
        break;
      case "readonly":
        setSelectedItemId("readonly");
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const filteredOptions = getFilteredOptions(
      permissions,
      actionItem?.permissions,
    );
    setFilteredOpt(filteredOptions);
  }, [permissions]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, [inputValue, secretKey]);

  useEffect(() => {
    if (secretKey && inputRef) inputRef.current?.select();
  }, [inputRef, secretKey]);

  useEffect(() => {
    setIsRequestRunning(isRequestRunningProp);
  }, [isRequestRunningProp]);

  const createBody = (
    <StyledBodyContent>
      {!isEdit ? (
        <Text noSelect>
          {t("Settings:CreateNewSecretKeyDialogDescription")}
        </Text>
      ) : null}
      <div className="api-key_name">
        <Text fontSize="13px" fontWeight={600}>
          {t("Common:Label")}
        </Text>
        <TextInput
          placeholder={t("Settings:NewSecretKey")}
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
        <Text fontSize="13px" fontWeight={600}>
          {t("Common:Permissions")}
        </Text>
        <Tabs
          type={TabsTypes.Secondary}
          items={tabsItems}
          onSelect={onSelectPermission}
          selectedItemId={selectedItemId}
        />
      </div>
      {!isEdit ? (
        <div className="api-key_name">
          <div className="api-key_lifetime">
            <Text fontSize="13px" fontWeight={600}>
              {t("Settings:KeyLifetime")}
            </Text>
            <ToggleButton
              className="api-key_toggle"
              isChecked={lifetimeIsChecked}
              onChange={() => setLifetimeIsChecked(!lifetimeIsChecked)}
            />
          </div>
          <Text
            fontSize="12px"
            fontWeight={400}
            className="api-key_lifetime-description"
          >
            {t("Settings:KeyLifetimeDescription")}
          </Text>
          {lifetimeIsChecked ? (
            <div className="api-key_lifetime-input-block">
              <TextInput
                className="api-key_lifetime-input"
                value={expiresInDays}
                type={InputType.text}
                maxLength={6}
                onChange={(e) => {
                  if (
                    e.target.value &&
                    !/^(?:[1-9][0-9]*)$/.test(e.target.value)
                  )
                    return;
                  setExpiresInDays(e.target.value);
                  setIsValidLifeTime(true);
                }}
                hasError={!isValidLifeTime}
              />
              <Text fontSize="13px" fontWeight={600}>
                {capitalize(t("Common:Days"))}
              </Text>
            </div>
          ) : null}
        </div>
      ) : null}
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
      {lifetimeIsChecked ? (
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
        label={isEdit ? t("Common:EditButton") : t("Webhooks:Generate")}
        size={ButtonSize.normal}
        primary
        onClick={onGenerate}
        scale
        isDisabled={isRequestRunning}
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
        {isEdit
          ? t("Settings:EditSecretKey")
          : t("Settings:CreateNewSecretKey")}
      </ModalDialog.Header>
      <ModalDialog.Body>{secretKey ? keyBody : createBody}</ModalDialog.Body>
      <ModalDialog.Footer>
        {secretKey ? keyFooter : createFooter}
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["Webhooks", "Files", "Common", "OAuth"])(
  CreateApiKeyDialog,
);
