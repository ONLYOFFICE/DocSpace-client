import React from "react";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { frameCallCommand } from "@docspace/shared/utils/common";
import { Nullable, TTranslation } from "@docspace/shared/types";

import { TError } from "@/types";

interface UseErrorProps {
  error?: TError;
  editorUrl?: string;
  t?: Nullable<TTranslation>;
}

const useError = ({ error, editorUrl, t }: UseErrorProps) => {
  React.useEffect(() => {
    if (error?.message === "unauthorized") {
      sessionStorage.setItem("referenceUrl", window.location.href);

      window.open(
        combineUrl(window.DocSpaceConfig?.proxy?.url, "/login"),
        "_self",
      );
    }
  }, [error]);

  React.useEffect(() => {
    if (error?.status === 402) {
      const portalUrl = window.location.origin;

      history.pushState({}, "false", portalUrl);
      document.location.reload();
    } else {
      const tempElm = document.getElementById("loader");

      const isLoadingDocumentError = error !== null;
      const isLoadedDocument = !error && editorUrl;

      if (tempElm && (isLoadingDocumentError || isLoadedDocument))
        tempElm.outerHTML = "";

      if (isLoadingDocumentError) frameCallCommand("setIsLoaded");
    }
  }, [editorUrl, error]);

  const onError = React.useCallback(() => {
    window.open(
      combineUrl(window.DocSpaceConfig?.proxy?.url, "/login"),
      "_self",
    );
  }, []);

  const getErrorMessage = React.useCallback(() => {
    if (typeof error !== "string") return error?.message;

    if (error === "restore-backup") return t?.("Common:PreparationPortalTitle");

    return error;
  }, [error, t]);

  return { onError, getErrorMessage };
};

export default useError;
