import type { PROVIDERS_DATA } from "@docspace/shared/constants";

export type ProvidersDataType = typeof PROVIDERS_DATA;

interface IProvider {
  linked: boolean;
  provider: string;
  url: string;
}

export interface SocialButtonProps {
  providers: IProvider[];
  provider: string;
  ssoLabel: string;
  ssoUrl: string;
  ssoSVG: string;
  t: (key: string, opts?: unknown) => string;
  /** Sets a callback function that is triggered when the button is clicked */
  onClick: (e: React.MouseEvent<Element, MouseEvent>) => void;
  /** Sets the button to present a disabled state */
  isDisabled: boolean;
}
