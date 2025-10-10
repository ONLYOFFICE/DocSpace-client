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

import { useState, useRef, useCallback, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import { RecaptchaType } from "@docspace/shared/enums";

import { captchaManager } from "../utils/captchaManager";

type UseCaptchaOptions = {
  publicKey?: string;
  type?: RecaptchaType;
  enabled?: boolean;
  id?: string;
};

type UseCaptchaReturn = {
  isVisible: boolean;
  isError: boolean;
  isSuccessful: boolean;
  captchaRef: React.RefObject<ReCAPTCHA | null>;
  hCaptchaRef: React.RefObject<HCaptcha | null>;
  show: () => void;
  hide: () => void;
  reset: () => void;
  getToken: () => string | null | undefined;
  onSuccess: () => void;
  setError: (error: boolean) => void;

  validateBeforeSubmit: () => { isValid: boolean; token?: string | null };
};

export const useCaptcha = ({
  publicKey,
  type,
  enabled = false,
  id = "default",
}: UseCaptchaOptions = {}): UseCaptchaReturn => {
  const [isVisible, setIsVisible] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const captchaRef = useRef<ReCAPTCHA>(null);
  const hCaptchaRef = useRef<HCaptcha>(null);

  const isHCaptcha = type === RecaptchaType.hCaptcha;

  const getToken = useCallback((): string | null | undefined => {
    if (!publicKey || !isVisible) return undefined;

    if (isHCaptcha) {
      return undefined;
    }

    return captchaRef.current?.getValue();
  }, [publicKey, isVisible, isHCaptcha]);

  const reset = useCallback(() => {
    setIsError(false);
    setIsSuccessful(false);

    if (isHCaptcha) {
      hCaptchaRef.current?.resetCaptcha?.();
    } else {
      captchaRef.current?.reset?.();
    }
  }, [isHCaptcha]);

  const show = useCallback(() => {
    captchaManager.requestShow(id);

    setIsVisible(true);
    reset();
  }, [reset, id]);

  const hide = useCallback(() => {
    captchaManager.notifyHide(id);

    setIsVisible(false);
    reset();
  }, [reset, id]);

  const onSuccess = useCallback(() => {
    setIsSuccessful(true);
    setIsError(false);
  }, []);

  const setError = useCallback((error: boolean) => {
    setIsError(error);
  }, []);

  const validateBeforeSubmit = useCallback((): {
    isValid: boolean;
    token?: string | null;
  } => {
    if (!publicKey || !isVisible) {
      return { isValid: true };
    }

    if (!isSuccessful) {
      setIsError(true);
      return { isValid: false };
    }

    const token = getToken();

    if (!isHCaptcha && token) {
      setIsError(false);
    }

    return {
      isValid: true,
      token,
    };
  }, [publicKey, isVisible, isSuccessful, getToken, isHCaptcha]);

  useEffect(() => {
    if (!isVisible) {
      reset();
    }
  }, [isVisible, reset]);

  return {
    isVisible,
    isError,
    isSuccessful,
    captchaRef,
    hCaptchaRef,
    show,
    hide,
    reset,
    getToken,
    onSuccess,
    setError,
    validateBeforeSubmit,
  };
};
