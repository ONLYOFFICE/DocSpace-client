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

import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

const StyledLoader = styled.div`
  .submenu {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    .item {
      width: 72px;
    }
  }

  .description {
    max-width: 700px;
    margin-bottom: 20px;
  }

  .category {
    margin-top: 24px;
    width: 238px;
  }
`;

const SSOLoader = (props) => {
  const { isToggleSSO } = props;
  return (
    <StyledLoader>
      {!isToggleSSO && (
        <div className="submenu">
          <RectangleSkeleton className="item" height="28px" />
          <RectangleSkeleton className="item" height="28px" />
        </div>
      )}
      <RectangleSkeleton className="description" height="60px" />
      <RectangleSkeleton height="64px" />

      <RectangleSkeleton className="category" height="22px" />
      <StyledSettingsSeparator />
      <RectangleSkeleton className="category" height="22px" />
    </StyledLoader>
  );
};

export default SSOLoader;
