import Text from "@docspace/components/text";
//@ts-ignore
import HelpButton from "@docspace/components/help-button";

import { HeaderRaw } from "../ClientForm.styled";
import { BlockHeaderProps } from "../ClientForm.types";

const BlockHeader = ({ header, helpButtonText }: BlockHeaderProps) => {
  return (
    <HeaderRaw>
      <Text
        fontSize={"16px"}
        fontWeight={700}
        lineHeight={"22px"}
        title={header}
        tag={""}
        as={"p"}
        color={""}
        textAlign={""}
      >
        {header}
      </Text>
      <HelpButton tooltipContent={helpButtonText} />
    </HeaderRaw>
  );
};

export default BlockHeader;
