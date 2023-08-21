import { tablet } from "@docspace/components/utils/device";

import Text from "@docspace/components/text";
import ToggleButton from "@docspace/components/toggle-button";
import styled, { css } from "styled-components";
import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg?url";

const SectionWrapper = styled.div`
  max-width: 700px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;

  @media ${tablet} {
    max-width: 675px;
  }

  border-radius: 6px;
  background: #f8f9f9;

  .toggleButton {
    position: relative;
    margin-top: 0.5px;
  }

  .description {
    margin-top: 4px;
    margin-bottom: 12px;
  }

  ${(props) =>
    !props.isChecked &&
    css`
      .importSection {
        color: #a3a9ae;

        svg {
          path {
            fill: #a3a9ae;
          }
        }
      }
    `}
`;

const FlexContainer = styled.div`
  display: flex;
`;

const ImportItemWrapper = styled.div`
  padding-top: 8px;

  .importSection {
    width: 160px;
    height: 36px;
    padding: 8px 12px;
    box-sizing: border-box;
    margin-top: 12px;

    border-radius: 3px;
    background: #eceef1;

    color: "#555f65";
    font-weight: 600;
    line-height: 20px;

    display: flex;
    align-items: center;

    gap: 8px;
  }
`;

const ArrowWrapper = styled.div`
  margin: 32px 12px 0;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
`;

const ImportItem = ({ sectionName, SectionIcon, workspace }) => {
  return (
    <ImportItemWrapper>
      <Text color="#A3A9AE" fontSize="11px" fontWeight={600} lineHeight="12px">
        {workspace}
      </Text>
      <div className="importSection">
        {SectionIcon && <SectionIcon />}
        {sectionName}
      </div>
    </ImportItemWrapper>
  );
};

const ImportSection = ({
  isDisabled,
  isChecked,
  onChange,
  sectionName,
  description,
  exportSection,
  importSection,
}) => {
  return (
    <SectionWrapper isChecked={isChecked}>
      <ToggleButton
        isChecked={isChecked}
        onChange={onChange}
        className="toggleButton"
        isDisabled={isDisabled}
      />
      <div>
        <Text lineHeight="20px" fontWeight={600}>
          {sectionName}
        </Text>
        <Text
          fontSize="12px"
          className="description"
          color={isChecked ? "#333" : "#A3A9AE"}
        >
          {description}
        </Text>
        <FlexContainer>
          <ImportItem {...exportSection} />
          <ArrowWrapper>
            <img src={ArrowSvg} alt="arrow" />
          </ArrowWrapper>
          <ImportItem {...importSection} />
        </FlexContainer>
      </div>
    </SectionWrapper>
  );
};

export default ImportSection;
