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

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";

import PublicRoomIcon from "PUBLIC_DIR/images/icons/32/room/public.svg";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import PublicRoomPassword from "@docspace/shared/pages/PublicRoom/PublicRoomPasswordForm";

import { getLogoUrl } from "@docspace/shared/utils";
import { frameCallCommand } from "@docspace/shared/utils/common";
import { useTheme } from "styled-components";
import { ValidationStatus, WhiteLabelLogoType } from "@docspace/shared/enums";
import { validatePublicRoomPassword } from "@docspace/shared/api/rooms";
import Image from "next/image";
import { FilePasswordProps } from "./FilePassword.types";
import {
  StyledPage,
  StyledContent,
  StyledBody,
  StyledSimpleNav,
  Container,
} from "./FilePassword.styled";

const FilePassword = ({ shareKey, validationData }: FilePasswordProps) => {
  const { t } = useTranslation(["Common"]);

  const theme = useTheme();

  // const [password, setPassword] = useState("");
  // const [passwordValid, setPasswordValid] = useState(true);
  // const [isLoading, setIsLoading] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => frameCallCommand("setIsLoaded"), []);

  // const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPassword(e.target.value);
  //   !passwordValid && setPasswordValid(true);
  // };

  // const onSubmit = async () => {
  //   if (!password.trim()) {
  //     setPasswordValid(false);
  //     setErrorMessage(t("Common:RequiredField"));
  //   } else {
  //     setErrorMessage("");
  //   }

  //   if (!passwordValid || !password.trim()) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const res = await validatePublicRoomPassword(shareKey, password);

  //     if (res?.status === ValidationStatus.Ok) {
  //       return window.location.reload();
  //     }

  //     setIsLoading(false);

  //     if (res?.status === ValidationStatus.InvalidPassword) {
  //       setErrorMessage(t("Common:IncorrectPassword"));
  //     }
  //   } catch (error) {
  //     toastr.error(error as TData);
  //     setIsLoading(false);
  //   }
  // };

  // const onKeyPress = (event: React.KeyboardEvent) => {
  //   if (event.key === "Enter") {
  //     onSubmit();
  //   }
  // };

  const logoUrl = getLogoUrl(WhiteLabelLogoType.LoginPage, !theme.isBase);

  const onSubmit = () => {
    return window.location.reload();
  };

  return (
    <Container>
      <StyledSimpleNav id="public-room-password-header">
        <Image
          className="logo"
          src={logoUrl}
          priority
          alt="mobile-icon"
          width={211}
          height={24}
        />
      </StyledSimpleNav>
      <PublicRoomPassword
        t={t}
        roomKey={shareKey}
        validationData={validationData}
        onSuccessValidationCallback={onSubmit}
      />
    </Container>
  );

  // return (
  //   <>
  //     <StyledSimpleNav id="public-room-password-header">
  //       <Image
  //         className="logo"
  //         src={logoUrl}
  //         priority
  //         alt="mobile-icon"
  //         width={211}
  //         height={24}
  //       />
  //     </StyledSimpleNav>
  //     <StyledPage>
  //       <div className="public-room_content-wrapper">
  //         <StyledContent className="public-room-content">
  //           <StyledBody>
  //             <Image
  //               priority
  //               src={logoUrl}
  //               className="logo-wrapper"
  //               alt="icon"
  //               width={386}
  //               height={44}
  //             />

  //             <FormWrapper>
  //               <div className="password-form">
  //                 <Text fontSize="16px" fontWeight="600">
  //                   {t("Common:PasswordRequired")}
  //                 </Text>

  //                 <Text
  //                   fontSize="13px"
  //                   fontWeight="400"
  //                   className="public-room-text"
  //                 >
  //                   <Trans
  //                     t={t}
  //                     ns="Common"
  //                     i18nKey="EnterPasswordDescription"
  //                     values={{ fileName: entryTitle }}
  //                     components={{
  //                       1: <span key="component_key" className="bold" />,
  //                     }}
  //                   />
  //                 </Text>
  //                 <div className="public-room-name">
  //                   <PublicRoomIcon className="public-room-icon" />
  //                   <Text
  //                     className="public-room-text"
  //                     fontSize="15px"
  //                     fontWeight="600"
  //                   >
  //                     {title}
  //                   </Text>
  //                 </div>

  //                 <FieldContainer
  //                   isVertical
  //                   labelVisible={false}
  //                   hasError={!!errorMessage}
  //                   errorMessage={errorMessage}
  //                 >
  //                   <PasswordInput
  //                     simpleView
  //                     id="password"
  //                     inputName="password"
  //                     placeholder={t("Common:Password")}
  //                     inputType={InputType.password}
  //                     inputValue={password}
  //                     hasError={!!errorMessage}
  //                     size={InputSize.large}
  //                     scale
  //                     tabIndex={1}
  //                     autoComplete="current-password"
  //                     onChange={onChangePassword}
  //                     onKeyDown={onKeyPress}
  //                     isDisabled={isLoading}
  //                     isDisableTooltip
  //                     isAutoFocussed
  //                     // forwardedRef={inputRef}
  //                   />
  //                 </FieldContainer>
  //               </div>

  //               <Button
  //                 primary
  //                 size={ButtonSize.medium}
  //                 scale
  //                 label={t("Common:ContinueButton")}
  //                 tabIndex={5}
  //                 onClick={onSubmit}
  //                 isDisabled={isLoading}
  //               />
  //             </FormWrapper>
  //           </StyledBody>
  //         </StyledContent>
  //       </div>
  //     </StyledPage>
  //   </>
  // );
};

export default dynamic(() => Promise.resolve(FilePassword), { ssr: false });
