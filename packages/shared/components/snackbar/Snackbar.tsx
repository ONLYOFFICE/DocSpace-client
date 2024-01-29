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
      textColor = "#000",
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
      backgroundColor = "#F7E6BE",
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
        {isLoaded && (
          <StyledAction className="action" onClick={this.onActionClick}>
            <StyledCrossIcon size={IconSizeType.medium} />
          </StyledAction>
        )}
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
              {showIcon && (
                <Box className="logo">
                  <StyledLogoIcon
                    size={IconSizeType.medium}
                    color={textColor}
                  />
                </Box>
              )}

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

              {btnText && (
                <Text
                  color={textColor}
                  className="button"
                  onClick={this.onActionClick}
                >
                  {btnText}
                </Text>
              )}

              {countDownTime > -1 && (
                <Countdown
                  date={Date.now() + countDownTime}
                  renderer={this.countDownRenderer}
                  onComplete={this.onActionClick}
                />
              )}
            </div>
          </div>
        )}
        {!btnText && (
          <button className="action" type="submit" onClick={this.onActionClick}>
            <StyledCrossIcon size={IconSizeType.small} />
          </button>
        )}
      </StyledSnackBar>
    );
  }
}

export { SnackBar };
