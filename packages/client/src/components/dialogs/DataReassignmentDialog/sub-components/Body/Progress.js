import { Text } from "@docspace/shared/components/text";
import { Loader } from "@docspace/shared/components/loader";
import { ProgressBar } from "@docspace/shared/components/progress-bar";
import styled from "styled-components";

import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg";
import InterruptIcon from "PUBLIC_DIR/images/interrupt.icon.react.svg";
import { commonIconsStyles } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";
import { withTranslation, Trans } from "react-i18next";

const StyledCheckIcon = styled(CheckIcon)`
  ${commonIconsStyles}
  path {
    fill: rgba(53, 173, 23, 1) !important;
  }
`;

StyledCheckIcon.defaultProps = { theme: Base };

const StyledProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

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
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
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
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    line-height: 16px;
  }

  .status-icon {
    padding: 2px;
  }

  .status-pending {
    padding-left: 24px;
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
  t,
}) => {
  const inProgressNode = (
    <div className="in-progress">
      <Loader className="in-progress-loader" size="20px" type="track" />
      <Text className="status">{t("DataReassignmentDialog:InProgress")}</Text>
    </div>
  );

  const pendingNode = (
    <Text className="status status-pending" noSelect>
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

  const you = `${`(` + t("Common:You") + `)`}`;

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
          <Text className="progress-section-text" noSelect>
            {t("Common:Rooms")}
          </Text>
          <Text className="progress-section-text" noSelect>
            {t("Common:Documents")}
          </Text>
        </div>

        <div className="progress-status">
          {percent < percentRoomReassignment
            ? isAbortTransfer && percent !== percentAllReassignment
              ? interruptedNode
              : inProgressNode
            : allDataTransferredNode}

          {isAbortTransfer && percent !== percentAllReassignment
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

      <Text lineHeight="20px" className="description" noSelect>
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
