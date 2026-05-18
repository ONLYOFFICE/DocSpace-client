// (c) Copyright Ascensio System SIA 2009-2026
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

import styles from "./Loaders.styled.module.scss";

const RowLoader = () => (
  <div className={styles.tableRowLoader}>
    <RectangleSkeleton width="888px" height="20px" />
    <div className="iconsLoader">
      <RectangleSkeleton
        width="28px"
        height="16px"
        className="roundedStatusLoader"
      />
      <RectangleSkeleton width="16px" height="16px" />
    </div>
  </div>
);

export const WebhookConfigsLoader = () => {
  return (
    <div className={styles.configsLoaderWrapper}>
      <nav className={styles.navContainerLoader}>
        <RectangleSkeleton width="82px" height="32px" />
        <RectangleSkeleton width="82px" height="32px" />
      </nav>

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

      <header className={styles.tableHeaderLoader}>
        <div className="labelsLoader">
          <RectangleSkeleton width="51px" height="16px" />
          <RectangleSkeleton width="60px" height="16px" />
        </div>
        <div className="iconsLoader">
          <RectangleSkeleton width="62px" height="16px" />
          <RectangleSkeleton width="16px" height="16px" />
        </div>
      </header>

      <RowLoader />
      <RowLoader />
      <RowLoader />
      <RowLoader />
      <RowLoader />
    </div>
  );
};
