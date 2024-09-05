import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { globalColors } from "@docspace/shared/themes";

import {
  StyledRowContent,
  ContentWrapper,
  FlexWrapper,
  ToggleButtonWrapper,
} from "./RowView.styled";
import { RowContentProps } from "./RowView.types";

export const RowContent = ({
  sectionWidth,
  item,

  handleToggleEnabled,
}: RowContentProps) => {
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
          {item.description}
        </Text>
      </ContentWrapper>

      <ToggleButtonWrapper>
        <ToggleButton
          className="toggle toggleButton"
          id="toggle id"
          isChecked={item.enabled}
          onChange={handleToggleEnabled}
        />
      </ToggleButtonWrapper>
    </StyledRowContent>
  );
};
