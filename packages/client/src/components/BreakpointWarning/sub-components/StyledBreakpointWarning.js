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

import styled from "styled-components";
import { mobileMore } from "@docspace/shared/utils";

const StyledBreakpointWarning = styled.div`
  padding-block: 24px 0;
  padding-inline: 24px 44px;
  display: flex;
  flex-direction: column;

  .description {
    display: flex;
    flex-direction: column;
    padding-top: 32px;
    white-space: break-spaces;
  }

  .text-breakpoint {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    padding-bottom: 8px;
    max-width: 348px;
  }

  .text-prompt {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
  }

  img {
    width: 72px;
    height: 72px;
  }

  @media ${mobileMore} {
    flex-direction: row;

    padding-block: 65px 0;
    padding-inline: 104px 0;

    .description {
      padding-block: 0;
      padding-inline: 32px 0;
    }

    img {
      width: 100px;
      height: 100px;
    }
  }
`;

export default StyledBreakpointWarning;
