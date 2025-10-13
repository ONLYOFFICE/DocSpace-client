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
