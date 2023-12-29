/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

export const useClickOutside = (
  ref: { current: HTMLElement },
  handler: () => void,
  ...deps: unknown[]
) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(target)) handler();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, ...deps]);
};
