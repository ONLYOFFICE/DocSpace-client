import { TColorScheme } from "../../themes";
import { DeviceType } from "../../enums";
import { TWhiteLabel } from "../../utils/whiteLabelHelper";
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
  whiteLabelLogoUrls: TWhiteLabel[];
  withCustomArticleHeader: boolean;
  currentDeviceType: DeviceType;
}

export type TToggleArticleOpen = () => void;

export interface ArticleProfileProps {
  user?: TUser;
  showText: boolean;
  getActions?: (t: TTranslation) => ContextMenuModel[];
  onProfileClick?: () => void;
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

  onLogoClickAction?: () => void;

  currentDeviceType: DeviceType;
  showArticleLoader?: boolean;
  isAdmin: boolean;
  withCustomArticleHeader: boolean;

  onArticleHeaderClick?: () => void;
  isBurgerLoading: boolean;
  whiteLabelLogoUrls: TWhiteLabel[];

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
  isEnterprise?: boolean;
  isTrial?: boolean;
  standalone?: boolean;
  currentTariffPlanTitle?: string;
  trialDaysLeft?: number;
  paymentDate?: Date;
}
