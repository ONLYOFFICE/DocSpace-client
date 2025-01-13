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

import { useState, useEffect } from "react";
import styled from "styled-components";
import { isMobile } from "../../utils";
import { RectangleSkeleton } from "../rectangle";

export const InvitePanelLoaderWrapper = styled.div`
  .dialog-loader-header {
    padding: 12px 16px;
    height: 53px;
    border-bottom: ${(props) =>
      `1px solid ${props.theme.modalDialog.headerBorderColor}`};
    box-sizing: border-box;
  }

  .dialog-loader-footer {
    padding: 12px 16px;
    position: fixed;
    bottom: 0;

    height: 71px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    box-sizing: border-box;

    border-top: ${(props) =>
      `1px solid ${props.theme.modalDialog.headerBorderColor}`};
  }
`;

export const ExternalLinksLoaderWrapper = styled.div`
  padding: 20px 16px 16px;
  border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

  .external-links-loader {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .check-box {
    padding-top: 3px;
  }
`;

export const InviteInputLoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 20px 16px;
`;

export const InviteInputLoaderHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InviteInputLoaderFooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  margin-top: 8px;
`;

export const DialogInvitePanelSkeleton = () => {
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const checkWidth = () => setIsMobileView(isMobile());

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <InvitePanelLoaderWrapper>
      <div className="dialog-loader-header">
        <RectangleSkeleton height="29px" />
      </div>

      <ExternalLinksLoaderWrapper>
        <div className="external-links-loader">
          <RectangleSkeleton width="177px" height="22px" />
          <RectangleSkeleton className="check-box" width="28px" height="16px" />
        </div>

        <RectangleSkeleton
          className="external-links-loader__description"
          width="320px"
          height="16px"
        />
      </ExternalLinksLoaderWrapper>

      <InviteInputLoaderWrapper>
        <InviteInputLoaderHeaderWrapper>
          <RectangleSkeleton
            width={isMobileView ? "156px" : "212px"}
            height="22px"
          />
          <RectangleSkeleton
            width={isMobileView ? "79px" : "122px"}
            height="19px"
          />
        </InviteInputLoaderHeaderWrapper>
        <RectangleSkeleton width="100%" height="32px" />
        <InviteInputLoaderFooterWrapper>
          <RectangleSkeleton
            height="32px"
            width={isMobileView ? "237px" : "342px"}
          />
          <RectangleSkeleton width="98px" height="32px" />
        </InviteInputLoaderFooterWrapper>
      </InviteInputLoaderWrapper>

      <div className="dialog-loader-footer">
        <RectangleSkeleton height="40px" />
        <RectangleSkeleton height="40px" />
      </div>
    </InvitePanelLoaderWrapper>
  );
};
