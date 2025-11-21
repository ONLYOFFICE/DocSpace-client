import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { globalColors } from "@docspace/shared/themes";

import {
  StyledRowContent,
  ContentWrapper,
  FlexWrapper,
} from "./RowView.styled";
import { RowContentProps } from "./RowView.types";

export const RowContent = ({ sectionWidth, item }: RowContentProps) => {
  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      <ContentWrapper>
        <FlexWrapper>
          <Text
            fontWeight={600}
            fontSize="14px"
            style={{ marginInlineEnd: "8px" }}
          >
            {item.name}
          </Text>
        </FlexWrapper>

        <Text fontWeight={600} fontSize="12px" color={globalColors.gray}>
          <Link
            color={globalColors.gray}
            href={item.websiteUrl}
            type={LinkType.page}
            target={LinkTarget.blank}
            isHovered
            dataTestId="website_link"
          >
            {item.websiteUrl}
          </Link>
        </Text>
      </ContentWrapper>
      <div />
    </StyledRowContent>
  );
};
