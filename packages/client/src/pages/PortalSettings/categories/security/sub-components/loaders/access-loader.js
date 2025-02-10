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
    width: 296px;
    height: 29px;
    margin-bottom: 14px;

    @media ${tablet} {
      width: 184px;
      height: 37px;
    }

    @media ${mobile} {
      width: 273px;
      height: 37px;
      margin-bottom: 18px;
    }
  }

  .submenu {
    display: flex;
    gap: 20px;
    margin-bottom: 22px;
  }

  .owner {
    width: 700px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 40px;

    @media ${mobile} {
      width: 100%;
    }

    .header {
      height: 40px;
      @media ${tablet} {
        height: 60px;
      }
    }
  }

  .admins {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .description {
      width: 700px;
      @media ${tablet} {
        width: 100%;
      }
    }
  }
`;

const AccessLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="header" height="100%" />
      <div className="submenu">
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
        <RectangleSkeleton height="28px" width="72px" />
      </div>
      <div className="owner">
        <RectangleSkeleton className="header" height="100%" />
        <RectangleSkeleton height="82px" />
      </div>
      <div className="admins">
        <RectangleSkeleton height="22px" width="77px" />
        <RectangleSkeleton height="20px" width="56px" />
        <RectangleSkeleton className="description" height="40px" />
      </div>
    </StyledLoader>
  );
};

export default AccessLoader;
