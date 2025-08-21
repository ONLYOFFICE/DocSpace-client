"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  frameCallbackData,
  frameCallCommand,
} from "@docspace/shared/utils/common";
import { TFrameConfig } from "@docspace/shared/types/Frame";

const SDKConfigContext = createContext<TFrameConfig | null>(null);

export const SDKConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sdkConfig, setSdkConfig] = useState<TFrameConfig | null>(null);

  const handleMessage = useCallback((e: MessageEvent) => {
    const eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;

    if (eventData.data) {
      const { data, methodName } = eventData.data;

      if (!methodName) return;

      let res;

      try {
        switch (methodName) {
          case "setConfig":
            setSdkConfig(data);
            res = data;
            break;
          default:
            res = "Wrong method for this mode";
        }
      } catch (err) {
        res = err;
      }

      frameCallbackData(res);
    }
  }, []);

  const callSetConfig = useCallback(() => {
    frameCallCommand("setConfig", { src: window.location.origin });
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage, false);
    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, [handleMessage]);

  useEffect(() => {
    if (window.parent && !sdkConfig?.frameId) {
      callSetConfig();
    }
  }, [sdkConfig?.frameId, callSetConfig]);

  return (
    <SDKConfigContext.Provider value={sdkConfig}>
      {children}
    </SDKConfigContext.Provider>
  );
};

export const useSDKConfig = () => {
  const sdkConfig = useContext(SDKConfigContext);

  return { sdkConfig };
};
