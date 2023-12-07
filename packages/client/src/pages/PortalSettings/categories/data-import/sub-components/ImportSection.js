import { ReactSVG } from "react-svg";
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
  background: ${(props) => props.theme.client.settings.migration.importSectionBackground};

  .toggleButton {
    position: relative;
    margin-top: 0.5px;
  }

  .section-title {
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .section-description {
    color: ${(props) =>
      props.isChecked
        ? props.theme.client.settings.migration.subtitleColor
        : props.theme.client.settings.migration.importItemDisableTextColor};
    margin-top: 4px;
    margin-bottom: 12px;
  }
`;

const FlexContainer = styled.div`
  display: flex;
`;

const ImportItemWrapper = styled.div`
  padding-top: 8px;

  .workspace-title {
    color: ${(props) => props.theme.client.settings.migration.importSectionTextColor};
  }

  .importSection {
    min-width: 160px;
    height: 36px;
    padding: 8px 12px;
    box-sizing: border-box;
    margin-top: 12px;
    border-radius: 3px;
    background: ${(props) =>
      props.isChecked
        ? props.theme.client.settings.migration.importItemBackground
        : props.theme.client.settings.migration.importItemDisableBackground};
    color: ${(props) =>
      props.isChecked
        ? props.theme.client.settings.migration.importItemTextColor
        : props.theme.client.settings.migration.importItemDisableTextColor};
    font-weight: 600;
    line-height: 20px;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      path {
        fill: ${(props) =>
          props.isChecked
            ? props.theme.client.settings.migration.importIconColor
            : props.theme.client.settings.migration.importItemDisableTextColor};
      }
    }
  }
`;

const ArrowWrapper = styled.div`
  margin: 32px 12px 0;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;

  .arrow-icon {
    svg {
      path {
        fill: ${(props) => props.theme.client.settings.migration.importSectionTextColor};
      }
    }
  }
`;

const ImportItem = ({ sectionName, SectionIcon, workspace, isChecked }) => {
  return (
    <ImportItemWrapper isChecked={isChecked}>
      <Text className="workspace-title" fontSize="11px" fontWeight={600} lineHeight="12px">
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
        onChange={onChange || function () {}}
        className="toggleButton"
        isDisabled={isDisabled}
      />
      <div>
        <Text lineHeight="20px" fontWeight={600} className="section-title">
          {sectionName}
        </Text>
        <Text fontSize="12px" className="section-description">
          {description}
        </Text>
        <FlexContainer isChecked={isChecked}>
          <ImportItem {...exportSection} isChecked={isChecked} />
          <ArrowWrapper>
            <ReactSVG className="arrow-icon" src={ArrowSvg} />
          </ArrowWrapper>
          <ImportItem {...importSection} isChecked={isChecked} />
        </FlexContainer>
      </div>
    </SectionWrapper>
  );
};

export default ImportSection;
