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
import { mobile, tablet } from "@docspace/shared/utils/device";

import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg?url";
import { ImportItemProps, ImportSectionProps } from "../types";

const SectionWrapper = styled.div<{ isChecked: boolean }>`
  max-width: 700px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;

  @media ${tablet} {
    max-width: 675px;
  }

  border-radius: 6px;
  background: ${(props) =>
    props.theme.client.settings.migration.importSectionBackground};

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

const ImportItemWrapper = styled.div<{ isChecked: boolean }>`
  padding-top: 8px;

  @media ${mobile} {
    width: 100%;
  }

  .workspace-title {
    color: ${(props) =>
      props.theme.client.settings.migration.importSectionTextColor};
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

    @media ${mobile} {
      min-width: auto;
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
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;

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
      >
        {workspace}
      </Text>
      <div className="importSection">
        {sectionIcon ? (
          <ReactSVG className="importSectionIcon" src={sectionIcon} />
        ) : null}
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
  dataTestId,
}: ImportSectionProps) => {
  return (
    <SectionWrapper data-testid={dataTestId} isChecked={isChecked}>
      <ToggleButton
        isChecked={isChecked}
        onChange={onChange || (() => {})}
        className="toggleButton"
        isDisabled={isDisabled}
        dataTestId="enable_import_section_button"
      />
      <div>
        <Text lineHeight="20px" fontWeight={600} className="section-title">
          {sectionName}
        </Text>
        <Text fontSize="12px" className="section-description">
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
