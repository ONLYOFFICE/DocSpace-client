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

const LoaderWrapper = styled.div`
  width: 100%;

  .webhookTextLoader {
    display: block;
    margin-bottom: 24px;
  }
  .webhookButtonLoader {
    display: block;
    margin-bottom: 16px;
  }

  .labelsLoader {
    width: 435px;
    display: flex;
    justify-content: space-between;
  }
  .iconsLoader {
    width: 131px;
    display: flex;
    justify-content: space-between;
  }

  .roundedStatusLoader {
    border-radius: 10px;
  }
`;

const NavContainerLoader = styled.nav`
  width: 184px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TableHeaderLoader = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 33px;
`;

const TableRowLoader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 27px;
`;

const RowLoader = () => (
  <TableRowLoader>
    <RectangleSkeleton width="888px" height="20px" />
    <div className="iconsLoader">
      <RectangleSkeleton
        width="28px"
        height="16px"
        className="roundedStatusLoader"
      />
      <RectangleSkeleton width="16px" height="16px" />
    </div>
  </TableRowLoader>
);

export const WebhookConfigsLoader = () => {
  return (
    <LoaderWrapper>
      <NavContainerLoader>
        <RectangleSkeleton width="82px" height="32px" />
        <RectangleSkeleton width="82px" height="32px" />
      </NavContainerLoader>

      <RectangleSkeleton
        width="700px"
        height="88px"
        className="webhookTextLoader"
      />

      <RectangleSkeleton
        width="159px"
        height="32px"
        className="webhookButtonLoader"
      />

      <TableHeaderLoader>
        <div className="labelsLoader">
          <RectangleSkeleton width="51px" height="16px" />
          <RectangleSkeleton width="60px" height="16px" />
        </div>
        <div className="iconsLoader">
          <RectangleSkeleton width="62px" height="16px" />
          <RectangleSkeleton width="16px" height="16px" />
        </div>
      </TableHeaderLoader>

      <RowLoader />
      <RowLoader />
      <RowLoader />
      <RowLoader />
      <RowLoader />
    </LoaderWrapper>
  );
};
