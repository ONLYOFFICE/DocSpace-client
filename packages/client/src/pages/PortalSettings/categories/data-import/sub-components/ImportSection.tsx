// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { ReactSVG } from "react-svg";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg?url";
import { ImportItemProps, ImportSectionProps } from "../types";
import { tablet } from "@docspace/shared/utils";
import { Tooltip } from "@docspace/shared/components/tooltip";

const SectionWrapper = styled.div<{ isChecked: boolean }>`
  max-width: 700px;

  @media ${tablet} {
    max-width: 675px;
  }

  box-sizing: border-box;
  display: flex;
  align-items: start;
  gap: 4px;

  .toggleButton {
    position: relative;
    margin-top: 0.5px;
  }

  .section-content {
    flex: 1;
    min-width: 0;
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
    span {
      font-size: 12px;
      font-weight: 600;
    }
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex: 1;
  max-width: 400px;
`;

const ImportItemWrapper = styled.div<{ isChecked: boolean }>`
  display: flex;
  flex-direction: column;
  width: calc(50% - 20px);

  .workspace-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${(props) =>
      props.theme.client.settings.migration.importSectionTextColor};
  }

  .importSection {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 8px 12px;
    box-sizing: border-box;
    margin-top: 6px;
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
    gap: 8px;

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .importSectionIcon {
      div {
        display: flex;
        align-items: center;
      }

      svg {
        path {
          fill: ${(props) =>
            props.isChecked
              ? props.theme.client.settings.migration.importIconColor
              : props.theme.client.settings.migration
                  .importItemDisableTextColor};
        }
      }
    }
  }
`;

const ArrowWrapper = styled.div`
  margin: 32px 12px 0;
  height: 11px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  flex-shrink: 0;

  .arrow-icon {
    transform: ${(props) =>
      props.theme.interfaceDirection === "rtl" && "rotate(180deg)"};
    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.importSectionTextColor};
      }
    }
  }
`;

const ImportItem = ({
  sectionName,
  sectionIcon,
  workspace,
  isChecked,
}: ImportItemProps) => {
  return (
    <ImportItemWrapper isChecked={isChecked}>
      <Text
        className="workspace-title"
        fontSize="11px"
        fontWeight={600}
        lineHeight="12px"
        title={workspace}
      >
        {workspace}
      </Text>
      <div className="importSection">
        {sectionIcon ? (
          <ReactSVG className="importSectionIcon" src={sectionIcon} />
        ) : null}
        <Text as="span" fontWeight={600} lineHeight="20px" title={sectionName}>
          {sectionName}
        </Text>
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
  dataTestId,
  getTooltipContent,
}: ImportSectionProps) => {
  const toggleButtonTooltipId = `toggle-button-tooltip-${sectionName}`;
  return (
    <SectionWrapper data-testid={dataTestId} isChecked={isChecked}>
      <ToggleButton
        isChecked={isChecked}
        onChange={onChange || (() => {})}
        className="toggleButton"
        isDisabled={isDisabled}
        dataTestId="enable_import_section_button"
        dataTooltipId={
          isDisabled && getTooltipContent ? toggleButtonTooltipId : undefined
        }
      />
      {isDisabled && getTooltipContent ? (
        <Tooltip
          id={toggleButtonTooltipId}
          place="bottom-end"
          getContent={getTooltipContent}
          maxWidth="220px"
        />
      ) : null}
      <div className="section-content">
        <Text lineHeight="20px" fontWeight={600} className="section-title">
          {sectionName}
        </Text>
        <Text fontSize="12px" lineHeight="16px" className="section-description">
          {description}
        </Text>
        <FlexContainer>
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
