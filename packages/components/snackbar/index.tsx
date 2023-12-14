import React from "react";
import ReactDOM from "react-dom/client";
import PropType from "prop-types";
import PropTypes from "prop-types";
import Countdown, { zeroPad } from "react-countdown";
import { StyledAction, StyledSnackBar, StyledIframe } from "./styled-snackbar";
import StyledCrossIcon from "./styled-snackbar-action";
import StyledLogoIcon from "./styled-snackbar-logo";
import Box from "../box";
import Heading from "../heading";
import Text from "../text";

class SnackBar extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { isLoaded: false };
  }
  static show(barConfig: any) {
    const { parentElementId, ...rest } = barConfig;

    let parentElementNode =
      parentElementId && document.getElementById(parentElementId);

    if (!parentElementNode) {
      const snackbarNode = document.createElement("div");
      snackbarNode.id = "snackbar";
      document.body.appendChild(snackbarNode);
      parentElementNode = snackbarNode;
    }

    // @ts-expect-error TS(2339): Property 'snackbar' does not exist on type 'Window... Remove this comment to see the full error message
    window.snackbar = barConfig;

    ReactDOM.createRoot(parentElementNode).render(<SnackBar {...rest} />);
  }

  static close() {
    // @ts-expect-error TS(2339): Property 'snackbar' does not exist on type 'Window... Remove this comment to see the full error message
    if (window.snackbar && window.snackbar.parentElementId) {
      const snackbar = document.querySelector("#snackbar-container");
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      snackbar.remove();
      //ReactDOM.unmountComponentAtNode(window.snackbar.parentElementId);
    }
  }

  onActionClick = (e: any) => {
    // @ts-expect-error TS(2339): Property 'onAction' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onAction && this.props.onAction(e);
  };

  onClickIFrame = () => {
    if (
      document.activeElement &&
      document.activeElement.nodeName.toLowerCase() === "iframe"
    ) {
      setTimeout(() => this.onActionClick(), 500);
    }
  };

  componentDidMount() {
    // @ts-expect-error TS(2339): Property 'onLoad' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { onLoad } = this.props;
    onLoad();
    window.addEventListener("blur", this.onClickIFrame);
  }

  componentWillUnmount() {
    window.removeEventListener("blur", this.onClickIFrame);
  }

  bannerRenderer = () => {
    // @ts-expect-error TS(2339): Property 'htmlContent' does not exist on type 'Rea... Remove this comment to see the full error message
    const { htmlContent, sectionWidth } = this.props;
    return (
      <div id="bar-banner" style={{ position: "relative" }}>
        <StyledIframe
          id="bar-frame"
          src={htmlContent}
          scrolling="no"
          // @ts-expect-error TS(2769): No overload matches this call.
          sectionWidth={sectionWidth}
          onLoad={() => {
            this.setState({ isLoaded: true });
          }}
        ></StyledIframe>
        // @ts-expect-error TS(2339): Property 'isLoaded' does not exist on type 'Readon... Remove this comment to see the full error message
        {this.state.isLoaded && (
          <StyledAction className="action" onClick={this.onActionClick}>
            <StyledCrossIcon size="medium" />
          </StyledAction>
        )}
      </div>
    );
  };

  // Renderer callback with condition
  countDownRenderer = ({
    minutes,
    seconds,
    completed
  }: any) => {
    if (completed) return <></>;
    // @ts-expect-error TS(2339): Property 'textColor' does not exist on type 'Reado... Remove this comment to see the full error message
    const { textColor, fontSize, fontWeight } = this.props;

    // Render a countdown
    return (
      // @ts-expect-error TS(2322): Type '{ children: string[]; as: string; color: any... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2339): Property 'text' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      text,
      // @ts-expect-error TS(2339): Property 'headerText' does not exist on type 'Read... Remove this comment to see the full error message
      headerText,
      // @ts-expect-error TS(2339): Property 'btnText' does not exist on type 'Readonl... Remove this comment to see the full error message
      btnText,
      // @ts-expect-error TS(2339): Property 'textColor' does not exist on type 'Reado... Remove this comment to see the full error message
      textColor,
      // @ts-expect-error TS(2339): Property 'showIcon' does not exist on type 'Readon... Remove this comment to see the full error message
      showIcon,
      // @ts-expect-error TS(2339): Property 'fontSize' does not exist on type 'Readon... Remove this comment to see the full error message
      fontSize,
      // @ts-expect-error TS(2339): Property 'fontWeight' does not exist on type 'Read... Remove this comment to see the full error message
      fontWeight,
      // @ts-expect-error TS(2339): Property 'textAlign' does not exist on type 'Reado... Remove this comment to see the full error message
      textAlign,
      // @ts-expect-error TS(2339): Property 'htmlContent' does not exist on type 'Rea... Remove this comment to see the full error message
      htmlContent,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'countDownTime' does not exist on type 'R... Remove this comment to see the full error message
      countDownTime,
      // @ts-expect-error TS(2339): Property 'isCampaigns' does not exist on type 'Rea... Remove this comment to see the full error message
      isCampaigns,
      // @ts-expect-error TS(2339): Property 'onAction' does not exist on type 'Readon... Remove this comment to see the full error message
      onAction,
      ...rest
    } = this.props;

    const headerStyles = headerText ? {} : { display: "none" };

    const bannerElement = this.bannerRenderer();

    return (
      <>
        {isCampaigns ? (
          <>{bannerElement}</>
        ) : (
          <StyledSnackBar id="snackbar-container" style={style} {...rest}>
            {htmlContent ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: htmlContent,
                }}
              />
            ) : (
              <div className="text-container">
                // @ts-expect-error TS(2322): Type '{ children: any[]; className: string; textal... Remove this comment to see the full error message
                <div className="header-body" textalign={textAlign}>
                  {showIcon && (
                    // @ts-expect-error TS(2322): Type '{ children: Element; className: string; }' i... Remove this comment to see the full error message
                    <Box className="logo">
                      <StyledLogoIcon size="medium" color={textColor} />
                    </Box>
                  )}

                  // @ts-expect-error TS(2322): Type '{ children: any; size: string; isInline: tru... Remove this comment to see the full error message
                  <Heading
                    size="xsmall"
                    isInline={true}
                    className="text-header"
                    style={headerStyles}
                    color={textColor}
                  >
                    {headerText}
                  </Heading>
                </div>
                <div className="text-body">
                  // @ts-expect-error TS(2322): Type '{ children: any; as: string; className: stri... Remove this comment to see the full error message
                  <Text
                    as="p"
                    className={"text"}
                    color={textColor}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                    noSelect
                  >
                    {text}
                  </Text>

                  {btnText && (
                    // @ts-expect-error TS(2322): Type '{ children: any; color: any; className: stri... Remove this comment to see the full error message
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
              <button className="action" onClick={this.onActionClick}>
                <StyledCrossIcon size="small" />
              </button>
            )}
          </StyledSnackBar>
        )}
      </>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SnackBar.propTypes = {
  /** Specifies the Snackbar text */
  text: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  /** Specifies the header text */
  headerText: PropTypes.string,
  /** Specifies the button text */
  btnText: PropTypes.string,
  /** Specifies the source of the image used as the Snackbar background  */
  backgroundImg: PropTypes.string,
  /** Specifies the background color */
  backgroundColor: PropTypes.string,
  /** Specifies the text color */
  textColor: PropTypes.string,
  /** Displays the icon */
  showIcon: PropTypes.bool,
  /** Sets a callback function that is triggered when the Snackbar is clicked */
  onAction: PropTypes.func,
  /** Sets the font size  */
  fontSize: PropTypes.string,
  /** Sets the font weight */
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Specifies the text alignment */
  textAlign: PropTypes.string,
  /** Allows displaying content in HTML format */
  htmlContent: PropTypes.string,
  /** Accepts css */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets the countdown time */
  countDownTime: PropType.number,
  /** Sets the section width */
  sectionWidth: PropTypes.number,
  /** Required in case the snackbar is a campaign banner */
  isCampaigns: PropTypes.bool,
  /** Used as an indicator that a web page has fully loaded, including its content, images, style files, and external scripts */
  onLoad: PropTypes.func,
  /** Required in case the snackbar is a notification banner */
  isMaintenance: PropTypes.bool,
  /** Sets opacity */
  opacity: PropTypes.number,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SnackBar.defaultProps = {
  backgroundColor: "#F7E6BE",
  textColor: "#000",
  showIcon: true,
  fontSize: "13px",
  fontWeight: "400",
  textAlign: "left",
  htmlContent: "",
  countDownTime: -1,
  isCampaigns: false,
};

export default SnackBar;
