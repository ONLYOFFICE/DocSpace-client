import type { PropsWithChildren } from "react";

import type { DeviceType } from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";
import type FirebaseHelper from "@docspace/shared/utils/firebase";
import type { TWhiteLabel } from "@docspace/shared/utils/whiteLabelHelper";
import type { TColorScheme, TTheme } from "@docspace/shared/themes";
import { i18n } from "i18next";

export interface ErrorBoundaryProps extends PropsWithChildren {
  onError?: VoidFunction;
  user: TUser;
  version: string;
  firebaseHelper: FirebaseHelper;
  currentDeviceType: DeviceType;
  whiteLabelLogoUrls: TWhiteLabel[];
  currentColorScheme?: TColorScheme;

  isNextJS?: boolean;
  theme?: TTheme;
  i18n?: i18n;
}

export interface ErrorBoundaryState {
  error: Error | null;
}
