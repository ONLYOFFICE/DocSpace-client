export * from "./settings";
export * from "./capabilities";
export * from "./people";
export * from "./oauth";
export * from "./authentication";
export * from "./portal";
export * from "./files";

export { endpoints, type TEndpoint } from "./endpoints";

import { settingsHandlers } from "./settings";
import { capabilitiesHandlers } from "./capabilities";
import { peopleHandlers } from "./people";
import { oauthHandlers } from "./oauth";
import { authenticationHandlers } from "./authentication";
import { portalHandlers } from "./portal";
import { filesHandlers } from "./files";

export const allHandlers = (port: string) => [
  ...settingsHandlers(port),
  ...capabilitiesHandlers(port),
  ...peopleHandlers(port),
  ...oauthHandlers(port),
  ...authenticationHandlers(port),
  ...portalHandlers(port),
  ...filesHandlers(port),
];
