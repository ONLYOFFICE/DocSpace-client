import type { PROVIDERS_DATA } from "@docspace/shared/constants";

export type ProvidersDataType = typeof PROVIDERS_DATA;

interface IProvider {
  linked: boolean;
  provider: string;
  url: string;
}

export interface MoreLoginModalProps {
  visible: boolean;
  onClose: VoidFunction;
  providers?: IProvider[];
  onSocialLoginClick: (e: React.MouseEvent<Element, MouseEvent>) => void;
  ssoLabel: string;
  ssoUrl: string;
  t: (key: string, opts?: unknown) => string;
  isSignUp: boolean;
}
