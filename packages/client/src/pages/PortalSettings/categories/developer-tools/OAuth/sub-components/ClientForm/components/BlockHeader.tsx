import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { globalColors } from "@docspace/shared/themes";

import { StyledHeaderRow } from "../ClientForm.styled";

interface BlockHeaderProps {
  header: string;
  helpButtonText?: string | React.ReactNode;
  className?: string;
  isRequired?: boolean;
}

const BlockHeader = ({
  header,
  helpButtonText,
  className,
  isRequired,
}: BlockHeaderProps) => {
  return (
    <StyledHeaderRow className={className}>
      <Text
        fontSize="16px"
        fontWeight={700}
        lineHeight="22px"
        title={header}
        tag=""
        as="p"
        color=""
        textAlign=""
      >
        {header}
        {isRequired && (
          <span
            style={{
              color: globalColors.lightErrorStatus,
              fontSize: "13px",
              fontWeight: 400,
            }}
          >
            {" "}
            *
          </span>
        )}
      </Text>

      {helpButtonText && <HelpButton tooltipContent={helpButtonText} />}
    </StyledHeaderRow>
  );
};

export default BlockHeader;
