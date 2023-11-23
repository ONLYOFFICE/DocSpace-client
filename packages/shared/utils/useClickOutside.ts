import { useEffect } from "react";

export const useClickOutside = (
  ref: { current: HTMLElement },
  handler: () => void,
  ...deps: any[]
) => {
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      e.stopPropagation();
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, ...deps]);
};
