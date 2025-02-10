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
import { useState, useEffect } from "react";

import { isMobile } from "../../utils";
import { RectangleSkeleton } from "../rectangle";
import styles from "./Dialog.module.scss";

export const DialogInvitePanelSkeleton = () => {
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const checkWidth = () => setIsMobileView(isMobile());

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <div
      className={styles.dialogInviteLoader}
      data-testid="dialog-invite-panel-skeleton"
    >
      <div className="dialog-loader-header">
        <RectangleSkeleton height="29px" />
      </div>

      <div className={styles.externalLinksLoader}>
        <div className="external-links-loader">
          <RectangleSkeleton width="177px" height="22px" />
          <RectangleSkeleton className="check-box" width="28px" height="16px" />
        </div>

        <RectangleSkeleton
          className="external-links-loader__description"
          width="320px"
          height="16px"
        />
      </div>

      <div className={styles.inviteInputLoader}>
        <div className={styles.invitePanelLoaderHeader}>
          <RectangleSkeleton
            width={isMobileView ? "156px" : "212px"}
            height="22px"
          />
          <RectangleSkeleton
            width={isMobileView ? "79px" : "122px"}
            height="19px"
          />
        </div>
        <RectangleSkeleton width="100%" height="32px" />
        <div className={styles.invitePanelLoaderFooter}>
          <RectangleSkeleton
            height="32px"
            width={isMobileView ? "237px" : "342px"}
          />
          <RectangleSkeleton width="98px" height="32px" />
        </div>
      </div>

      <div className="dialog-loader-footer">
        <RectangleSkeleton height="40px" />
        <RectangleSkeleton height="40px" />
      </div>
    </div>
  );
};
