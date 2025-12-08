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
import classNames from "classnames";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Text } from "@docspace/shared/components/text";
import styles from "../styles/AdditionalStorage.module.scss";

interface ServiceCardProps {
  onClick: (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => void;
  priceTitle: string;
  id: string;
  image: string;
  serviceTitle: string;
  priceDescription: string;
  children?: React.ReactNode;
  toggleDisabled?: boolean;
  cardDisabled?: boolean;
  isEnabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  cardDisabled,
  onClick,
  onToggle,
  priceTitle,
  children,
  toggleDisabled,
  isEnabled,
  id,
  image,
  serviceTitle,
  priceDescription,
}) => {
  return (
    <div
      key={id}
      className={classNames(styles.serviceContainer, {
        [styles.disabled]: cardDisabled,
      })}
      {...(!cardDisabled ? { onClick } : {})}
      data-testid={`storage_service_${id}`}
      data-id={id}
    >
      <div className={styles.headerContainer}>
        <div className={styles.iconWrapper}>
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
            dangerouslySetInnerHTML={{ __html: image }}
            className={styles.iconsContainer}
          />
        </div>

        <div
          onClick={onToggle}
          className={styles.toggleWrapper}
          data-id={id}
          data-enabled={isEnabled}
          data-disabled={toggleDisabled}
        >
          <ToggleButton
            isChecked={isEnabled}
            className={styles.serviceToggle}
            isDisabled={toggleDisabled}
            dataTestId={`storage_service_${id}_toggle`}
          />
        </div>
      </div>

      <div className={styles.contentContainer}>
        <Text
          fontWeight={600}
          fontSize="14px"
          className={styles.containerTitle}
        >
          {serviceTitle}
        </Text>

        <div className={styles.middleBlock}>
          <Text fontSize="12px" className={styles.priceDescription}>
            {priceTitle}
          </Text>

          {children}

          <div className={styles.priceContainer}>
            <Text fontSize="12px" fontWeight={600}>
              {priceDescription}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
