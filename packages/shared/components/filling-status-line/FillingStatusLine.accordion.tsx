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

import ArrowReactSvgUrl from "PUBLIC_DIR/images/arrow.react.svg?url";

import React, { useState } from "react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "../text";
import { Box } from "../box";
import { Avatar, AvatarRole, AvatarSize } from "../avatar";

import { FillingStatusLineAccordionProps } from "./FillingStatusLine.types";

import styles from "./FillingStatusLine.accordion.module.scss";

const FillingStatusAccordion = ({
  avatar,
  displayName,
  role,
  startFilling,
  startFillingDate,
  filledAndSigned,
  filledAndSignedDate,
  returnedByUser,
  returnedDate,
  comment,
  isDone,
  isInterrupted,
}: FillingStatusLineAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClickHandler = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.accordionItem}>
      <div className={styles.accordionItemInfo} onClick={onClickHandler}>
        <Box displayProp="flex" alignItems="center">
          <div
            className={classNames(styles.userAvatar, {
              [styles.isDone]: isDone,
              [styles.isInterrupted]: isInterrupted,
            })}
          >
            <Avatar
              size={AvatarSize.min}
              role={AvatarRole.user}
              source={avatar || ""}
              userName={displayName}
            />
          </div>
          <Box
            displayProp="flex"
            flexDirection="column"
            marginProp="0 0 0 10px"
          >
            <Text fontSize="14px" lineHeight="16px" fontWeight="bold">
              {displayName}
            </Text>
            <Text
              as="span"
              className={styles.accordionRole}
              fontSize="12px"
              lineHeight="16px"
            >
              {role}
            </Text>
          </Box>
        </Box>
        <ReactSVG
          src={ArrowReactSvgUrl}
          className={classNames(styles.arrowIcon, { [styles.isOpen]: isOpen })}
        />
      </div>

      {isOpen ? (
        <>
          <div className={styles.accordionItemHistory}>
            <div
              className={classNames(styles.accordionItemWrapper, {
                [styles.isDone]: isDone,
                [styles.isInterrupted]: isInterrupted,
              })}
            >
              <Text
                fontSize="12px"
                lineHeight="16px"
                className={styles.statusText}
              >
                {startFilling}
              </Text>
            </div>

            <Text
              fontSize="12px"
              lineHeight="16px"
              className={styles.statusDate}
            >
              {startFillingDate}
            </Text>
          </div>

          {returnedByUser ? (
            <div className={styles.accordionItemHistory}>
              <div
                className={classNames(styles.accordionItemWrapper, {
                  [styles.isDone]: isDone,
                  [styles.isInterrupted]: isInterrupted,
                })}
              >
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  className={styles.statusText}
                >
                  {returnedByUser}
                </Text>
              </div>

              <Text
                fontSize="12px"
                lineHeight="16px"
                className={styles.statusDate}
              >
                {returnedDate}
              </Text>
            </div>
          ) : null}

          {comment ? (
            <div className={styles.accordionItemHistory}>
              <div
                className={classNames(styles.accordionItemWrapper, {
                  [styles.isDone]: isDone,
                  [styles.isInterrupted]: isInterrupted,
                })}
              >
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  className={styles.statusText}
                >
                  {comment}
                </Text>
              </div>
            </div>
          ) : null}

          {isDone ? (
            <div className={styles.accordionItemHistory}>
              <div
                className={classNames(styles.accordionItemWrapper, {
                  [styles.isDone]: isDone,
                  [styles.isInterrupted]: isInterrupted,
                })}
              >
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  className={classNames(styles.filledStatusText, {
                    [styles.isDone]: isDone,
                  })}
                >
                  {filledAndSigned}
                </Text>
              </div>

              <Text
                fontSize="12px"
                lineHeight="16px"
                className={styles.statusDate}
              >
                {filledAndSignedDate}
              </Text>
            </div>
          ) : null}
        </>
      ) : (
        <div className={styles.accordionItemHistory}>
          <div
            className={classNames(styles.accordionItemWrapper, {
              [styles.isDone]: isDone,
              [styles.isInterrupted]: isInterrupted,
            })}
          >
            <Text
              fontSize="12px"
              lineHeight="16px"
              className={classNames(styles.filledStatusText, {
                [styles.isDone]: isDone,
              })}
            >
              {filledAndSigned}
            </Text>
          </div>

          <Text fontSize="12px" lineHeight="16px" className={styles.statusDate}>
            {filledAndSignedDate}
          </Text>
        </div>
      )}
    </div>
  );
};
export { FillingStatusAccordion };
