import React from "react";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Badge } from "@docspace/shared/components/badge";
import { Link } from "@docspace/shared/components/link";
import { Base } from "@docspace/shared/themes";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import commonIconsStyles from "@docspace/shared/utils/common-icons-style";

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
    color: ${(props) =>
      props.isDisabled
        ? props.theme.text.disableColor
        : props.theme.client.settings.security.descriptionColor};
    font-size: 12px;
    max-width: 1024px;
  }

  .inherit-title-link {
    margin-right: 7px;
    font-size: 16px;
    font-weight: 600;
    ${(props) => props.isDisabled && `color: ${props.theme.text.disableColor}`};
  }

  .link-text {
    margin: 0;
  }
`;

const MobileCategoryWrapper = (props) => {
  const {
    title,
    url,
    subtitle,
    onClickLink,
    isDisabled,
    withPaidBadge,
    badgeLabel,
  } = props;

  const onClickProp = isDisabled ? {} : onClickLink;
  const onHrefProp = isDisabled
    ? {}
    : { href: combineUrl(window.DocSpaceConfig?.proxy?.url, url) };

  return (
    <StyledMobileCategoryWrapper isDisabled={isDisabled}>
      <div className="category-item-heading">
        <Link
          className="inherit-title-link header"
          {...onClickProp}
          {...onHrefProp}
          truncate
        >
          {title}
        </Link>
        {withPaidBadge && (
          <Badge
            backgroundColor="#EDC409"
            label={badgeLabel}
            isPaidBadge={true}
            className="paid-badge"
            fontWeight="700"
          />
        )}
        <StyledArrowRightIcon className="settings_unavailable" size="small" />
      </div>
      <Text className="category-item-description">{subtitle}</Text>
    </StyledMobileCategoryWrapper>
  );
};

MobileCategoryWrapper.defaultProps = {
  theme: Base,
};

export default MobileCategoryWrapper;
