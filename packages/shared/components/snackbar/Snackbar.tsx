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

/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/no-danger */
import React from "react";
import ReactDOM from "react-dom/client";
import Countdown, { zeroPad } from "react-countdown";
import { IconSizeType } from "../../utils";

import { Box } from "../box";
import { Heading, HeadingSize } from "../heading";
import { Text } from "../text";

import { BarConfig, SnackbarProps } from "./Snackbar.types";
import { StyledAction, StyledSnackBar, StyledIframe } from "./Snackbar.styled";
import StyledCrossIcon from "./SnackbarAction.styled";
import StyledLogoIcon from "./SnackbarLogo.styled.ts";
import { globalColors } from "../../themes";

class SnackBar extends React.Component<SnackbarProps, { isLoaded: boolean }> {
  static show(barConfig: BarConfig) {
    const { parentElementId, ...rest } = barConfig;

    let parentElementNode =
      parentElementId && document.getElementById(parentElementId);

    if (!parentElementNode) {
      const snackbarNode = document.createElement("div");
      snackbarNode.id = "snackbar";
      document.body.appendChild(snackbarNode);
      parentElementNode = snackbarNode;
    }

    window.snackbar = barConfig;

    ReactDOM.createRoot(parentElementNode).render(<SnackBar {...rest} />);
  }

  static close() {
    const config = window.snackbar as BarConfig | undefined;
    if (config && config.parentElementId) {
      const snackbar = document.querySelector("#snackbar-container");
      if (snackbar) snackbar.remove();
      // ReactDOM.unmountComponentAtNode(window.snackbar.parentElementId);
    }
  }

  constructor(props: SnackbarProps) {
    super(props);
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    const { onLoad } = this.props;
    onLoad?.();
    window.addEventListener("blur", this.onClickIFrame);
  }

  componentWillUnmount() {
    window.removeEventListener("blur", this.onClickIFrame);
  }

  onActionClick = (e?: React.MouseEvent) => {
    const { onAction } = this.props;
    onAction?.(e);
  };

  onClickIFrame = () => {
    if (
      document.activeElement &&
      document.activeElement.nodeName.toLowerCase() === "iframe"
    ) {
      setTimeout(() => this.onActionClick(), 500);
    }
  };

  // Renderer callback with condition
  countDownRenderer = ({
    minutes,
    seconds,
    completed,
  }: {
    minutes: string | number;
    seconds: string | number;
    completed: boolean;
  }) => {
    if (completed) return null;
    const { textColor, fontSize, fontWeight } = this.props;

    // Render a countdown
    return (
      <Text
        as="p"
        color={textColor}
        fontSize={fontSize}
        fontWeight={fontWeight}
      >
        {zeroPad(minutes)}:{zeroPad(seconds)}
      </Text>
    );
  };

  render() {
    const {
      text,
      headerText,
      btnText,
      textColor = globalColors.darkBlack,
      showIcon,
      fontSize,
      fontWeight,
      textAlign,
      htmlContent,
      style,
      countDownTime,
      isCampaigns,
      onAction,
      sectionWidth,
      backgroundColor = globalColors.lightToastAlert,
      ...rest
    } = this.props;

    const headerStyles = headerText ? {} : { display: "none" };

    const { isLoaded } = this.state;

    return isCampaigns ? (
      <div id="bar-banner" style={{ position: "relative" }}>
        <StyledIframe
          id="bar-frame"
          src={htmlContent}
          scrolling="no"
          sectionWidth={sectionWidth}
          onLoad={() => {
            this.setState({ isLoaded: true });
          }}
        />
        {isLoaded ? (
          <StyledAction className="action" onClick={this.onActionClick}>
            <StyledCrossIcon size={IconSizeType.medium} />
          </StyledAction>
        ) : null}
      </div>
    ) : (
      <StyledSnackBar
        {...rest}
        id="snackbar-container"
        style={style}
        backgroundColor={backgroundColor}
      >
        {htmlContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: htmlContent,
            }}
          />
        ) : (
          <div className="text-container">
            <div className="header-body" style={{ textAlign }}>
              {showIcon ? (
                <Box className="logo">
                  <StyledLogoIcon
                    size={IconSizeType.medium}
                    color={textColor}
                  />
                </Box>
              ) : null}

              <Heading
                size={HeadingSize.xsmall}
                isInline
                className="text-header"
                style={headerStyles}
                color={textColor}
              >
                {headerText}
              </Heading>
            </div>
            <div className="text-body">
              <Text
                as="p"
                className="text"
                color={textColor}
                fontSize={fontSize}
                fontWeight={fontWeight}
                noSelect
              >
                {text}
              </Text>

              {btnText ? (
                <Text
                  color={textColor}
                  className="button"
                  onClick={this.onActionClick}
                >
                  {btnText}
                </Text>
              ) : null}

              {countDownTime > -1 ? (
                <Countdown
                  date={Date.now() + countDownTime}
                  renderer={this.countDownRenderer}
                  onComplete={this.onActionClick}
                />
              ) : null}
            </div>
          </div>
        )}
        {!btnText ? (
          <button className="action" type="submit" onClick={this.onActionClick}>
            <StyledCrossIcon size={IconSizeType.small} />
          </button>
        ) : null}
      </StyledSnackBar>
    );
  }
}

export { SnackBar };
