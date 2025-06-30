import React, { useMemo } from "react";

import { TUser } from "@docspace/shared/api/people/types";
import type {
  TSettings,
  TFirebaseSettings,
} from "@docspace/shared/api/settings/types";
import FirebaseHelper from "@docspace/shared/utils/firebase";
import { Error520SSR } from "@docspace/shared/components/errors/Error520";
import { ThemeProvider } from "@docspace/shared/components/theme-provider";

import useI18N from "@/hooks/useI18N";
import useTheme from "@/hooks/useTheme";
import useDeviceType from "@/hooks/useDeviceType";

import pkg from "../../../package.json";

export type ErrorProps = {
  user: TUser;
  settings: TSettings;
  error: Error;
};

const Error = ({ settings, user, error }: ErrorProps) => {
  const { i18n } = useI18N({ settings, user });
  const { currentDeviceType } = useDeviceType();

  const { theme } = useTheme({ initialTheme: user?.theme });

  const firebaseHelper = useMemo(() => {
    return new FirebaseHelper(settings?.firebase ?? ({} as TFirebaseSettings));
  }, [settings.firebase]);

  return (
    <ThemeProvider theme={theme}>
      <Error520SSR
        i18nProp={i18n}
        errorLog={error}
        version={pkg.version}
        user={user ?? ({} as TUser)}
        firebaseHelper={firebaseHelper}
        currentDeviceType={currentDeviceType}
      />
    </ThemeProvider>
  );
};

export default Error;
