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

import React from "react";
import { Id, toast } from "react-toastify";
import styled from "styled-components";

import CheckToastReactSvg from "PUBLIC_DIR/images/check.toast.react.svg";
import DangerToastReactSvg from "PUBLIC_DIR/images/danger.toast.react.svg";
import InfoToastReactSvg from "PUBLIC_DIR/images/info.toast.react.svg";
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";

import commonIconsStyles, {
  IconSizeType,
} from "../../../utils/common-icons-style";
import { getCookie } from "../../../utils/cookie";

import { Text } from "../../text";
import { Box } from "../../box";

import {
  StyledCloseWrapper,
  StyledDiv,
  IconWrapper,
  StyledIconButton,
} from "../Toast.styled";
import { ToastType } from "../Toast.enums";
import { TData } from "../Toast.type";

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

const StyledCheckToastIcon = styled(CheckToastReactSvg)`
  ${commonIconsStyles}
`;
const StyledDangerToastIcon = styled(DangerToastReactSvg)`
  ${commonIconsStyles}
`;
const StyledInfoToastIcon = styled(InfoToastReactSvg)`
  ${commonIconsStyles}
`;

// eslint-disable-next-line react/prop-types
const Icon = ({ type, size }: { type: ToastType; size: IconSizeType }) =>
  type === ToastType.success ? (
    <StyledCheckToastIcon size={size} className="toastr_icon toastr_success" />
  ) : type === ToastType.error ? (
    <StyledDangerToastIcon size={size} className="toastr_icon toastr_error" />
  ) : type === ToastType.warning ? (
    <StyledDangerToastIcon size={size} className="toastr_icon toastr_warning" />
  ) : (
    <StyledInfoToastIcon size={size} className="toastr_icon toastr_info" />
  );

const CloseButton = ({ closeToast }: { closeToast?: () => {} }) => (
  <StyledCloseWrapper>
    <StyledIconButton
      className="closeButton"
      onClick={closeToast}
      iconName={CrossIconReactSvgUrl}
      size={12}
    />
  </StyledCloseWrapper>
);

const notify = (
  type: ToastType,
  data: string | React.ReactNode,
  title: string,
  timeout = 5000,
  withCross = false,
  centerPosition = false,
) => {
  return toast(
    <Box displayProp="flex" alignItems="center">
      <IconWrapper>
        <Icon size={IconSizeType.medium} type={type} />
      </IconWrapper>

      <StyledDiv type={type}>
        {title && <Text className="toast-title">{title}</Text>}
        {typeof data === "string"
          ? data && <Text className="toast-text">{data}</Text>
          : data}
      </StyledDiv>
    </Box>,
    {
      data,
      type,
      closeOnClick: !withCross,
      closeButton: withCross && <CloseButton />,
      autoClose: timeout === 0 ? false : timeout < 750 ? 5000 : timeout || 5000,
      position: centerPosition ? "top-center" : undefined,
      containerId: "toast-container",
    },
  );
};

function success(
  data: string | React.ReactNode,
  title?: string,
  timeout?: number,
  withCross?: boolean,
  centerPosition?: boolean,
  withDefaultTitle = true,
) {
  return notify(
    ToastType.success,
    data,
    title || withDefaultTitle ? getTitle("Done") || "" : "",
    timeout || 5000,
    withCross,
    centerPosition,
  );
}

// function fatal(
//   data: string | React.ReactNode | { statusText?: string; message?: string },
//   title: string,
//   timeout = 5000,
//   withCross = false,
//   centerPosition = false,
// ) {
//   const dataType = typeof data;

//   const message =
//     dataType === "string"
//       ? data
//       : dataType === "object" && "statusText" in data && data?.statusText
//         ? data.statusText
//         : dataType === "object" && "message" in data && data.message
//           ? data.message
//           : "";

//   return notify(
//     ToastType.error,
//     message,
//     title || getTitle("Error") || "",
//     timeout || 5000,
//     withCross,
//     centerPosition,
//   );
// }

function error(
  data: string | TData | React.ReactNode,
  title?: string,
  timeout?: number,
  withCross?: boolean,
  centerPosition?: boolean,
) {
  let message: string | React.ReactNode | undefined = "";

  if (typeof data === "string") {
    message = data;
  } else if (
    data &&
    typeof data === "object" &&
    ("response" in data || "statusText" in data || "message" in data)
  ) {
    message =
      data?.response?.data?.error?.message || data?.statusText || data?.message;
  } else if (React.isValidElement(data)) {
    message = data;
  }

  console.error(message);

  return notify(
    ToastType.error,
    message,
    title || getTitle("Warning") || "",
    timeout || 5000,
    withCross,
    centerPosition,
  );
}

function warning(
  data: string | React.ReactNode,
  title?: string,
  timeout?: number,
  withCross?: boolean,
  centerPosition?: boolean,
) {
  return notify(
    ToastType.warning,
    data,
    title || getTitle("Alert") || "",
    timeout || 5000,
    withCross,
    centerPosition,
  );
}

function info(
  data: string | React.ReactNode,
  title?: string,
  timeout?: number,
  withCross?: boolean,
  centerPosition?: boolean,
) {
  return notify(
    ToastType.info,
    data,
    title || getTitle("Info") || "",
    timeout || 5000,
    withCross,
    centerPosition,
  );
}

function clear() {
  return toast.dismiss();
}

function isActive(id: Id) {
  return toast.isActive(id);
}

const toastr = {
  clear,
  error,
  info,
  success,
  warning,
  isActive,
};

export { toastr };
