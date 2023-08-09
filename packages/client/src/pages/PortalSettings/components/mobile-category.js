import React from "react";
import styled from "styled-components";

import Text from "@docspace/components/text";
import Link from "@docspace/components/link";
import { Base } from "@docspace/components/themes";
import { combineUrl } from "@docspace/common/utils";
import commonIconsStyles from "@docspace/components/utils/common-icons-style";

import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg";

const StyledArrowRightIcon = styled(ArrowRightIcon)`
  ${commonIconsStyles}
  path {
    fill: ${(props) => props.theme.client.settings.security.arrowFill};
  }
`;

const StyledMobileCategoryWrapper = styled.div`
  margin-bottom: 20px;

  .category-item-heading {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .category-item-subheader {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .category-item-description {
    color: ${(props) => props.theme.client.settings.security.descriptionColor};
    font-size: 12px;
    max-width: 1024px;
  }

  .inherit-title-link {
    margin-right: 7px;
    font-size: 16px;
    font-weight: 600;
  }

  .link-text {
    margin: 0;
  }
`;

const MobileCategoryWrapper = (props) => {
  const { title, url, subtitle, onClickLink } = props;

  return (
    <StyledMobileCategoryWrapper>
      <div className="category-item-heading">
        <Link
          className="inherit-title-link header"
          onClick={onClickLink}
          truncate={true}
          href={combineUrl(window.DocSpaceConfig?.proxy?.url, url)}
        >
          {title}
        </Link>
        <StyledArrowRightIcon size="small" />
      </div>
      <Text className="category-item-description">{subtitle}</Text>
    </StyledMobileCategoryWrapper>
  );
};

MobileCategoryWrapper.defaultProps = {
  theme: Base,
};

export default MobileCategoryWrapper;
