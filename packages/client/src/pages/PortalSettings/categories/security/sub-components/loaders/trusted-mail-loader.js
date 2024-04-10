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

const StyledLoader = styled.div`
  padding-right: 8px;

  .header {
    width: 273px;
    margin-bottom: 16px;
  }

  .description {
    margin-bottom: 8px;
  }

  .link {
    margin-bottom: 20px;
  }

  .checkboxs {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 50px;
    margin-bottom: 11px;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .input {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .add {
      width: 85px;
      margin-top: 16px;
    }
  }

  .buttons {
    width: calc(100% - 32px);
    position: absolute;
    bottom: 16px;
  }
`;

const TrustedMailLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="37px" />
      <RectangleSkeleton className="description" height="100px" />
      <div className="link">
        <RectangleSkeleton height="20px" width="57px" />
      </div>

      <div className="checkboxs">
        <RectangleSkeleton height="20px" />
        <RectangleSkeleton height="20px" />
        <RectangleSkeleton height="20px" />
      </div>

      <div className="inputs">
        <div className="input">
          <RectangleSkeleton height="32px" />
          <RectangleSkeleton height="16px" width="16px" />
        </div>
        <div className="input">
          <RectangleSkeleton height="32px" />
          <RectangleSkeleton height="16px" width="16px" />
        </div>
        <div className="input">
          <RectangleSkeleton height="32px" />
          <RectangleSkeleton height="16px" width="16px" />
        </div>

        <RectangleSkeleton className="add" height="20px" />
      </div>

      <RectangleSkeleton className="buttons" height="40px" />
    </StyledLoader>
  );
};

export default TrustedMailLoader;
