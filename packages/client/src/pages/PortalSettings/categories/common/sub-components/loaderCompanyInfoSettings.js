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

import { RectangleSkeleton } from "@docspace/shared/skeletons";
import styled from "styled-components";

const StyledLoader = styled.div`
  .item {
    padding-bottom: 12px;
  }

  .loader-header {
    padding-bottom: 5px;
    display: block;
  }

  .loader-label {
    padding-bottom: 4px;
    display: block;
  }

  .button {
    padding-top: 8px;
  }

  .save {
    padding-inline-end: 8px;
  }
`;

const LoaderCompanyInfoSettings = () => {
  return (
    <StyledLoader>
      <div className="item">
        <RectangleSkeleton
          width="179px"
          height="22px"
          className="loader-header"
        />
        <RectangleSkeleton width="419px" height="22px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="99px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="35px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="40px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="51px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="item">
        <RectangleSkeleton
          width="51px"
          height="20px"
          className="loader-label"
        />
        <RectangleSkeleton width="433px" height="32px" />
      </div>

      <div className="button">
        <RectangleSkeleton width="86px" height="32px" className="save" />
        <RectangleSkeleton width="170px" height="32px" />
      </div>
    </StyledLoader>
  );
};

export default LoaderCompanyInfoSettings;
