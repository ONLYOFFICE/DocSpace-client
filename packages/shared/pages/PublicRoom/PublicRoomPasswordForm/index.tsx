/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

"use client";

import { TFunction } from "i18next";
import classNames from "classnames";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Text } from "../../../components/text";
import { PasswordInput } from "../../../components/password-input";
import { Button, ButtonSize } from "../../../components/button";
import { FieldContainer } from "../../../components/field-container";
import { frameCallCommand } from "../../../utils/common";
import { toastr } from "../../../components/toast";
import { FormWrapper } from "../../../components/form-wrapper";
import PortalLogo from "../../../components/portal-logo/PortalLogo";
import { ValidationStatus } from "../../../enums";

import { validatePublicRoomPassword } from "../../../api/rooms";
import {
  getLogo,
  getPasswordDescription,
} from "./PublicRoomPasswordForm.helper";
import { InputSize } from "../../../components/text-input";
import { RoomIcon } from "../../../components/room-icon";
import type {
  TPublicRoomPassword,
  TValidateShareRoom,
} from "../../../api/rooms/types";

import styles from "./PublicRoomPasswordForm.module.scss";

export type PublicRoomPasswordProps = {
  t: TFunction;
  roomKey: string;
  validationData: TValidateShareRoom;
  onSuccessValidationCallback: (res: TPublicRoomPassword) => void;
};

const PublicRoomPassword = (props: PublicRoomPasswordProps) => {
  const { t, roomKey, validationData, onSuccessValidationCallback } = props;

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => frameCallCommand("setIsLoaded"), []);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const description = useMemo(
    () => getPasswordDescription(t, validationData),
    [t, validationData],
  );

  const logo = useMemo(() => getLogo(validationData), [validationData]);

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!passwordValid) {
      setPasswordValid(true);
    }
  };

  const onSubmitAction = async () => {
    if (!password.trim()) {
      setPasswordValid(false);
      setErrorMessage(t("Common:RequiredField"));
    }

    if (!passwordValid || !password.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await validatePublicRoomPassword(roomKey, password);

      switch (res?.status) {
        case ValidationStatus.Ok:
          onSuccessValidationCallback(res);
          return;

        // case ValidationStatus.Invalid: {
        //   setErrorMessage(""); // Invalid
        //   return;
        // }
        // case ValidationStatus.Expired: {
        //   setErrorMessage(""); // Expired
        //   return;
        // }
        case ValidationStatus.InvalidPassword:
          setErrorMessage(t("Common:IncorrectPassword"));
          break;

        default:
          break;
      }

      setIsLoading(false);
    } catch (error) {
      toastr.error(error as string);
      setIsLoading(false);
    }
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSubmitAction();
    }
  };

  return (
    <div className={styles.page} id="public-password-page">
      <div className={styles.publicRoomPage}>
        <div
          className={classNames(
            styles.content,
            styles.publicRoomContent,
            "public-room-content",
          )}
        >
          <div className={styles.body}>
            <PortalLogo
              className={classNames(styles.portalLogo, "portal-logo")}
            />

            <FormWrapper>
              <div className={classNames(styles.passwordForm, "password-form")}>
                <Text fontSize="16px" fontWeight="600">
                  {/* {t("Common:EnterPassword")} */}
                  {t("Common:PasswordRequired")}
                </Text>

                <Text
                  fontSize="13px"
                  fontWeight="400"
                  className={classNames(
                    styles.publicRoomText,
                    "public-room-text",
                  )}
                >
                  {description}:
                </Text>
                <div
                  className={classNames(
                    styles.publicRoomName,
                    "public-room-name",
                  )}
                >
                  <RoomIcon
                    logo={logo}
                    showDefault={false}
                    title={validationData.title}
                  />
                  <Text
                    className={classNames(
                      styles.publicRoomText,
                      "public-room-text",
                    )}
                    fontSize="15px"
                    fontWeight="600"
                  >
                    {validationData.title}
                  </Text>
                </div>

                <FieldContainer
                  isVertical
                  labelVisible={false}
                  hasError={!!errorMessage}
                  errorMessage={errorMessage}
                >
                  <PasswordInput
                    simpleView
                    id="password"
                    inputName="password"
                    placeholder={t("Common:Password")}
                    inputValue={password}
                    hasError={!!errorMessage}
                    size={InputSize.large}
                    scale
                    tabIndex={1}
                    autoComplete="current-password"
                    onChange={onChangePassword}
                    onKeyDown={onKeyPress}
                    isDisabled={isLoading}
                    isDisableTooltip
                    forwardedRef={inputRef}
                    isAutoFocussed
                  />
                </FieldContainer>
              </div>

              <Button
                primary
                size={ButtonSize.medium}
                scale
                label={t("Common:ContinueButton")}
                tabIndex={5}
                isLoading={isLoading}
                isDisabled={isLoading}
                onClick={onSubmitAction}
              />
            </FormWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRoomPassword;
