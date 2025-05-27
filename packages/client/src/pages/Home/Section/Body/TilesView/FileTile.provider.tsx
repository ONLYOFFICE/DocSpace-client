import { createContext, PropsWithChildren, useMemo } from "react";

type FileTileContextType = {
  thumbSize: string;
  columnCount: null | number;
};

export const FileTileContext = createContext<FileTileContextType>({
  columnCount: null,
  thumbSize: "",
});

export const FileTileProvider = ({
  children,
  columnCount,
  thumbSize,
}: PropsWithChildren<FileTileContextType>) => {
  const value = useMemo(
    () => ({ columnCount, thumbSize }),
    [thumbSize, columnCount],
  );

  return <FileTileContext value={value}>{children}</FileTileContext>;
};
