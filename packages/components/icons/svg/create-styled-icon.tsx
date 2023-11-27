import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
//import ReactDOMServer from "react-dom/server";
//import { Parser } from "html-to-react";

const iconSizes = {
  small: 12,
  medium: 16,
  big: 24,
};

const getSizeStyle = (size: any) => {
  switch (size) {
    case "scale":
      return `
        &:not(:root) {
          width: 100%;
          height: 100%;
        }
      `;
    case "small":
    case "medium":
    case "big":
      return `
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        width: ${iconSizes[size]}px;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        min-width: ${iconSizes[size]}px;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        height: ${iconSizes[size]}px;
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        min-height: ${iconSizes[size]}px;
      `;
    default:
      return `
        width: ${iconSizes.big}px;
        min-width: ${iconSizes.big}px;
        height: ${iconSizes.big}px;
        min-height: ${iconSizes.big}px;
      `;
  }
};

export default function createStyledIcon(
  Component: any,
  displayName: any,
  fillPath = "*",
  strokePath = "*"
) {
  class Icon extends React.Component {
    render_xml(id: any, xml_string: any) {
      var doc = new DOMParser().parseFromString(xml_string, "application/xml");
      var el = document.getElementById(id);
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      el.appendChild(el.ownerDocument.importNode(doc.documentElement, true));
    }

    render() {
      // eslint-disable-next-line react/prop-types, no-unused-vars
      const {
        // @ts-expect-error TS(2339): Property 'isfill' does not exist on type 'Readonly... Remove this comment to see the full error message
        isfill,
        // @ts-expect-error TS(2339): Property 'isStroke' does not exist on type 'Readon... Remove this comment to see the full error message
        isStroke,
        // @ts-expect-error TS(2339): Property 'color' does not exist on type 'Readonly<... Remove this comment to see the full error message
        color,
        // @ts-expect-error TS(2339): Property 'stroke' does not exist on type 'Readonly... Remove this comment to see the full error message
        stroke,
        // @ts-expect-error TS(2339): Property 'fillPath' does not exist on type 'Readon... Remove this comment to see the full error message
        fillPath,
        // @ts-expect-error TS(2339): Property 'strokePath' does not exist on type 'Read... Remove this comment to see the full error message
        strokePath,
        ...props
      } = this.props;

      // let svg = ReactDOMServer.renderToString(
      //   <Component {...props}></Component>
      // );
      // const matchResult = svg.match(/\s*mask id="(\w*)"\s/);
      // const newId =
      //   Math.random().toString(36).substring(2, 5) +
      //   Math.random().toString(36).substring(2, 5);

      // if (matchResult != null) {
      //   if (matchResult.length > 1) {
      //     svg = svg.replace(new RegExp(matchResult[1], "g"), newId);

      //     const htmlToReactParser = new Parser();
      //     const reactComponent = htmlToReactParser.parse(svg);
      //     return reactComponent;
      //   }
      // }
      return <Component {...props}></Component>;
    }
  }

  const StyledIcon = styled(Icon)(
    (props) => `
    // @ts-expect-error TS(2339): Property 'fillPath' does not exist on type 'Themed... Remove this comment to see the full error message
    ${props.fillPath} {
      // @ts-expect-error TS(2339): Property 'isfill' does not exist on type 'ThemedSt... Remove this comment to see the full error message
      ${props.isfill ? "fill:" + props.color : ""};
    }
    // @ts-expect-error TS(2339): Property 'strokePath' does not exist on type 'Them... Remove this comment to see the full error message
    ${props.strokePath} {
      // @ts-expect-error TS(2339): Property 'isStroke' does not exist on type 'Themed... Remove this comment to see the full error message
      ${props.isStroke ? "stroke:" + props.stroke : ""};
    }
    overflow: hidden;
    vertical-align: middle;
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'ThemedStyl... Remove this comment to see the full error message
    ${getSizeStyle(props.size)}
  `
  );

  StyledIcon.displayName = displayName;

  StyledIcon.propTypes = {
    // @ts-expect-error TS(2322): Type '{ color: PropTypes.Requireable<string>; stro... Remove this comment to see the full error message
    color: PropTypes.string,
    stroke: PropTypes.string,
    size: PropTypes.oneOf(["small", "medium", "big", "scale"]),
    isfill: PropTypes.bool,
    isStroke: PropTypes.bool,
    fillPath: PropTypes.string,
    strokePath: PropTypes.string,
  };

  StyledIcon.defaultProps = {
    // @ts-expect-error TS(2322): Type '{ fillPath: string; strokePath: string; }' i... Remove this comment to see the full error message
    fillPath: fillPath,
    strokePath: strokePath,
  };

  return StyledIcon;
}
