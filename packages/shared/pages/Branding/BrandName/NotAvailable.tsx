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

import LockedReactSvgUrl from "PUBLIC_DIR/images/icons/16/locked.react.svg?url";

import React from "react";
import styled from "styled-components";
import { ReactSVG } from "react-svg";
import { Text } from "../../../components/text";
import { TTranslation } from "../../../types";

const StyledWrapper = styled.div`
  background: ${(props) =>
    props.theme.client.settings.common.whiteLabel.notAvailableBackground};
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;

  .lock-icon {
    width: 16px;
    height: 16px;
    div > svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.common.whiteLabel.textColor};
      }
    }
  }
`;

interface IProps {
  t: TTranslation;
}

export const NotAvailable = (props: IProps) => {
  const { t } = props;
  return (
    <StyledWrapper>
      <ReactSVG className="lock-icon" src={LockedReactSvgUrl} />
      <Text fontSize="12px" fontWeight="600">
        {t("NotAvailableUnderLicense")}
      </Text>
    </StyledWrapper>
  );
};
