import { Text } from "@docspace/shared/components";
import { Link } from "@docspace/shared/components";
import { Badge } from "@docspace/shared/components";
import { Base } from "@docspace/shared/themes";
import { StyledMobileCategoryWrapper, StyledArrowRightIcon } from "./styles";
import { combineUrl } from "@docspace/common/utils";

const MobileCategoryWrapper = (props) => {
  const { title, url, subtitle, onClickLink, withPaidBadge, badgeLabel } =
    props;

  return (
    <StyledMobileCategoryWrapper>
      <div className="category-item-heading">
        <Link
          className="inherit-title-link header settings_unavailable"
          onClick={onClickLink}
          truncate={true}
          href={combineUrl(window.DocSpaceConfig?.proxy?.url, url)}
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
      <Text className="category-item-description settings_unavailable">
        {subtitle}
      </Text>
    </StyledMobileCategoryWrapper>
  );
};

MobileCategoryWrapper.defaultProps = {
  theme: Base,
};

export default MobileCategoryWrapper;
