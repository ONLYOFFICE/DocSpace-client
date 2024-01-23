export type TTfaType = "sms" | "app" | "none";

export type TTfa = {
  id: string;
  title: string;
  enabled: boolean;
  avaliable: boolean;
};
