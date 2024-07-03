import { createContext, ReactNode } from "react";

import { TSelectorBreadCrumbs } from "../Selector.types";

export const BreadCrumbsContext = createContext<TSelectorBreadCrumbs>({});

export const BreadCrumbsProvider = ({
  children,
  ...rest
}: TSelectorBreadCrumbs & { children: ReactNode }) => {
  return (
    <BreadCrumbsContext.Provider value={rest}>
      {children}
    </BreadCrumbsContext.Provider>
  );
};
