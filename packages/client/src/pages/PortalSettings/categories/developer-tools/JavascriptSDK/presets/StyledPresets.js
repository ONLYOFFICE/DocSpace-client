// (c) Copyright Ascensio System SIA 2009-2024
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

import styled, { css } from "styled-components";
import { isMobile, mobile, tablet } from "@docspace/shared/utils/device";
import { Box } from "@docspace/shared/components/box";
import Base from "@docspace/shared/themes/base";

export const SDKContainer = styled(Box)`
  @media ${tablet} {
    width: 100%;
  }

  ${isMobile() &&
  css`
    width: 100%;
  `}

  .tabs_body {
    height: calc(100lvh - 260px);
  }

  .linkHelp {
    display: inline;
    color: "#657077";
  }
`;

export const Controls = styled(Box)`
  max-width: 350px;
  min-width: 350px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 16px;

  @media ${tablet} {
    min-width: 0;
  }

  ${isMobile() &&
  css`
    min-width: 0;
  `}

  .label {
    min-width: fit-content;
  }

  .checkbox {
    max-width: fit-content;
  }
`;

export const CategoryHeader = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  font-style: normal;
  font-weight: 700;
  line-height: 22px;

  @media ${tablet} {
    margin-top: 24px;
  }

  ${isMobile() &&
  css`
    margin-top: 24px;
  `}
`;

export const CategorySubHeader = styled.div`
  font-size: ${(props) => props.theme.getCorrectFontSize("15px")};
  font-style: normal;
  font-weight: 600;
  line-height: 16px;

  @media ${tablet} {
    &:not(&.copy-window-code) {
      margin-bottom: 0;
    }
  }

  ${isMobile() &&
  css`
    &:not(&.copy-window-code) {
      margin-bottom: 0;
    }
  `}

  @media ${mobile} {
    &:first-of-type {
      margin-top: 0;
    }
  }
`;

export const CategoryDescription = styled(Box)`
  max-width: 700px;
  .sdk-description {
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }
`;

export const ControlsGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .toggle {
    position: relative;
  }

  @media ${tablet} {
    gap: 4px;
  }

  ${isMobile() &&
  css`
    gap: 4px;
  `}
`;

export const CheckboxGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const LabelGroup = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const ControlsSection = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Frame = styled(Box)`
  margin-top: 16px;
  position: relative;

  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.sdkPresets.borderColor};

  width: calc(${(props) => (props.width ? props.width : "100%")} + 2px);
  height: calc(${(props) => (props.height ? props.height : "100%")} + 2px);
  display: flex;
  align-items: center;
  justify-content: center;

  @media ${tablet} {
    margin-top: 4px;
  }

  ${(props) =>
    !props.width &&
    css`
      max-width: 800px;
    `}

  ${(props) =>
    !props.height &&
    css`
      min-height: 400px;
      max-height: 600px;
    `}


  ${(props) =>
    props.targetId &&
    `
    #${props.targetId} {
      border-radius: 6px;
    }
  `}

  ${isMobile() &&
  css`
    margin-top: 4px;
  `}

  .frame-container {
    height: 100% !important;
  }
`;

Frame.defaultProps = { theme: Base };

export const Container = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 48px;

  @media ${tablet} {
    flex-direction: column-reverse;
    gap: 48px;
  }

  ${isMobile() &&
  css`
    flex-direction: column-reverse;
    gap: 48px;
  `}
`;

export const RowContainer = styled(Box)`
  flex-direction: row;
  display: flex;
  gap: 8px;

  ${(props) =>
    props.combo &&
    `
      height: 32px;
      align-items: center;
    `}
`;

export const ColumnContainer = styled(Box)`
  flex-direction: column;
  display: flex;
  gap: 8px;
`;

export const Preview = styled(Box)`
  width: 100%;
  min-width: 660px;
  flex-direction: row;

  @media ${tablet} {
    margin-top: 0;
    min-width: 0;
  }
  ${isMobile() &&
  css`
    margin-top: 0;
    min-width: 0;
  `}
`;

export const GetCodeButtonWrapper = styled.div`
  padding-block: 30px;
  position: sticky;
  bottom: 0;
  margin-top: 32px;
  background-color: ${({ theme }) => theme.backgroundColor};

  @media ${mobile} {
    position: fixed;
    padding-inline: 16px;
    inset-inline: 0;
  }
`;

export const FilesSelectorInputWrapper = styled.div`
  & > div {
    margin: 0;
  }
`;

export const SelectedItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const CodeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  margin-top: 16px;

  width: calc(${(props) => (props.width ? props.width : "100%")} + 2px);
  max-width: 800px;
  height: calc(${(props) => (props.height ? props.height : "400px")} + 2px);
`;
