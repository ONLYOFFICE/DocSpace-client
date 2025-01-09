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
import { withTranslation } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { Button } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { inject, observer } from "mobx-react";
// import { createPasswordHash } from "@docspace/shared/utils/common";
import { frameCallCommand } from "@docspace/shared/utils/frame";
import { toastr } from "@docspace/shared/components/toast";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import PortalLogo from "@docspace/shared/components/portal-logo/PortalLogo";
import { ValidationStatus } from "@docspace/shared/enums";

import PublicRoomIcon from "PUBLIC_DIR/images/icons/32/room/public.svg";
import { StyledPage, StyledBody, StyledContent } from "./RoomStyles";

const RoomPassword = (props) => {
  const {
    t,
    roomKey,
    validatePublicRoomPassword,
    setRoomData,
    roomTitle,
    gotoFolder,
  } = props;

  console.log("render");

  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => frameCallCommand("setIsLoaded"), []);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const onChangePassword = (e) => {
    setPassword(e.target.value);
    !passwordValid && setPasswordValid(true);
  };

  const onSubmit = async () => {
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

      setIsLoading(false);

      switch (res?.status) {
        case ValidationStatus.Ok:
          if (res.shared) {
            return gotoFolder(res);
          }

          setRoomData(res); // Ok
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

        default:
          break;
      }
    } catch (error) {
      toastr.error(error);
      setIsLoading(false);
    }
  };

  const onKeyPress = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <StyledPage>
      <div className="public-room-page">
        <StyledContent className="public-room-content">
          <StyledBody>
            <PortalLogo className="portal-logo" />

            <FormWrapper>
              <div className="password-form">
                <Text fontSize="16px" fontWeight="600">
                  {t("UploadPanel:EnterPassword")}
                </Text>

                <Text
                  fontSize="13px"
                  fontWeight="400"
                  className="public-room-text"
                >
                  {t("Common:NeedPassword")}:
                </Text>
                <div className="public-room-name">
                  <PublicRoomIcon className="public-room-icon" />
                  <Text
                    className="public-room-text"
                    fontSize="15px"
                    fontWeight="600"
                  >
                    {roomTitle}
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
                    type="password"
                    inputValue={password}
                    hasError={!!errorMessage}
                    size="large"
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
                size="medium"
                scale
                label={t("Common:ContinueButton")}
                tabIndex={5}
                onClick={onSubmit}
                isDisabled={isLoading}
              />
            </FormWrapper>
          </StyledBody>
        </StyledContent>
      </div>
    </StyledPage>
  );
};

export default inject(({ publicRoomStore }) => {
  const { validatePublicRoomPassword, setRoomData, gotoFolder } =
    publicRoomStore;
  const { roomTitle } = publicRoomStore;

  return {
    validatePublicRoomPassword,
    setRoomData,
    roomTitle,
    gotoFolder,
  };
})(withTranslation(["Common", "UploadPanel"])(observer(RoomPassword)));
