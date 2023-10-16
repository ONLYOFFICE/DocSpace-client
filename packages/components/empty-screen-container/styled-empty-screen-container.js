import styled, { css } from "styled-components";
import { mobile, tablet } from "../utils/device";
import NoUserSelect from "../utils/commonStyles";

const MobileView = css`
  grid-template-areas:
    "img img img"
    "headerText headerText headerText"
    ${(props) =>
      props.subheadingText && `"subheadingText subheadingText subheadingText"`}
    ${(props) =>
      props.descriptionText &&
      `"descriptionText descriptionText descriptionText"`}
    "button button button";

  padding-left: 28px;
  padding-right: 28px;
  max-width: 100%;
  margin: 0;

  .ec-header {
    padding-top: 24px;
  }

  .ec-image {
    height: 75px;
    width: 75px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? "margin-right: 0;"
        : "margin-left: 0;"}
  }

  .ec-buttons {
    max-width: 274px;
  }
`;

const EmptyContentBody = styled.div`
  margin: 0 auto;

  padding-top: 80px;

  grid-template-columns: 100px 1fr;

  display: grid;
  grid-template-areas:
    "img headerText"
    ${(props) => props.subheadingText && `"img subheadingText"`}
    ${(props) => props.descriptionText && `"img descriptionText"`}
    "img button";

  grid-column-gap: 40px;
  grid-row-gap: 10px;
  max-width: 800px;

  grid-template-rows: max-content;

  .ec-image {
    grid-area: img;
    margin: 16px 0 0 auto;
    height: 100px;
    width: 100px;
    ${NoUserSelect}
  }

  .ec-header {
    grid-area: headerText;
    font-size: 16px;
    padding-top: 16px;

    color: ${(props) => props.theme.emptyContent.header.color};
  }

  .ec-subheading {
    grid-area: subheadingText;
  }

  .ec-desc {
    grid-area: descriptionText;
    line-height: 18px;
    margin-top: 2px;

    color: ${(props) => props.theme.emptyContent.description.color};
  }

  .ec-buttons {
    grid-area: button;
    svg {
      path {
        fill: ${(props) => props.theme.emptyContent.button.colorLink};
      }
    }

    a {
      color: ${(props) => props.theme.emptyContent.button.colorLink};
    }
    span {
      color: ${(props) => props.theme.emptyContent.button.colorText};
    }
  }

  @media ${tablet} {
    grid-column-gap: 32px;
    max-width: 480px;
  }

  @media ${mobile} {
    padding-top: 40px;

    ${MobileView}
  }
`;

const EmptyContentImage = styled.img.attrs((props) => ({
  src: props.imageSrc,
  alt: props.imageAlt,
}))`
  background: no-repeat 0 0 transparent;
`;

export { EmptyContentBody, EmptyContentImage };
