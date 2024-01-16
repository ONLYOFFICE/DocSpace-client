import { StyledSectionHeader } from "../Section.styled";
import { SectionHeaderProps } from "../Section.types";

const SectionHeader = (props: SectionHeaderProps) => {
  const { className, ...rest } = props;

  return (
    <StyledSectionHeader className={`section-header ${className}`} {...rest} />
  );
};

SectionHeader.displayName = "SectionHeader";

export default SectionHeader;
