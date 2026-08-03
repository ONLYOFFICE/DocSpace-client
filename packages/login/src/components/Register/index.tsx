/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

"use client";

import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TValidate } from "@docspace/ui-kit/components/email-input";
import { sendRegisterRequest } from "@docspace/shared/api/settings";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { RegisterProps } from "@/types";

import { LoginDispatchContext } from "../Login";

import RegisterModalDialog from "./sub-components/RegisterModalDialog";
import styles from "./register.module.scss";

const Register = (props: RegisterProps) => {
  const {
    enabledJoin,
    isAuthenticated,
    trustedDomainsType,
    trustedDomains,

    id,
  } = props;

  const { setIsModalOpen } = useContext(LoginDispatchContext);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isShowError, setIsShowError] = useState(false);

  const { currentColorScheme } = useTheme();

  const { t } = useTranslation("Login");

  const onRegisterClick = () => {
    setVisible(true);
    setIsModalOpen(true);
  };

  const onRegisterModalClose = useCallback(() => {
    setVisible(false);
    setEmail("");
    setEmailErr(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      setEmail(e.currentTarget.value);
      setEmailErr(false);
      setIsShowError(false);
    }
  };

  const onValidateEmail = (res: TValidate) => {
    setEmailErr(!res.isValid);
    setErrorText(res.errors ? res.errors[0] : "");
    return undefined;
  };

  const onBlurEmail = () => {
    setIsShowError(true);
  };

  const onSendRegisterRequest = React.useCallback(async () => {
    if (!email.trim() || emailErr) {
      setEmailErr(true);
      setIsShowError(true);
    } else {
      setLoading(true);
      try {
        const res = await sendRegisterRequest(email);
        setLoading(false);
        toastr.success(res as string);
      } catch (e) {
        setLoading(false);
        toastr.error(e as string);
      } finally {
        onRegisterModalClose();
      }
    }
  }, [email, emailErr, onRegisterModalClose]);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onSendRegisterRequest();
        e.preventDefault();
      }
    },
    [onSendRegisterRequest],
  );

  return enabledJoin && !isAuthenticated ? (
    <>
      <div
        id={id}
        className={styles.registerContainer}
        onClick={onRegisterClick}
      >
        <Text
          as="span"
          color={currentColorScheme?.main?.accent ?? undefined}
          lineHeight="20px"
        >
          {t("Register")}
        </Text>
      </div>

      {visible ? (
        <RegisterModalDialog
          visible={visible}
          loading={loading}
          email={email}
          emailErr={emailErr}
          trustedDomainsType={trustedDomainsType}
          trustedDomains={trustedDomains}
          onChangeEmail={onChangeEmail}
          onValidateEmail={onValidateEmail}
          onBlurEmail={onBlurEmail}
          onRegisterModalClose={onRegisterModalClose}
          onSendRegisterRequest={onSendRegisterRequest}
          onKeyDown={onKeyDown}
          errorText={errorText}
          isShowError={isShowError}
        />
      ) : null}
    </>
  ) : null;
};

export default Register;
