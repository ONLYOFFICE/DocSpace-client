import { TFolder } from "@docspace/shared/api/files/types";
import { ThemeKeys } from "@docspace/shared/enums";

export type EmptyViewProps = {
  current: TFolder;
  theme: ThemeKeys.BaseStr | ThemeKeys.DarkStr;
};
