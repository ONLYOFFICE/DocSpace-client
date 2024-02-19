import { TFile } from "@docspace/shared/api/files/types";
import { DeviceType } from "@docspace/shared/enums";
import { TTheme } from "@docspace/shared/themes";
import { TWhiteLabel } from "@docspace/shared/utils/whiteLabelHelper";

import { TDeepLinkConfig } from "./DeepLink.helper";

export interface DeepLinkProps {
  fileInfo?: TFile;
  logoUrls: TWhiteLabel[];
  userEmail?: string;

  theme: TTheme;

  currentDeviceType: DeviceType;
  deepLinkConfig?: TDeepLinkConfig;

  setIsShowDeepLink: (value: boolean) => void;
}
