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
import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";

import classNames from "classnames";
import { inject, observer } from "mobx-react";

import { DeviceType } from "@docspace/shared/enums";
import styles from "./styles/ServicesLoader.module.scss";

type ServicesLoaderProps = {
  currentDeviceType?: DeviceType;
};

const LoaderContainer = () => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.topRow}>
        <RectangleSkeleton width="32px" height="32px" />
        <RectangleSkeleton width="28px" height="16px" />
      </div>

      <div className={styles.middleRow}>
        <RectangleSkeleton width="100%" height="16px" />
      </div>

      <div className={styles.longRow}>
        <RectangleSkeleton width="100%" height="16px" />
      </div>

      <div className={styles.bottomRow}>
        <RectangleSkeleton width="111px" height="16px" />
      </div>
    </div>
  );
};

const ServicesLoader: React.FC<ServicesLoaderProps> = ({
  currentDeviceType,
}) => {
  const isMobile = currentDeviceType === DeviceType.mobile;

  const gridClassName = isMobile
    ? `${styles.gridContainer} ${styles.gridContainerMobile}`
    : `${styles.gridContainer} ${styles.gridContainerDesktop}`;

  return (
    <div className={styles.loaderWrapper}>
      <div
        className={classNames(styles.firstLoader, {
          [styles.firstMobileLoader]: isMobile,
        })}
      >
        <RectangleSkeleton width="100%" height="20px" />
      </div>
      <div className={gridClassName}>
        <LoaderContainer />
        <LoaderContainer />
        <LoaderContainer />
        <LoaderContainer />
      </div>
    </div>
  );
};

export default inject(({ settingsStore }: TStore) => {
  const { currentDeviceType } = settingsStore;

  return {
    currentDeviceType,
  };
})(observer(ServicesLoader));
