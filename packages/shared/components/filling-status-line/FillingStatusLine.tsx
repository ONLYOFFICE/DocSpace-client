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

import StatusDoneReactSvgUrl from "PUBLIC_DIR/images/done.react.svg?url";
import StatusInterruptedSvgUrl from "PUBLIC_DIR/images/interrupted.react.svg?url";

import React from "react";
import { ReactSVG } from "react-svg";
import classNames from "classnames";

import { Text } from "../text";
import { Box } from "../box";

import { FillingStatusAccordion } from "./FillingStatusLine.accordion";
import { FillingStatusLineProps } from "./FillingStatusLine.types";

import styles from "./FillingStatusLine.module.scss";

import { mockData } from "./mockData";

const FillingStatusLine = ({
  statusDoneText = "Done",
  statusInterruptedText = "Interrupted",
  statusDone = true,
  statusInterrupted = false,
}: FillingStatusLineProps) => {
  return (
    <div
      className={styles.fillingStatusContainer}
      data-testid="filling-status-line"
    >
      {mockData.map((data) => {
        return (
          <FillingStatusAccordion
            key={data.id}
            displayName={data.displayName}
            avatar={data.avatar}
            role={data.role}
            startFilling={data.startFillingStatus}
            startFillingDate={data.startFillingDate}
            filledAndSigned={data.filledAndSignedStatus}
            filledAndSignedDate={data.filledAndSignedDate}
            returnedByUser={data.returnedByUser}
            returnedDate={data.returnedByUserDate}
            comment={data.comment}
            isDone={statusDone}
            isInterrupted={statusInterrupted}
          />
        );
      })}
      {statusInterrupted ? (
        <Box displayProp="flex" alignItems="center" marginProp="15px 0 0">
          <ReactSVG
            src={StatusInterruptedSvgUrl}
            className={styles.statusInterruptedIcon}
          />
          <Text
            fontSize="14px"
            lineHeight="16px"
            fontWeight="bold"
            className={styles.statusInterruptedText}
          >
            {statusInterruptedText}
          </Text>
        </Box>
      ) : (
        <Box displayProp="flex" alignItems="center" marginProp="15px 0 0">
          <ReactSVG
            src={StatusDoneReactSvgUrl}
            className={classNames(styles.statusDoneIcon, {
              [styles.isDone]: statusDone,
            })}
          />
          <Text
            fontSize="14px"
            lineHeight="16px"
            fontWeight="bold"
            className={classNames(styles.statusDoneText, {
              [styles.isDone]: statusDone,
            })}
          >
            {statusDoneText}
          </Text>
        </Box>
      )}
    </div>
  );
};

export { FillingStatusLine };
