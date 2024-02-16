import React from "react";

import { FileType } from "@docspace/shared/enums";
import { getCookie } from "@docspace/shared/utils";
import { isRetina } from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";

import PresentationIcoUrl from "PUBLIC_DIR/images/presentation.ico?url";
import SpreadSheetIcoUrl from "PUBLIC_DIR/images/spreadsheet.ico?url";
import TextIcoUrl from "PUBLIC_DIR/images/text.ico?url";
import PDFIcoUrl from "PUBLIC_DIR/images/pdf.ico?url";

interface UseRootInitProps {
  documentType?: string;
  fileType?: "pdf" | FileType;
}

const useRootInit = ({ documentType, fileType }: UseRootInitProps) => {
  React.useEffect(() => {
    let icon: string = "";

    switch (documentType) {
      case "word":
        icon = fileType === "pdf" ? PDFIcoUrl : TextIcoUrl;
        break;
      case "slide":
        icon = PresentationIcoUrl;
        break;
      case "cell":
        icon = SpreadSheetIcoUrl;
        break;
      default:
        icon = TextIcoUrl;
        break;
    }

    if (icon) {
      const el = document.getElementById("favicon") as HTMLLinkElement;

      el.href = icon;
    }
  }, [documentType, fileType]);

  React.useEffect(() => {
    if (isRetina() && getCookie("is_retina") == null) {
      setCookie("is_retina", "true", { path: "/" });
    }
  }, []);
};

export default useRootInit;
