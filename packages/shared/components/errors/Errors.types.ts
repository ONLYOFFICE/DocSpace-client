import type { TWhiteLabel } from "@docspace/shared/utils/whiteLabelHelper";
import type { TUser } from "@docspace/shared/api/people/types";
import type FirebaseHelper from "@docspace/shared/utils/firebase";
import type { TColorScheme } from "@docspace/shared/themes";
import type { DeviceType } from "@docspace/shared/enums";

export interface ErrorUnavailableProps {
  whiteLabelLogoUrls: TWhiteLabel[];
}

export interface Error520Props {
  errorLog: Error;
  user: TUser;
  version: string;
  firebaseHelper: FirebaseHelper;
  currentColorScheme?: TColorScheme;
  currentDeviceType: DeviceType;
  whiteLabelLogoUrls: TWhiteLabel[];
}
