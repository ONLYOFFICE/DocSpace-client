// (c) Copyright Ascensio System SIA 2010-2024
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

import { Heading } from "@docspace/shared/components/heading";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

const StyledHeader = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  .plugin-list-header {
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    font-weight: 700;
    lien-height: 22px;

    margin: 0 4px 0 0;
    padding: 0;
  }

  .header-container {
    margin-bottom: 8px;
  }

  div {
    display: flex;
    align-items: center;
  }
`;

const Header = ({ t, currentColorScheme, withUpload }) => {
  return (
    <StyledHeader>
      <div className="header-container">
        <Heading className={"plugin-list-header"}>
          {t("Common:Plugins")}
        </Heading>
        {/* <HelpButton
          offsetBottom={0}
          offsetLeft={0}
          offsetRight={0}
          offsetTop={0}
          tooltipContent={t("PluginsHelp")}
        /> */}
      </div>
      <div>
        <Text>{withUpload ? t("Description") : t("PluginsHelp")}</Text>
      </div>
    </StyledHeader>
  );
};

export default Header;
