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

import { DeviceType } from "../../enums";
import { TUser } from "../../api/people/types";
import { TTranslation } from "../../types";

import { ContextMenuModel } from "../context-menu";

export type TToggleArticleOpen = () => void;

export type ArticleHeaderProps = {
  showText: boolean;
  children: React.ReactNode;
  onIconClick: () => void;
  onLogoClickAction?: () => void;
  isBurgerLoading: boolean;
  withCustomArticleHeader: boolean;
  currentDeviceType: DeviceType;
  showBackButton: boolean;
};

export type ArticleAppsProps = {
  showText: boolean;
  withDevTools: boolean;
  logoText: string;
  downloaddesktopUrl: string;
  officeforandroidUrl: string;
  officeforiosUrl: string;
};

export type ArticleHideMenuButtonProps = {
  showText: boolean;
  toggleShowText: VoidFunction;
  hideProfileBlock: boolean;
};

export type ArticleDevToolsBarProps = {
  showText: boolean;
  articleOpen: boolean;
  currentDeviceType: DeviceType;
  toggleArticleOpen: TToggleArticleOpen;
  path?: string;
};

export type ArticleZendeskProps = {
  languageBaseName: string;
  zendeskEmail: string;
  chatDisplayName: string;
  withMainButton?: boolean;
  isMobileArticle: boolean;
  zendeskKey: string;
  showProgress: boolean;
  isShowLiveChat: boolean;
  isInfoPanelVisible?: boolean;
};

export type ArticleProfileProps = {
  user?: TUser;
  showText: boolean;
  getActions?: (t: TTranslation) => ContextMenuModel[];
  onProfileClick?: (obj: { originalEvent: React.MouseEvent }) => void;
  currentDeviceType: DeviceType;
};

export type ArticleProps = ArticleProfileProps &
  ArticleZendeskProps &
  ArticleDevToolsBarProps &
  ArticleHideMenuButtonProps &
  Omit<ArticleHeaderProps, "children" | "onClick" | "onIconClick"> &
  Omit<ArticleAppsProps, "withDevTools"> & {
    setShowText: (value: boolean) => void;
    setIsMobileArticle: (value: boolean) => void;
    children: React.JSX.Element[];

    hideAppsBlock: boolean;

    setArticleOpen: (value: boolean) => void;
    withSendAgain: boolean;
    mainBarVisible: boolean;

    isLiveChatAvailable: boolean;

    showArticleLoader?: boolean;
    isAdmin: boolean;

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

    limitedAccessDevToolsForUsers: boolean;
  };
