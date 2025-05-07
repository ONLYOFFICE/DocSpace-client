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

  .display-block {
    display: block;
  }

  .mb-4 {
    margin-bottom: 4px;
  }

  .mb-5 {
    margin-bottom: 5px;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .mb-23 {
    margin-bottom: 23px;
  }

  .mb-24 {
    margin-bottom: 24px;
  }

  .mr-20 {
    margin-inline-end: 20px;
  }
`;

const DetailsWrapperLoader = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;
const DetailsItemWrapper = styled.div`
  padding: 16px;
  margin-inline-end: 40px;
  display: inline-block;
`;

const DetailsItemLoader = () => (
  <DetailsItemWrapper>
    <RectangleSkeleton
      width="37px"
      height="16px"
      className="mb-5 display-block"
    />
    <RectangleSkeleton width="180px" height="20px" />
  </DetailsItemWrapper>
);

const MessageHeader = () => (
  <RectangleSkeleton width="130px" height="20px" className="mb-4" />
);

export const WebhookDetailsLoader = () => {
  return (
    <LoaderWrapper>
      <DetailsWrapperLoader>
        <RectangleSkeleton
          width="80px"
          height="20px"
          className="mb-24 display-block"
        />
        <DetailsItemLoader />
        <DetailsItemLoader />
        <DetailsItemLoader />
        <DetailsItemLoader />
      </DetailsWrapperLoader>
      <div className=" mb-23">
        <RectangleSkeleton width="43px" height="32px" className="mr-20" />
        <RectangleSkeleton width="64px" height="32px" />
      </div>

      <MessageHeader />
      <RectangleSkeleton width="100%" height="212px" className="mb-16" />

      <MessageHeader />
      <RectangleSkeleton width="100%" height="469px" />
    </LoaderWrapper>
  );
};
