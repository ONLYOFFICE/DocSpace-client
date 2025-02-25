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
`;

const NavContainerLoader = styled.nav`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 17px;
`;

const HistoryHeaderLoader = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 27px;
`;

const HistoryRowWrapper = styled.div`
  margin-bottom: 27px;

  .historyIconLoader {
    display: inline-block;
    margin-inline-end: 16px;
  }

  .historyContentLoader {
    display: inline-block;
    width: calc(100% - 36px);
  }
`;

const HistoryRowLoader = () => (
  <HistoryRowWrapper>
    <RectangleSkeleton
      width="20px"
      height="20px"
      className="historyIconLoader"
    />
    <RectangleSkeleton height="20px" className="historyContentLoader" />
  </HistoryRowWrapper>
);

export const WebhookHistoryLoader = () => {
  return (
    <LoaderWrapper>
      <NavContainerLoader>
        <RectangleSkeleton width="118px" height="22px" />
        <RectangleSkeleton width="32px" height="22px" />
      </NavContainerLoader>

      <HistoryHeaderLoader>
        <RectangleSkeleton width="51px" height="16px" />
        <RectangleSkeleton width="60px" height="16px" />
        <RectangleSkeleton width="60px" height="16px" />
        <RectangleSkeleton width="62px" height="16px" />
        <RectangleSkeleton width="16px" height="16px" />
      </HistoryHeaderLoader>

      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
    </LoaderWrapper>
  );
};
