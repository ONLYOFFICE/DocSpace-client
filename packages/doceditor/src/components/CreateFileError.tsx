"use client";

import React from "react";
import { toast } from "react-toastify";

import { Toast } from "@docspace/shared/components/toast";
import { ThemeProvider } from "@docspace/shared/components/theme-provider";
import { toastr } from "@docspace/shared/components/toast";
import { Error520SSR } from "@docspace/shared/components/errors/Error520";
import { TUser } from "@docspace/shared/api/people/types";
import {
  TFirebaseSettings,
  TSettings,
} from "@docspace/shared/api/settings/types";
import FirebaseHelper from "@docspace/shared/utils/firebase";

import useDeviceType from "@/hooks/useDeviceType";
import useWhiteLabel from "@/hooks/useWhiteLabel";
import useI18N from "@/hooks/useI18N";
import useTheme from "@/hooks/useTheme";

import pkg from "../../package.json";

toast.configure();

type CreateFileErrorProps = {
  error: Error;
  fileInfo: object;
  fromTemplate: boolean;
  fromFile: boolean;
  settings?: TSettings;
  user?: TUser;
};

const CreateFileError = ({
  error,
  fileInfo,
  fromFile,
  fromTemplate,
  settings,
  user,
}: CreateFileErrorProps) => {
  const firebaseHelper = new FirebaseHelper({} as TFirebaseSettings);

  const { i18n } = useI18N({ settings, user });
  const { currentDeviceType } = useDeviceType();
  const { logoUrls } = useWhiteLabel();
  const { theme } = useTheme({ user });

  const t = i18n.t ? i18n.t.bind(i18n) : null;
  const message = error.message ?? error ?? "";

  const showingToast = React.useRef(false);

  React.useEffect(() => {
    if (fromFile && message.includes("password")) {
      const searchParams = new URLSearchParams();
      searchParams.append("createError", JSON.stringify({ fileInfo }));

      window.location.replace(
        `${window.location.origin}?${searchParams.toString()}`,
      );
    } else {
      if (!t || showingToast.current) return;
      showingToast.current = true;
      toastr.error(message, t?.("Common:Warning"));
    }
  }, [fileInfo, fromFile, message, t]);

  if (fromFile && message.includes("password")) return null;

  return (
    <ThemeProvider theme={theme}>
      <Toast />
      <Error520SSR
        i18nProp={i18n}
        errorLog={error}
        user={user ?? ({} as TUser)}
        currentDeviceType={currentDeviceType}
        version={pkg.version}
        firebaseHelper={firebaseHelper}
        whiteLabelLogoUrls={logoUrls}
      />
    </ThemeProvider>
  );
};

export default CreateFileError;
