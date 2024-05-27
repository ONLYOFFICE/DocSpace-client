import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";

import { StyledHeaderRow } from "../ClientForm.styled";

interface BlockHeaderProps {
  header: string;
  helpButtonText?: string | React.ReactNode;
  className?: string;
}

const BlockHeader = ({
  header,
  helpButtonText,
  className,
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
      </Text>
      {helpButtonText && <HelpButton tooltipContent={helpButtonText} />}
    </StyledHeaderRow>
  );
};

export default BlockHeader;
