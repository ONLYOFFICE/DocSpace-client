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

import React from "react";
import { Id, toast, ToastPosition } from "react-toastify";
import classNames from "classnames";

import CheckToastReactSvg from "PUBLIC_DIR/images/check.toast.react.svg";
import DangerToastReactSvg from "PUBLIC_DIR/images/danger.toast.react.svg";
import InfoToastReactSvg from "PUBLIC_DIR/images/info.toast.react.svg";
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import { IconSizeType } from "../../../utils/common-icons-style";
import { getCookie } from "../../../utils/cookie";

import { Text } from "../../text";
import { IconButton } from "../../icon-button";

import { ToastType } from "../Toast.enums";
import { TData } from "../Toast.type";
import styles from "../Toast.module.scss";

const DEFAULT_TIMEOUT = 5000;
const MIN_TIMEOUT_THRESHOLD = 750;

interface NotifyConfig {
  type: ToastType;
  defaultTitleKey: "Done" | "Warning" | "Alert" | "Info";
}

const TOAST_CONFIGS: Record<ToastType, NotifyConfig> = {
  [ToastType.success]: { type: ToastType.success, defaultTitleKey: "Done" }, // t("Common:Done")
  [ToastType.error]: { type: ToastType.error, defaultTitleKey: "Warning" }, // t("Common:Warning")
  [ToastType.warning]: { type: ToastType.warning, defaultTitleKey: "Alert" }, // t("Common:Alert")
  [ToastType.info]: { type: ToastType.info, defaultTitleKey: "Info" }, // t("Common:Info")
};

const getTitle = (type: "Done" | "Warning" | "Alert" | "Info") => {
  const cookieLang = getCookie("asc_language");
  const lang =
    cookieLang === "en-US" || cookieLang === "en-GB" ? "en" : cookieLang;

  const commonKeys =
    (window.i18n &&
      Object.getOwnPropertyNames(window.i18n.loaded).filter(
        (k) => k.indexOf(`${lang}/Common.json`) > -1,
      )) ||
    [];

  if (commonKeys.length === 0) return undefined;

  const key = commonKeys.length === 1 ? commonKeys[0] : commonKeys[1];

  const title = window.i18n.loaded[key].data[type];

  return title;
};

const Icon = ({ type, size }: { type: ToastType; size: IconSizeType }) => {
  const iconMap = {
    [ToastType.success]: (
      <CheckToastReactSvg
        data-size={size}
        className="toastr_icon toastr_success"
      />
    ),
    [ToastType.error]: (
      <DangerToastReactSvg
        data-size={size}
        className={classNames(styles.toastrIcon, "toastr_icon toastr_error")}
      />
    ),
    [ToastType.warning]: (
      <DangerToastReactSvg
        data-size={size}
        className={classNames(styles.toastrIcon, "toastr_icon toastr_warning")}
      />
    ),
    [ToastType.info]: (
      <InfoToastReactSvg
        data-size={size}
        className={classNames(styles.toastrIcon, "toastr_icon toastr_info")}
      />
    ),
  };

  return iconMap[type] || iconMap[ToastType.info];
};

const CloseButton = ({ closeToast }: { closeToast?: () => void }) => (
  <IconButton
    className={`${styles.iconButton} closeButton`}
    onClick={closeToast}
    iconName={CrossIconReactSvgUrl}
    size={12}
  />
);

const createToastContent = (
  type: ToastType,
  data: string | React.ReactNode,
  title: string,
) => (
  <div className={styles.toastContent} data-type={type}>
    <div className="icon-wrapper">
      <Icon size={IconSizeType.medium} type={type} />
    </div>
    <div className="toast-text-container">
      {title ? <Text className="toast-title">{title}</Text> : null}
      {typeof data === "string"
        ? data && <Text className="toast-text">{data}</Text>
        : data}
    </div>
  </div>
);

const getToastOptions = (
  type: ToastType,
  data: string | React.ReactNode,
  timeout: number,
  withCross: boolean,
  centerPosition: boolean,
) => ({
  data,
  type,
  closeOnClick: !withCross,
  closeButton: withCross && <CloseButton />,
  autoClose: (timeout === 0
    ? false
    : timeout < MIN_TIMEOUT_THRESHOLD
      ? DEFAULT_TIMEOUT
      : timeout || 5000) as number | false,
  position: centerPosition ? ("top-center" as ToastPosition) : undefined,
  containerId: "toast-container",
});

const notify = (
  type: ToastType,
  data: string | React.ReactNode,
  title: string,
  timeout = DEFAULT_TIMEOUT,
  withCross = false,
  centerPosition = false,
) => {
  const content = createToastContent(type, data, title);
  const options = getToastOptions(
    type,
    data,
    timeout,
    withCross,
    centerPosition,
  );
  return toast(content, options);
};

const processErrorData = (
  data: string | TData | React.ReactNode,
): string | React.ReactNode => {
  if (
    typeof data === "string" ||
    React.isValidElement(data) ||
    Array.isArray(data)
  ) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    ("response" in data || "statusText" in data || "message" in data)
  ) {
    return (
      data?.response?.data?.error?.message ||
      data?.statusText ||
      data?.message ||
      ""
    );
  }

  return "";
};

const createToastMethod =
  (type: ToastType) =>
  (
    data: string | TData | React.ReactNode,
    title?: string,
    timeout?: number,
    withCross?: boolean,
    centerPosition?: boolean,
  ) => {
    const config = TOAST_CONFIGS[type];
    const finalTitle = title || getTitle(config.defaultTitleKey) || "";
    const message = processErrorData(data);

    return notify(
      type,
      message,
      finalTitle,
      timeout ?? DEFAULT_TIMEOUT,
      withCross,
      centerPosition,
    );
  };

const toastr = {
  success: createToastMethod(ToastType.success),
  error: createToastMethod(ToastType.error),
  warning: createToastMethod(ToastType.warning),
  info: createToastMethod(ToastType.info),
  clear: () => toast.dismiss(),
  isActive: (id: Id) => toast.isActive(id),
} as const;

export { toastr };
