import React from "react";

import { UseLoadersHelperProps } from "../FilesSelector.types";
import {
  MIN_LOADER_TIMER,
  SHOW_LOADER_TIMER,
} from "../FilesSelector.constants";

const useLoadersHelper = ({ items }: UseLoadersHelperProps) => {
  const [isBreadCrumbsLoading, setIsBreadCrumbsLoading] =
    React.useState<boolean>(true);
  const [isNextPageLoading, setIsNextPageLoading] =
    React.useState<boolean>(false);

  const [showBreadCrumbsLoader, setShowBreadCrumbsLoader] =
    React.useState<boolean>(true);
  const [showLoader, setShowLoader] = React.useState<boolean>(true);

  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  const startLoader = React.useRef<Date | null>(new Date());

  const breadCrumbsLoaderTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const breadCrumbsStartLoader = React.useRef<Date | null>(new Date());

  const isMount = React.useRef<boolean>(true);

  React.useEffect(() => {
    isMount.current = true;
    return () => {
      isMount.current = false;
    };
  }, []);

  const calculateLoader = React.useCallback(() => {
    if (isFirstLoad) {
      setShowLoader(true);

      startLoader.current = new Date();
    } else if (startLoader.current) {
      const currentDate = new Date();

      const ms = Math.abs(
        startLoader.current.getTime() - currentDate.getTime(),
      );

      if (ms >= MIN_LOADER_TIMER) {
        startLoader.current = null;
        return setShowLoader(false);
      }

      setTimeout(() => {
        if (isMount.current) {
          startLoader.current = null;
          setShowLoader(false);
        }
      }, MIN_LOADER_TIMER - ms);
    }
  }, [isFirstLoad]);

  const calculateBreadCrumbsLoader = React.useCallback(() => {
    if (isBreadCrumbsLoading) {
      if (breadCrumbsLoaderTimeout.current) {
        return;
      }
      breadCrumbsStartLoader.current = new Date();
      breadCrumbsLoaderTimeout.current = setTimeout(() => {
        if (isMount.current) setShowBreadCrumbsLoader(true);
      }, SHOW_LOADER_TIMER);
    } else {
      if (breadCrumbsLoaderTimeout.current) {
        clearTimeout(breadCrumbsLoaderTimeout.current);
        breadCrumbsLoaderTimeout.current = null;
        breadCrumbsStartLoader.current = null;
        return setShowBreadCrumbsLoader(false);
      }

      if (breadCrumbsStartLoader.current) {
        const currentDate = new Date();

        const ms = Math.abs(
          breadCrumbsStartLoader.current.getTime() - currentDate.getTime(),
        );

        if (ms >= MIN_LOADER_TIMER) {
          breadCrumbsStartLoader.current = null;
          return setShowBreadCrumbsLoader(false);
        }

        setTimeout(() => {
          if (isMount.current) {
            breadCrumbsStartLoader.current = null;
            setShowBreadCrumbsLoader(false);
          }
        }, MIN_LOADER_TIMER - ms);
      }
    }
  }, [isBreadCrumbsLoading]);

  React.useEffect(() => {
    if (items.length && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isFirstLoad, items]);

  React.useEffect(() => {
    calculateLoader();
  }, [calculateLoader]);

  React.useEffect(() => {
    calculateBreadCrumbsLoader();
  }, [isBreadCrumbsLoading, calculateBreadCrumbsLoader]);

  return {
    isBreadCrumbsLoading,
    setIsBreadCrumbsLoading,
    isNextPageLoading,
    setIsNextPageLoading,

    isFirstLoad,
    setIsFirstLoad,

    showBreadCrumbsLoader,
    showLoader,
  };
};

export default useLoadersHelper;
