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

import React from "react";
import { RowContainer } from "@docspace/shared/components/rows";
import SpacesRoomRow from "./SpacesRoomRow";
import styled from "styled-components";
import { TPortals } from "SRC_DIR/types/spaces";

import { desktop, injectDefaultTheme } from "@docspace/shared/utils";

const StyledRowContainer = styled(RowContainer).attrs(injectDefaultTheme)`
  @media ${desktop} {
    max-width: 620px;

    .row_content {
      max-width: 508px;
    }
  }
  max-width: 100%;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.rowContainer.borderColor};
  border-bottom: none;
  border-radius: 6px;
  margin-top: 20px;
`;

type TRowContainer = {
  portals: TPortals[];
};

export const SpacesRowContainer = ({ portals }: TRowContainer) => {
  return (
    <StyledRowContainer useReactWindow={false}>
      {portals.map((item: TPortals) => (
        <SpacesRoomRow key={item.tenantId} item={item} />
      ))}
    </StyledRowContainer>
  );
};
