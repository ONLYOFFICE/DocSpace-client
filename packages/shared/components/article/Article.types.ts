import { TColorScheme } from "../../themes";
import { ArticleAlerts, DeviceType } from "../../enums";
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

export type TRemoveAlert = (alertName: ArticleAlerts) => void;

export interface ArticleTeamTrainingAlertProps {
  bookTrainingEmail?: string;
  removeAlertFromArticleAlertsData?: TRemoveAlert;
}

export interface ArticleSubmitToFormGalleryAlertProps {
  setSubmitToGalleryDialogVisible?: (value: boolean) => void;
  removeAlertFromArticleAlertsData?: TRemoveAlert;
}

export type TToggleArticleOpen = () => void;

export interface ArticlePaymentAlertProps {
  isFreeTariff?: boolean;
  currentTariffPlanTitle?: string;
  toggleArticleOpen?: TToggleArticleOpen;
}

export interface ArticleProfileProps {
  user?: TUser;
  showText: boolean;
  getActions?: (t: TTranslation) => ContextMenuModel[];
  onProfileClick?: () => void;
  currentDeviceType: DeviceType;
  isVirtualKeyboardOpen: boolean;
}

export interface ArticleEnterpriseAlertProps {
  toggleArticleOpen?: TToggleArticleOpen;
  isLicenseDateExpired?: boolean;
  trialDaysLeft?: number;
  isTrial?: boolean;
  paymentDate?: Date;
  isEnterprise?: boolean;
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
}

export interface ArticleAlertsProps {
  articleAlertsData?: { current: string; available: string[] };
  incrementIndexOfArticleAlertsData?: () => void;
  showText?: boolean;
  isTeamTrainingAlertAvailable?: boolean;
  isSubmitToGalleryAlertAvailable?: boolean;
  bookTrainingEmail?: string;
  removeAlertFromArticleAlertsData?: TRemoveAlert;
  setSubmitToGalleryDialogVisible?: (value: boolean) => void;
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
  isVirtualKeyboardOpen: boolean;
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

  hideAlerts: boolean;
  articleAlertsData?: { current: string; available: string[] };
  incrementIndexOfArticleAlertsData?: () => void;
  isNonProfit?: boolean;
  isGracePeriod?: boolean;
  isFreeTariff?: boolean;
  isPaymentPageAvailable?: boolean;
  isTeamTrainingAlertAvailable?: boolean;
  isSubmitToGalleryAlertAvailable?: boolean;
  isLicenseExpiring?: boolean;
  isLicenseDateExpired?: boolean;
  isEnterprise?: boolean;
  isTrial?: boolean;
  standalone?: boolean;
  currentTariffPlanTitle?: string;
  bookTrainingEmail?: string;
  removeAlertFromArticleAlertsData?: TRemoveAlert;
  setSubmitToGalleryDialogVisible?: (value: boolean) => void;
  trialDaysLeft?: number;
  paymentDate?: Date;
}
