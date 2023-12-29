import styled, { css } from "styled-components";

import { tablet } from "../../utils";
import { Base } from "../../themes";

const getHorizontalCss = css<{ removeMargin?: boolean; labelWidth?: string }>`
  display: flex;
  flex-direction: row;
  align-items: start;
  margin: ${(props) =>
    props.removeMargin ? 0 : props.theme.fieldContainer.horizontal.margin};

  .field-label {
    line-height: ${(props) =>
      props.theme.fieldContainer.horizontal.label.lineHeight};
    margin: ${(props) => props.theme.fieldContainer.horizontal.label.margin};
    position: relative;
  }
  .field-label-icon {
    display: inline-flex;
    min-width: ${(props) => props.labelWidth};
    width: ${(props) => props.labelWidth};
  }
  .field-body {
    flex-grow: ${(props) =>
      props.theme.fieldContainer.horizontal.body.flexGrow};
  }
  .icon-button {
    position: relative;
    margin-top: ${(props) =>
      props.theme.fieldContainer.horizontal.iconButton.marginTop};
    margin-left: ${(props) =>
      props.theme.fieldContainer.horizontal.iconButton.marginLeft};
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        margin-left: 0;
        margin-right: ${props.theme.fieldContainer.horizontal.iconButton
          .marginLeft};
      `}
  }
`;

const getVerticalCss = css<{ removeMargin?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin: ${(props) =>
    props.removeMargin ? 0 : props.theme.fieldContainer.vertical.margin};

  .field-label {
    line-height: ${(props) =>
      props.theme.fieldContainer.vertical.label.lineHeight};
    height: ${(props) => props.theme.fieldContainer.vertical.label.height};
    display: inline-block;
  }
  .field-label-icon {
    display: inline-flex;
    width: ${(props) => props.theme.fieldContainer.vertical.labelIcon.width};
    margin: ${(props) => props.theme.fieldContainer.vertical.labelIcon.margin};
  }
  .field-body {
    width: ${(props) => props.theme.fieldContainer.vertical.body.width};
  }
  .icon-button {
    position: relative;
    margin: ${(props) => props.theme.fieldContainer.vertical.iconButton.margin};
    padding: ${(props) =>
      props.theme.fieldContainer.vertical.iconButton.padding};
    display: flex;
    align-items: center;
    height: 100%;
  }
`;

const Container = styled.div<{
  maxwidth?: string;

  color?: string;
  vertical?: boolean;
  removeMargin?: boolean;
  labelWidth?: string;
}>`
  .error-label {
    max-width: ${(props) => (props.maxwidth ? props.maxwidth : "293px")};
    color: ${(props) =>
      props.color ? props.color : props.theme.fieldContainer.errorLabel.color};
    padding-top: 4px;
  }
  ${(props) => (props.vertical ? getVerticalCss : getHorizontalCss)}

  @media ${tablet} {
    ${getVerticalCss}
  }
`;

Container.defaultProps = { theme: Base };
export default Container;
