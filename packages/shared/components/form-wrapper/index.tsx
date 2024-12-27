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

"use client";

import React from "react";
<<<<<<< HEAD
import classNames from "classnames";
import styles from "./FormWrapper.module.scss";
import { FormWrapperProps } from "./FormWrapper.types";

const FormWrapper = (props: FormWrapperProps) => {
  const { children, className, ...rest } = props;
  return (
    <div
      className={classNames(styles.wrapper, className)}
      data-testid="form-wrapper"
      {...rest}
    >
      {children}
    </div>
=======
import styled from "styled-components";
import { tablet, mobile, injectDefaultTheme } from "../../utils";

const StyledWrapper = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: ${(props) => props.theme.formWrapper.background};
  box-shadow: ${(props) => props.theme.formWrapper.boxShadow};
  border-radius: 12px;
  max-width: 320px;
  min-width: 320px;

  @media ${tablet} {
    max-width: 416px;
    min-width: 416px;
  }

  @media ${mobile} {
    padding: 0;
    border-radius: 0;
    box-shadow: none !important;
    max-width: 100%;
    min-width: 100%;
    background: transparent !important;
  }
`;

type FormWrapperProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const FormWrapper = (props: FormWrapperProps) => {
  const { children, role = "form", ...rest } = props;
  return (
    <StyledWrapper
      data-testid="form-wrapper"
      data-component="form-wrapper"
      role={role}
      {...rest}
    >
      {children}
    </StyledWrapper>
>>>>>>> 2118dcdaa9a0a3817dddb413048e9d05ff983f0c
  );
};

export { FormWrapper };
