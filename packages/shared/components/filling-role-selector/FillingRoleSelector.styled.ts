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

import AddRoleButton from "PUBLIC_DIR/images/add.role.button.react.svg";
import EveryoneRoleIcon from "PUBLIC_DIR/images/everyone.role.button.react.svg";

import { globalColors } from "../../themes";
import { injectDefaultTheme } from "../../utils";

const StyledFillingRoleSelector = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledRow = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledUserRow = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-with-role {
    display: flex;
  }
`;

const StyledNumber = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: ${globalColors.gray};
`;

const StyledAvatar = styled.img`
  height: 32px;
  width: 32px;
  border-radius: 50%;
`;

const StyledAddRoleButton = styled(AddRoleButton)`
  width: 32px;
  height: 32px;

  path {
    fill: ${(props) => props.color};
  }

  rect {
    stroke: ${(props) => props.color};
  }
`;

const StyledEveryoneRoleIcon = styled(EveryoneRoleIcon)`
  width: 32px;
  height: 32px;
`;

const StyledRole = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

const StyledAssignedRole = styled.div`
  padding-inline-start: 4px;
  color: ${globalColors.gray};

  ::before {
    content: "(";
  }
  ::after {
    content: ")";
  }
`;

const StyledEveryoneRoleContainer = styled.div`
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
  }

  .role-description {
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    color: ${globalColors.lightGrayDark};
  }
`;

const StyledTooltip = styled.div`
  background: ${globalColors.lightToastInfo};
  color: ${globalColors.black};
  border-radius: 6px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  padding: 8px 12px;
  height: 48px;
  box-sizing: border-box;
  margin: 8px 0;
`;

export {
  StyledFillingRoleSelector,
  StyledRow,
  StyledNumber,
  StyledAddRoleButton,
  StyledEveryoneRoleIcon,
  StyledRole,
  StyledEveryoneRoleContainer,
  StyledTooltip,
  StyledAssignedRole,
  StyledAvatar,
  StyledUserRow,
};
