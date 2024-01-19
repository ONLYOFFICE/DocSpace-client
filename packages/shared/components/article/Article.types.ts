import { TTheme } from "../../themes";
import { ArticleAlerts, DeviceType } from "../../enums";
import { TWhiteLabel } from "../../utils/whiteLabelHelper";

export interface ArticleBackdropProps {
  onClick: (e: React.MouseEvent) => void;
}

export interface ArticleHeaderProps {
  showText: boolean;
  children: React.ReactNode;
  onClick: () => void;
  onLogoClickAction?: () => void;
  isBurgerLoading: boolean;
  whiteLabelLogoUrls: TWhiteLabel[];
  theme: TTheme;
  withCustomArticleHeader: boolean;
  currentDeviceType: DeviceType;
}

export type TRemoveAlert = (alertName: ArticleAlerts) => void;

export interface ArticleTeamTrainingAlertProps {
  bookTrainingEmail: string;
  removeAlertFromArticleAlertsData: TRemoveAlert;
}

export interface ArticleSubmitToFormGalleryAlertProps {
  setSubmitToGalleryDialogVisible: (value: boolean) => void;
  removeAlertFromArticleAlertsData: TRemoveAlert;
}

export type TToggleArticleOpen = () => void;

export interface ArticlePaymentAlertProps {
  isFreeTariff: boolean;
  currentTariffPlanTitle: string;
  toggleArticleOpen: TToggleArticleOpen;
}

export interface ArticleProfileProps {}
