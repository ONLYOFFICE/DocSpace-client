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

import { ReactNode } from "react";

import {
  TCapabilities,
  TGetColorTheme,
  TGetSsoSettings,
  TPasswordHash,
  TSettings,
  TThirdPartyProvider,
} from "@docspace/shared/api/settings/types";
import { TValidate } from "@docspace/shared/components/email-input/EmailInput.types";
import { IClientProps } from "@docspace/shared/utils/oauth/types";
import {
  EmployeeActivationStatus,
  RecaptchaType,
  ThemeKeys,
} from "@docspace/shared/enums";

import { ValidationResult } from "@/utils/enums";
import { TUser } from "@docspace/shared/api/people/types";

export type TError =
  | {
      response?: {
        status?: number | string;
        data?: {
          error?: {
            message: string;
          };
        };
      };
      statusText?: string;
      message?: string;
    }
  | string;

export type TTimeZoneOption = {
  key: string | number;
  label: string;
};

export type TPortal = { portalLink: string; portalName: string };

export type TCulturesOption =
  | {
      isBeta?: boolean;
      key: string | number;
      label: string;
      icon?: string | React.ElementType | React.ReactElement;
    }
  | {
      isBeta?: boolean;
      key: string | number;
      icon?: string | React.ElementType | React.ReactElement;
    };

export type TDataContext = {
  settings?: TSettings;
  colorTheme?: TGetColorTheme;
  systemTheme?: ThemeKeys;
};

export type TConfirmRouteContext = {
  linkData: {
    confirmHeader?: string;
    key?: string;
    emplType?: string;
    encemail?: string;
    uid?: string;
    type?: string;
    first?: string;
    roomId?: string;
    firstname?: string;
    lastname?: string;
    redirected?: string;
  };
  roomData: {
    roomId?: string;
    title?: string;
  };
  confirmLinkResult: {
    result?: ValidationResult;
    email?: string;
  };
};

export type TConfirmLinkParams = {
  key: string;
  emplType?: string;
  encemail: string;
  uid?: string;
  type?: string;
  first?: string;
  roomId?: string;
  linkData?: string;
  culture?: string;
  redirected?: string;
};

export type TConfirmLinkResult = {
  result: ValidationResult;
  roomId?: string;
  title?: string;
  email?: string;
};

export type TCreateUserData = {
  fromInviteLink: boolean;
  userName: string;
  passwordHash: string;
  cultureName: string;
  email: string;
  firstName: string;
  lastName: string;
  key?: string;
  type?: number;
  spam: boolean;
};

export type TActivateConfirmUser = {
  personalData: {
    firstname?: string;
    lastname?: string;
  };
  loginData: {
    userName: string;
    passwordHash: string;
  };
  key: string;
  userId: string;
  activationStatus: EmployeeActivationStatus;
};

export type TTfaSecretKeyAndQR = {
  account: string;
  manualEntryKey: string;
  qrCodeSetupImageUrl: string;
};

export interface ConfirmRouteProps {
  socketUrl?: string;
  children: ReactNode;
  confirmLinkResult: TConfirmLinkResult;
  confirmLinkParams: TConfirmLinkParams;
  user?: TUser;
}

export type GreetingCreateUserContainerProps = {
  type: string;
  displayName?: string;
  culture?: string;
  hostName?: string;
};

export type LoginProps = {
  searchParams: { [key: string]: string };
  isAuthenticated?: boolean;
  settings?: TSettings;
  capabilities?: TCapabilities;
  thirdPartyProvider?: TThirdPartyProvider[];
  ssoSettings?: TGetSsoSettings;
  systemTheme?: ThemeKeys;
  cultures: string[];
};

export type RegisterProps = {
  isAuthenticated: boolean;
  enabledJoin: boolean;
  trustedDomainsType?: number;
  trustedDomains?: string[];
  id?: string;
};

export type RegisterModalDialogProps = {
  visible: boolean;
  loading: boolean;
  email?: string;
  emailErr: boolean;
  onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidateEmail: (res: TValidate) => undefined;
  onBlurEmail: () => void;
  onSendRegisterRequest: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  onRegisterModalClose: () => void;
  trustedDomainsType?: number;
  trustedDomains?: string[];
  errorText?: string;
  isShowError?: boolean;
};

export type LoginFormProps = {
  hashSettings?: TPasswordHash;
  reCaptchaPublicKey?: string;
  reCaptchaType?: RecaptchaType;
  cookieSettingsEnabled: boolean;
  clientId?: string;
  client?: IClientProps;
  ldapDomain?: string;
  ldapEnabled?: boolean;
  baseDomain?: string;
};

export type ForgotPasswordModalDialogProps = {
  isVisible: boolean;
  userEmail?: string;
  onDialogClose: () => void;
};
