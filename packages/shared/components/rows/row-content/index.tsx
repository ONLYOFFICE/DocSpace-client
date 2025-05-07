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
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";
import styles from "./RowContent.module.scss";
import { RowContentProps } from "./RowContent.types";
import { getSideInfo } from "./RowContent.utils";

const RowContent = (props: RowContentProps) => {
  const {
    children,
    disableSideInfo = false,
    id,
    className,
    style,
    sideColor,
    onClick,
    sectionWidth,
    convertSideInfo = true,
  } = props;

  const { interfaceDirection } = useInterfaceDirection();

  const sideInfo = getSideInfo(children, convertSideInfo, interfaceDirection);

  let mainContainerWidth;

  if (React.isValidElement(children[0]))
    mainContainerWidth =
      (children[0].props && children[0].props.containerWidth) || "140px";

  const mainContainerStyle = mainContainerWidth
    ? ({
        ...style,
        "--main-container-width": mainContainerWidth,
      } as React.CSSProperties)
    : style;

  return (
    <div
      className={classNames(
        styles.rowContent,
        { [styles.sectionWidth]: sectionWidth },
        className,
      )}
      id={id}
      onClick={onClick}
      style={style}
      data-testid="row-content"
    >
      <div
        className={classNames(
          styles.mainContainerWrapper,
          "row-main-container-wrapper",
        )}
        style={mainContainerStyle}
      >
        <div className={classNames(styles.mainContainer, "rowMainContainer")}>
          {children[0]}
        </div>
        <div className={classNames(styles.mainIcons, "mainIcons")}>
          {children[1]}
        </div>
      </div>
      {children.map((element: React.ReactNode, index: number) => {
        if (index > 1 && React.isValidElement(element)) {
          const p = element.props as {
            containerWidth?: string;
            containerMinWidth?: string;
          };
          return (
            <div
              className={classNames(styles.sideContainerWrapper)}
              key={`side-${index * 10}`}
              style={{
                width: p.containerWidth || "40px",
                minWidth: p.containerMinWidth || "40px",
              }}
            >
              {element}
            </div>
          );
        }
        return null;
      })}
      {!disableSideInfo ? (
        <div
          className={classNames(styles.tabletSideInfo)}
          style={{ color: sideColor }}
        >
          {sideInfo}
        </div>
      ) : null}
    </div>
  );
};

export { RowContent };
