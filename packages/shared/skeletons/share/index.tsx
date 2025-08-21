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

import React from "react";
import { Text } from "../../components/text";
import { TTranslation } from "../../types";
import { RectangleSkeleton, CircleSkeleton } from "../index";
import styles from "./Share.module.scss";

export const RowSkeleton = () => {
  return (
    <div className={styles.row}>
      <CircleSkeleton x="16" y="16" radius="16" width="32" height="32" />
      <div className={styles.content}>
        <RectangleSkeleton width="161px" height="16px" />
        <RectangleSkeleton width="119px" height="16px" />
      </div>
      <div className={styles.actions}>
        <RectangleSkeleton width="16px" height="16px" />
        <RectangleSkeleton width="42px" height="28px" />
      </div>
    </div>
  );
};

interface ShareSkeletonProps {
  t: TTranslation;
}

const ShareSkeleton = ({ t }: ShareSkeletonProps) => {
  return (
    <div className={styles.wrapper}>
      <Text fontSize="14px" fontWeight={600} className={styles.titleLink}>
        {t("Common:SharedLinks")}
      </Text>
      <RowSkeleton />
      <div className={styles.title}>
        <RectangleSkeleton width="154px" height="16px" />
      </div>
      <RowSkeleton />
    </div>
  );
};

export default ShareSkeleton;
