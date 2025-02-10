// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useEffect } from "react";
import { cssTransition, ToastContainer } from "react-toastify";
import classNames from "classnames";

import { useIsServer } from "../../hooks/useIsServer";

import { Portal } from "../portal";

import type { ToastProps, TData } from "./Toast.type";
import { toastr } from "./sub-components/Toastr";
import { ToastType } from "./Toast.enums";
import styles from "./Toast.module.scss";
import { useMobileViewport } from "./hooks/useMobileViewport";
import { getToastClassName } from "./utils/getToastClassName";

export { ToastType, TData, toastr };
export type { ToastProps };

const Slide = cssTransition({
  enter: "SlideIn",
  exit: "SlideOut",
});

const Toast = ({ className, style, isSSR }: ToastProps) => {
  const isServer = useIsServer();
  const offset = useMobileViewport();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--toast-top-offset", `${offset}px`);
  }, [offset]);

  const handleToastClick = React.useCallback(() => {
    const toasts = document.getElementsByClassName("Toastify__toast");
    Array.from(toasts).forEach((toast) => {
      (toast as HTMLElement).style.setProperty("position", "static");
    });
  }, []);

  if (isServer && isSSR) return null;

  const element = (
    <ToastContainer
      containerId="toast-container"
      className={classNames(className, styles.toast)}
      draggable
      position="top-right"
      toastClassName={getToastClassName}
      rtl
      hideProgressBar
      newestOnTop
      pauseOnFocusLoss={false}
      style={style}
      icon={false}
      transition={Slide}
      onClick={handleToastClick}
      data-testid="toast"
    />
  );

  const rootElement = document?.getElementById("root");

  return (
    <Portal element={element} appendTo={rootElement || undefined} visible />
  );
};

export { Toast };
