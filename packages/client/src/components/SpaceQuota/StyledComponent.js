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
import { Text } from "@docspace/shared/components/text";

const StyledBody = styled.div`
  overflow: hidden;
  width: 100%;
  max-width: max-content;
  margin-inline-start: 0px !important;

  display: flex;
  flex-wrap: nowrap;
  height: 28px;
  align-items: center;

  p {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .combobobox-space-quota {
    flex: 1;
    min-width: 0;
    .combo-button {
      padding-inline: ${(props) => (props.isLoading ? "16px 0" : "8px 0")};
      width: auto;
    }
  }
`;

const StyledText = styled(Text)`
  overflow: hidden;
  width: 100%;
  max-width: max-content;

  padding-top: ${(props) =>
    props.$withoutLimitQuota || props.$isReadOnly ? "0px" : "8px"};

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export { StyledText, StyledBody };
