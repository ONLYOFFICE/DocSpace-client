// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ToastClassName, cssTransition } from "react-toastify";
import { isMobileOnly } from "react-device-detect";

import StyledToastContainer from "./Toast.styled";
import { ToastProps } from "./Toast.type";
import { Portal } from "../portal";
import { useIsServer } from "../../hooks/useIsServer";

const Slide = cssTransition({
  enter: "SlideIn",
  exit: "SlideOut",
});

const Toast = (props: ToastProps) => {
  const [offset, setOffset] = useState(0);

  const isServer = useIsServer();

  const onToastClick = () => {
    const documentElement = document.getElementsByClassName("Toastify__toast");
    if (documentElement.length > 1)
      for (let i = 0; i < documentElement.length; i += 1) {
        const el = documentElement[i] as HTMLElement;
        el.style.setProperty("position", "static");
      }
  };

  const onResize = useCallback((event: Event) => {
    if (window.visualViewport) {
      const target = event.target as Window;
      const topOffset = target.innerHeight - window.visualViewport.height;

      setOffset(topOffset);
    }
  }, []);

  const toastClassName: ToastClassName = (context) => {
    switch (context?.type) {
      case "success":
        return "Toastify__toast Toastify__toast--success";
      case "error":
        return "Toastify__toast Toastify__toast--error";
      case "info":
        return "Toastify__toast Toastify__toast--info";
      case "warning":
        return "Toastify__toast Toastify__toast--warning";
      default:
        return "Toastify__toast";
    }
  };

  useEffect(() => {
    if (isMobileOnly) {
      window.addEventListener("resize", onResize);
    }

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  const { className, style, isSSR } = props;

  const element = (
    <StyledToastContainer
      containerId="toast-container"
      className={className}
      draggable
      position="top-right"
      toastClassName={toastClassName}
      rtl
      hideProgressBar
      newestOnTop
      pauseOnFocusLoss={false}
      style={style}
      icon={false}
      transition={Slide}
      onClick={onToastClick}
      $topOffset={offset}
      data-testid="toast"
    />
  );

  if (isServer && isSSR) return null;

  const rootElement = document?.getElementById("root");

  return (
    <Portal element={element} appendTo={rootElement || undefined} visible />
  );
};

export { Toast };
