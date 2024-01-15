import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg";

import styled from "styled-components";
import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";
import { UnavailableStyles } from "../utils/commonSettingsStyles";

export const StyledArrowRightIcon = styled(ArrowRightIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.client.settings.security.arrowFill};
  }

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
`;

StyledArrowRightIcon.defaultProps = { theme: Base };

export const StyledMobileCategoryWrapper = styled.div`
  margin-bottom: 20px;

  .category-item-heading {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .category-item-subheader {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 600;
    margin-bottom: 5px;
  }

  .category-item-description {
    color: ${(props) => props.theme.client.settings.security.descriptionColor};
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    max-width: 1024px;
    line-height: 20px;
  }

  .inherit-title-link {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 7px;`
        : `margin-right: 7px;`}
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    font-weight: 700;
  }

  .link-text {
    margin: 0;
  }

  ${(props) => props.disabled && UnavailableStyles}
`;

StyledMobileCategoryWrapper.defaultProps = { theme: Base };
