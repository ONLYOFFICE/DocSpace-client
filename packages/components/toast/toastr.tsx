import React from "react";
import { toast } from "react-toastify";
import styled from "styled-components";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/check.toast.... Remove this comment to see the full error message
import CheckToastReactSvg from "PUBLIC_DIR/images/check.toast.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/danger.toast... Remove this comment to see the full error message
import DangerToastReactSvg from "PUBLIC_DIR/images/danger.toast.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/info.toast.r... Remove this comment to see the full error message
import InfoToastReactSvg from "PUBLIC_DIR/images/info.toast.react.svg";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/cross.react.... Remove this comment to see the full error message
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";

import Text from "../text";
import {
  StyledCloseWrapper,
  StyledDiv,
  IconWrapper,
  StyledIconButton,
} from "./styled-toastr";
import commonIconsStyles from "../utils/common-icons-style";
import { getCookie } from "../utils/cookie";

const getTitle = (type: any) => {
  const cookieLang = getCookie("asc_language");
  const lang =
    cookieLang == "en-US" || cookieLang == "en-GB" ? "en" : cookieLang;

  const commonKeys =
    // @ts-expect-error TS(2339): Property 'i18n' does not exist on type 'Window & t... Remove this comment to see the full error message
    (window.i18n &&
      // @ts-expect-error TS(2339): Property 'i18n' does not exist on type 'Window & t... Remove this comment to see the full error message
      Object.getOwnPropertyNames(window.i18n.loaded).filter(
        (k) => k.indexOf(`${lang}/Common.json`) > -1
      )) ||
    [];

  if (commonKeys.length === 0) return undefined;

  const key = commonKeys.length === 1 ? commonKeys[0] : commonKeys[1];
  // @ts-expect-error TS(2339): Property 'i18n' does not exist on type 'Window & t... Remove this comment to see the full error message
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
const Icon = ({
  type,
  theme
}: any) =>
  type === "success" ? (
    <StyledCheckToastIcon className="toastr_icon toastr_success" />
  ) : type === "error" ? (
    <StyledDangerToastIcon className="toastr_icon toastr_error" />
  ) : type === "warning" ? (
    <StyledDangerToastIcon className="toastr_icon toastr_warning" />
  ) : (
    <StyledInfoToastIcon className="toastr_icon toastr_info" />
  );

const toastr = {
  clear: clear,
  error: error,
  info: info,
  success: success,
  warning: warning,
};

const CloseButton = ({
  closeToast,
  theme
}: any) => (
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
  type: any,
  data: any,
  title: any,
  timeout = 5000,
  withCross = false,
  centerPosition = false,
  theme: any
) => {
  return toast(
    <>
      <IconWrapper>
        <Icon size="medium" type={type} />
      </IconWrapper>
      // @ts-expect-error TS(2769): No overload matches this call.
      <StyledDiv type={type}>
        // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
        {title && <Text className="toast-title">{title}</Text>}
        {typeof data === "string"
          // @ts-expect-error TS(2322): Type '{ children: string; className: string; }' is... Remove this comment to see the full error message
          ? data && <Text className="toast-text">{data}</Text>
          : data}
      </StyledDiv>
    </>,
    {
      type: type,
      closeOnClick: !withCross,
      closeButton: withCross && <CloseButton />,
      autoClose: timeout === 0 ? false : timeout < 750 ? 5000 : timeout || 5000,
      // @ts-expect-error TS(2322): Type 'false | ToastPosition' is not assignable to ... Remove this comment to see the full error message
      position: centerPosition && toast.POSITION.TOP_CENTER,
    }
  );
};

function success(data: any, title: any, timeout: any, withCross: any, centerPosition: any) {
  // @ts-expect-error TS(2554): Expected 7 arguments, but got 6.
  return notify(
    "success",
    data,
    title || getTitle("Done"),
    timeout,
    withCross,
    centerPosition
  );
}

function fatal(data: any, title: any, timeout: any, withCross: any, centerPosition: any) {
  const dataType = typeof data;
  const message =
    dataType === "string"
      ? data
      : dataType === "object" && data.statusText
      ? data.statusText
      : dataType === "object" && data.message
      ? data.message
      : "";

  // @ts-expect-error TS(2554): Expected 7 arguments, but got 6.
  return notify(
    "error",
    message,
    title || getTitle("Error"),
    timeout,
    withCross,
    centerPosition
  );
}

function error(data: any, title: any, timeout: any, withCross: any, centerPosition: any) {
  const dataType = typeof data;
  let message = "";

  if (dataType === "string") {
    message = data;
  } else if (dataType === "object") {
    message =
      data?.response?.data?.error?.message ||
      data?.statusText ||
      data?.message ||
      data;
  }

  //console.trace("Error", message);

  // @ts-expect-error TS(2554): Expected 7 arguments, but got 6.
  return notify(
    "error",
    message,
    title || getTitle("Warning"),
    timeout,
    withCross,
    centerPosition
  );
}

function warning(data: any, title: any, timeout: any, withCross: any, centerPosition: any) {
  // @ts-expect-error TS(2554): Expected 7 arguments, but got 6.
  return notify(
    "warning",
    data,
    title || getTitle("Alert"),
    timeout,
    withCross,
    centerPosition
  );
}

function info(data: any, title: any, timeout: any, withCross: any, centerPosition: any) {
  // @ts-expect-error TS(2554): Expected 7 arguments, but got 6.
  return notify(
    "info",
    data,
    title || getTitle("Info"),
    timeout,
    withCross,
    centerPosition
  );
}

function clear() {
  return toast.dismiss();
}

export default toastr;
