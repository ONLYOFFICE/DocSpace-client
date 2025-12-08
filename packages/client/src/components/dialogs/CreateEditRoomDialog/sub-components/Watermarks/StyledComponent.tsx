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

import { globalColors } from "@docspace/shared/themes";
import styled from "styled-components";

const StyledWatermark = styled.div<{
  isEdit?: boolean;
  rotate?: number;
  scale?: number;
}>`
  margin-top: 16px;

  .watermark-title {
    margin: 16px 0 8px 0;
  }
  .title-without-top {
    margin-top: 0px;
  }
  .watermark-checkbox {
    margin: 18px 0 0 0;
  }

  .options-wrapper {
    display: grid;
    grid-template-rows: 56px 56px;
    gap: 16px;

    .options {
      color: ${(props) => props.theme.comboBox.label.selectedColor};
    }
  }

  .image-wrapper {
    display: grid;
    grid-template-columns: 216px auto;
    gap: 16px;

    .image-description {
      display: flex;
      gap: 8px;
      align-items: baseline;

      .image-watermark_text {
        margin-bottom: 8px;
      }
    }

    .image-watermark_wrapper {
      width: 216px;
      height: 216px;
      border: 1px solid ${globalColors.grayLightMid};

      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 88%;
        height: 88%;
        transform: ${(props) =>
          `rotate(${props.rotate}deg) scale(${props.scale})`};

        opacity: 0.4;
        margin: auto;
      }
    }
  }

  .watermark-tab_items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 20px;
  }
`;
const StyledBody = styled.div`
  .types-content {
  }
`;

export { StyledWatermark, StyledBody };
