export interface CampaignsBannerProps {
  /** Accepts id */
  id?: string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Background */
  campaignImage: string;
  /** Translations */
  campaignTranslate: ITranslate;
  /** Config */
  campaignConfig: IConfig;
  /** Button/Link action */
  onAction(type?: string, url?: string): void;
  /** Close action */
  onClose(): void;
}

interface ITranslate {
  Title?: string;
  BodyText?: string;
  ActionText?: string;
}

interface IStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
}

interface IAction {
  isButton?: boolean;
  backgroundColor?: string;
  url?: string;
  type?: string;
}

interface IConfig {
  borderColor?: string;
  title?: IStyle;
  body?: IStyle;
  action?: IStyle & IAction;
}
