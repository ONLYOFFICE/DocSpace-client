export interface CampaignsBannerProps {
  /** Accepts id */
  id?: string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Label */
  headerLabel: string;
  /** Label subheader */
  subHeaderLabel: string;
  /** Image source */
  img: string;
  /** Header button text */
  buttonLabel: string;
  /** The link that opens when the button is clicked */
  link: string;
}
