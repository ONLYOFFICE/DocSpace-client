import { TCreatedBy } from "../../types";

export type TAPIPlugin = {
  name: string;
  version: string;
  description: string;
  license: string;
  author: string;
  homePage: string;
  pluginName: string;
  scopes: string;
  image: string;
  createBy: TCreatedBy;
  createOn: Date;
  enabled: boolean;
  system: boolean;
  url: string;
  settings: string;
};
