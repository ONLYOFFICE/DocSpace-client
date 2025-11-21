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

import { Text } from "@docspace/shared/components/text";
import { Loader } from "@docspace/shared/components/loader";
import { ProgressBar } from "@docspace/shared/components/progress-bar";
import styled from "styled-components";

import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg";
import InterruptIcon from "PUBLIC_DIR/images/interrupt.icon.react.svg";
import { commonIconsStyles, injectDefaultTheme } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";
import { withTranslation, Trans } from "react-i18next";

const StyledCheckIcon = styled(CheckIcon).attrs(injectDefaultTheme)`
  ${commonIconsStyles}
  path {
    fill: ${globalColors.lightStatusPositive} !important;
  }
`;

const StyledProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;

  .description {
    line-height: 20px;
  }

  .user-name {
    font-weight: 600;
  }

  .progress-container {
    display: flex;
    gap: 16px;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .progress-section-text {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
  }

  .progress-status {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .in-progress {
    display: flex;
    gap: 4px;
  }

  .transfer-information {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status {
    font-size: 14px;
    line-height: 16px;
  }

  .status-icon {
    padding: 2px;
  }

  .status-pending {
    padding-inline-start: 24px;
    height: 20px;
  }

  .check-icon {
    width: 16px;
  }

  .user {
    display: inline;
    font-weight: 600;
  }

  .in-progress-loader {
    height: 20px;
  }

  .data-start {
    line-height: 20px;
  }
`;

const percentRoomReassignment = 70;
const percentFilesInRoomsReassignment = 90;
const percentAllReassignment = 100;

const Progress = ({
  fromUser,
  toUser,
  isReassignCurrentUser,
  percent,
  isAbortTransfer,
  noRooms,
  noRoomFilesToMove,
  t,
}) => {
  const inProgressNode = (
    <div className="in-progress">
      <Loader className="in-progress-loader" size="20px" type="track" />
      <Text className="status">{t("Common:InProgress")}</Text>
    </div>
  );

  const pendingNode = (
    <Text className="status status-pending">
      {t("PeopleTranslations:PendingTitle")}...
    </Text>
  );

  const allDataTransferredNode = (
    <div className="transfer-information">
      <StyledCheckIcon size="medium" className="status-icon" />
      <Text className="status">
        {t("DataReassignmentDialog:AllDataTransferred")}
      </Text>
    </div>
  );

  const interruptedNode = (
    <div className="transfer-information">
      <InterruptIcon className="status-icon" />
      <Text className="status">{t("DataReassignmentDialog:Interrupted")}</Text>
    </div>
  );

  const you = `${`(${t("Common:You")})`}`;

  const reassigningDataStart = isReassignCurrentUser ? (
    <Trans
      i18nKey="ReassigningDataToItself"
      ns="DataReassignmentDialog"
      t={t}
      fromUser={fromUser}
      toUser={toUser}
      you={you}
    >
      <div className="user"> {{ fromUser }}</div>
      <div className="user"> {{ toUser }}</div>
      <div className="user"> {{ you }}</div>
    </Trans>
  ) : (
    <Trans
      i18nKey="ReassigningDataToAnother"
      ns="DataReassignmentDialog"
      t={t}
      fromUser={fromUser}
      toUser={toUser}
      you={you}
    >
      <div className="user"> {{ fromUser }}</div>
      <div className="user"> {{ toUser }}</div>
    </Trans>
  );
  return (
    <StyledProgress>
      <div className="data-start"> {reassigningDataStart}</div>
      <div className="progress-container">
        <div className="progress-section">
          {!noRooms ? (
            <Text className="progress-section-text">{t("Common:Rooms")}</Text>
          ) : null}
          {noRoomFilesToMove ? null : (
            <Text className="progress-section-text">
              {t("Common:Documents")}
            </Text>
          )}
        </div>

        <div className="progress-status">
          {!noRooms
            ? percent < percentRoomReassignment
              ? isAbortTransfer && percent !== percentAllReassignment
                ? interruptedNode
                : inProgressNode
              : allDataTransferredNode
            : null}

          {noRoomFilesToMove
            ? null
            : isAbortTransfer && percent !== percentAllReassignment
              ? interruptedNode
              : percent < percentRoomReassignment
                ? pendingNode
                : percent < percentFilesInRoomsReassignment
                  ? inProgressNode
                  : allDataTransferredNode}
        </div>
      </div>

      <ProgressBar
        className="progress"
        percent={isAbortTransfer ? percentAllReassignment : percent}
      />

      <Text lineHeight="20px" className="description">
        {t("DataReassignmentDialog:ProcessComplete")}
      </Text>
    </StyledProgress>
  );
};

export default withTranslation([
  "Common",
  "DataReassignmentDialog",
  "PeopleTranslations",
])(Progress);
