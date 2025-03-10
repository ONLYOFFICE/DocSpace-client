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
import { Badge } from "../../badge";

import styles from "../Navigation.module.scss";
import { TTextProps } from "../Navigation.types";

import ArrowIcon from "./ArrowIcon";
import Heading from "./Heading";
import ExpanderIcon from "./ExpanderIcon";

const Text = ({
  title,
  isOpen,
  isRootFolder,
  isRootFolderTitle,
  onClick,
  badgeLabel,
  className,
  ...rest
}: TTextProps) => {
  return (
    <div
      className={`${className} ${styles.textContainer}`}
      onClick={onClick}
      data-root-folder={isRootFolder}
      data-root-folder-title={isRootFolderTitle}
      {...rest}
    >
      <Heading title={title} truncate isRootFolderTitle={isRootFolderTitle}>
        {title}
      </Heading>
      {badgeLabel ? (
        <Badge
          className={`${styles.titleBlockBadge} ${isRootFolderTitle ? styles.rootFolderTitle : ""}`}
          label={badgeLabel}
          fontSize="9px"
          padding="2px 5px"
          fontWeight={700}
          borderRadius="50px"
          noHover
          isHovered={false}
        />
      ) : null}
      {isRootFolderTitle ? <ArrowIcon /> : null}
      {!isRootFolderTitle && !isRootFolder ? (
        <ExpanderIcon isRotated={isOpen} />
      ) : null}
    </div>
  );
};

export default React.memo(Text);
