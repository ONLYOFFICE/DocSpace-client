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
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledLoader = styled.div`
  .description {
    margin-bottom: 12px;
  }

  .setting {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: row;

    margin-bottom: 4px;
  }

  .checkbox {
    margin-top: 2px;
  }

  .description-setting {
    margin-left: 24px;
    width: calc(100% - 24px);
  }

  .setting-container {
    margin-bottom: 12px;
  }

  .buttons {
    width: calc(100% - 16px);
    position: absolute;
    bottom: 16px;
  }
`;

const InvitationLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="description" height="80px" />

      <div className="setting-container">
        <div className="setting">
          <RectangleSkeleton className="checkbox" width="16px" height="16px" />
          <RectangleSkeleton width="243px" height="20px" />
        </div>

        <RectangleSkeleton className="description-setting" height="64px" />
      </div>

      <div>
        <div className="setting">
          <RectangleSkeleton className="checkbox" width="16px" height="16px" />
          <RectangleSkeleton width="129px" height="20px" />
        </div>

        <RectangleSkeleton className="description-setting" height="32px" />
      </div>

      <RectangleSkeleton className="buttons" height="40px" />
    </StyledLoader>
  );
};

export default InvitationLoader;
