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

import { useState, useCallback, useEffect } from "react";

import { RecaptchaType } from "../enums";

type UseCaptchaOptions = {
  publicKey?: string;
  type?: RecaptchaType;
  initiallyVisible?: boolean;
};

export type UseCaptchaReturn = {
  isVisible: boolean;
  isError: boolean;
  token: string | null;
  shouldRender: boolean;
  captchaType?: RecaptchaType;
  request: () => void;
  dismiss: () => void;
  reset: () => void;
  validate: () => {
    isValid: boolean;
    token?: string | null;
  };
  onTokenChange: (token: string | null) => void;
  resetSignal: number;
};

export const useCaptcha = ({
  publicKey,
  type,
  initiallyVisible = false,
}: UseCaptchaOptions = {}): UseCaptchaReturn => {
  const [isVisible, setIsVisible] = useState(
    Boolean(publicKey && initiallyVisible),
  );
  const [isError, setIsError] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const request = useCallback(() => {
    if (!publicKey) return;

    setIsVisible(true);
    setIsError(false);
    setCaptchaToken(null);
    setResetSignal((value) => value + 1);
  }, [publicKey]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setIsError(false);
    setCaptchaToken(null);
    setResetSignal((value) => value + 1);
  }, []);

  const reset = useCallback(() => {
    setIsError(false);
    setCaptchaToken(null);
    setResetSignal((value) => value + 1);
  }, []);

  const onTokenChange = useCallback((token: string | null) => {
    setCaptchaToken(token ?? null);
    setIsError(false);
  }, []);

  const validate = useCallback((): {
    isValid: boolean;
    token?: string | null;
  } => {
    if (isVisible && !captchaToken) {
      setIsError(true);
      return { isValid: false };
    }

    return { isValid: true, token: captchaToken };
  }, [captchaToken, isVisible]);

  useEffect(() => {
    if (!publicKey) {
      setIsVisible(false);
      setCaptchaToken(null);
      setIsError(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!isVisible) {
      setCaptchaToken(null);
      setIsError(false);
    }
  }, [isVisible]);

  return {
    isVisible,
    isError,
    token: captchaToken,
    shouldRender: Boolean(publicKey && isVisible),
    captchaType: type,
    request,
    dismiss,
    reset,
    validate,
    onTokenChange,
    resetSignal,
  };
};
