import {
  ReactNode,
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";

import { TSelectorSearch } from "../Selector.types";

export const SearchContext = createContext<TSelectorSearch>({});

export const SearchValueContext = createContext<boolean>(false);

export const SearchDispatchContext = createContext<
  Dispatch<SetStateAction<boolean>>
>(() => {});

const SearchActionProvider = ({ children }: { children: ReactNode }) => {
  const [isSearch, setIsSearch] = useState(false);

  return (
    <SearchDispatchContext.Provider value={setIsSearch}>
      <SearchValueContext.Provider value={isSearch}>
        {children}
      </SearchValueContext.Provider>
    </SearchDispatchContext.Provider>
  );
};

export const SearchProvider = ({
  children,
  ...rest
}: TSelectorSearch & { children: ReactNode }) => {
  return (
    <SearchContext.Provider value={rest}>
      <SearchActionProvider> {children}</SearchActionProvider>
    </SearchContext.Provider>
  );
};
