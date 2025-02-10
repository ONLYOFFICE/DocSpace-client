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
import { tablet, mobile } from "@docspace/shared/utils";

const StyledLoader = styled.div`
  .header {
    height: 30px;
    margin-bottom: 8px;
    max-width: 700px;
    @media ${mobile} {
      height: 60px;
    }
  }

  .second-container {
    margin: 16px 0;
    display: grid;
    gap: 8px;
    max-width: 350px;
  }

  .second-header {
    max-width: 132px;
    display: block;
    @media ${mobile} {
      max-width: 100%;
    }
  }

  .description {
    margin-top: 16px;
    max-width: 645px;
  }

  .third-container {
    margin: 16px 0;
    display: flex;
    justify-content: space-between;
    grid-template-columns: repeat(3, 1fr);
    max-width: 700px;

    @media ${tablet} {
      display: none;
    }
  }

  .fourth-container {
    display: grid;
    gap: 4px;
    margin-top: 16px;

    .rows-header {
      max-width: 197px;
      display: none;
      @media ${tablet} {
        display: block;
      }
    }
    .rows {
      max-width: 700px;
      display: block;
      margin-bottom: 8px;
    }
  }

  .button {
    margin-top: 32px;
    max-width: 163px;
  }
`;

const AuditTrailLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="100%" />
      <RectangleSkeleton className="header" height="100%" />
      <div className="second-container">
        <RectangleSkeleton height="20px" width="94px" />
        <RectangleSkeleton height="32px" />
      </div>

      <RectangleSkeleton className="second-header" height="32px" />
      <RectangleSkeleton className="description" height="40px" />

      <div className="third-container">
        <RectangleSkeleton height="16px" width="28px" />
        <RectangleSkeleton height="16px" width="28px" />
        <RectangleSkeleton height="16px" width="28px" />
      </div>

      <div className="fourth-container">
        <RectangleSkeleton height="16px" className="rows-header" />
        <RectangleSkeleton height="20px" className="rows" />
      </div>
      <div className="fourth-container">
        <RectangleSkeleton height="16px" className="rows-header" />
        <RectangleSkeleton height="20px" className="rows" />
      </div>
      <div className="fourth-container">
        <RectangleSkeleton height="16px" className="rows-header" />
        <RectangleSkeleton height="20px" className="rows" />
      </div>
      <div className="fourth-container">
        <RectangleSkeleton height="16px" className="rows-header" />
        <RectangleSkeleton height="20px" className="rows" />
      </div>
      <div className="fourth-container">
        <RectangleSkeleton height="16px" className="rows-header" />
        <RectangleSkeleton height="20px" className="rows" />
      </div>

      <RectangleSkeleton height="32px" className="button" />
    </StyledLoader>
  );
};

export default AuditTrailLoader;
