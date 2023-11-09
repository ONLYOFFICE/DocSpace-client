import React from "react";

import Text from "@docspace/components/text";
import Link from "@docspace/components/link";

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
          {/* @ts-ignore */}
          <Text
            fontWeight={600}
            fontSize="14px"
            style={{ marginInlineEnd: "8px" }}
          >
            {item.name}
          </Text>
        </FlexWrapper>

        {/* @ts-ignore */}
        <Text fontWeight={600} fontSize="12px" color="#A3A9AE">
          {/* @ts-ignore */}
          <Link
            color="#A3A9AE"
            href={item.websiteUrl}
            type={"action"}
            target={"_blank"}
            isHovered
          >
            {item.websiteUrl}
          </Link>
        </Text>
      </ContentWrapper>
      <></>
    </StyledRowContent>
  );
};
