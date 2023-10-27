import styled, { css } from "styled-components";
import { mobile, tablet } from "../utils/device";
import NoUserSelect from "../utils/commonStyles";

const EmptyContentBody = styled.div`
  margin: 0 auto;
  padding-top: ${(props) =>
    props.withoutFilter
      ? "91px" //calculated without section body padding and without filter
      : "52px"}; //calculated without section body padding, margin of filter

  grid-template-columns: 1fr;
  display: grid;

  grid-template-areas:
    "img"
    "headerText"
    ${(props) => props.subheadingText && `"subheadingText"`}
    ${(props) => props.descriptionText && `"descriptionText"`}
    "button";

  gap: 0px;
  width: 640px;

  grid-template-rows: max-content;
  justify-items: center;

  .ec-image {
    grid-area: img;
    height: 100px;
    width: 100px;
    margin-bottom: 32px;
    ${NoUserSelect}
  }

  .ec-header {
    grid-area: headerText;
    font-size: 16px;
    color: ${(props) => props.theme.emptyContent.header.color};
    text-align: center;
  }

  .ec-subheading {
    grid-area: subheadingText;
  }

  .ec-desc {
    grid-area: descriptionText;
    line-height: 18px;
    margin-top: 8px;
    color: ${(props) => props.theme.emptyContent.description.color};
    text-align: center;
  }

  .ec-buttons {
    grid-area: button;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 24px;

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
    padding-top: ${(props) =>
      props.withoutFilter
        ? "109px" //calculated without section body padding and without filter
        : "71px"}; //calculated without section body padding, margin of filter
    width: 480px;
  }

  @media ${mobile} {
    padding-top: 31px;
    padding-top: ${(props) =>
      props.withoutFilter
        ? "69px" //calculated without section body padding and without filter
        : "31px"}; //calculated without section body padding, margin of filter
    max-width: 343px;
    padding-left: 28px;
    padding-right: 28px;
    width: fit-content;
    .ec-image {
      height: 75px;
      width: 75px;
    }

    .ec-buttons {
      max-width: 274px;
    }
  }
`;

const EmptyContentImage = styled.img.attrs((props) => ({
  src: props.imageSrc,
  alt: props.imageAlt,
}))`
  background: no-repeat 0 0 transparent;
`;

export { EmptyContentBody, EmptyContentImage };
