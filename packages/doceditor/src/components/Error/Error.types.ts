import type { TUser } from "@docspace/shared/api/people/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

export type ErrorProps = {
  user: TUser;
  settings: TSettings;
  error: Error;
};
