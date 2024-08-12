// (c) Copyright Ascensio System SIA 2009-2024
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

import { TColorScheme } from "../../themes";
import { DeviceType } from "../../enums";
import { TUser } from "../../api/people/types";
import { TTranslation } from "../../types";

import { ContextMenuModel } from "../context-menu";

export interface ArticleBackdropProps {
  onClick: (e: React.MouseEvent) => void;
}

export interface ArticleHeaderProps {
  showText: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  onLogoClickAction?: () => void;
  isBurgerLoading: boolean;
  withCustomArticleHeader: boolean;
  currentDeviceType: DeviceType;
}

export type TToggleArticleOpen = () => void;

export interface ArticleProfileProps {
  user?: TUser;
  showText: boolean;
  getActions?: (t: TTranslation) => ContextMenuModel[];
  onProfileClick?: (obj: { originalEvent: React.MouseEvent }) => void;
  currentDeviceType: DeviceType;
}

export interface ArticleZendeskProps {
  languageBaseName: string;
  email: string;
  displayName: string;
  currentColorScheme: TColorScheme;
  withMainButton: boolean;
  isMobileArticle: boolean;
  zendeskKey: string;
  showProgress: boolean;
  isShowLiveChat: boolean;
  isInfoPanelVisible?: boolean;
}

export interface ArticleAppsProps {
  showText: boolean;
  withDevTools: boolean;
}

export interface ArticleDevToolsBarProps {
  showText: boolean;
  articleOpen: boolean;
  currentDeviceType: DeviceType;
  toggleArticleOpen: TToggleArticleOpen;
}

export interface ArticleHideMenuButtonProps {
  showText: boolean;
  toggleShowText: () => void;
  currentColorScheme: TColorScheme;
  hideProfileBlock: boolean;
}

export interface ArticleProps {
  showText: boolean;
  setShowText: (value: boolean) => void;
  articleOpen: boolean;
  toggleShowText: () => void;
  toggleArticleOpen: TToggleArticleOpen;
  setIsMobileArticle: (value: boolean) => void;
  children: React.JSX.Element[];

  withMainButton?: boolean;

  hideProfileBlock: boolean;
  hideAppsBlock: boolean;

  currentColorScheme: TColorScheme;
  setArticleOpen: (value: boolean) => void;
  withSendAgain: boolean;
  mainBarVisible: boolean;
  isBannerVisible: boolean;

  isLiveChatAvailable: boolean;
  isShowLiveChat: boolean;

  isInfoPanelVisible?: boolean;

  onLogoClickAction?: () => void;

  currentDeviceType: DeviceType;
  showArticleLoader?: boolean;
  isAdmin: boolean;
  withCustomArticleHeader: boolean;

  onArticleHeaderClick?: () => void;
  isBurgerLoading: boolean;

  languageBaseName: string;
  zendeskEmail: string;
  chatDisplayName: string;
  isMobileArticle: boolean;
  zendeskKey: string;
  showProgress: boolean;

  user?: TUser;
  getActions?: (t: TTranslation) => ContextMenuModel[];
  onProfileClick?: () => void;

  isNonProfit?: boolean;
  isGracePeriod?: boolean;
  isFreeTariff?: boolean;
  isPaymentPageAvailable?: boolean;
  isLicenseExpiring?: boolean;
  isLicenseDateExpired?: boolean;
  isTrial?: boolean;
  standalone?: boolean;
  currentTariffPlanTitle?: string;
  trialDaysLeft?: number;
  organizationName: string;
}
