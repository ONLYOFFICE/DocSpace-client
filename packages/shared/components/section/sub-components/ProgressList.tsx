import React from "react";
import { observer } from "mobx-react";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import DuplicateIconUrl from "PUBLIC_DIR/images/duplicate.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import OtherOperationsIconUrl from "PUBLIC_DIR/images/icons/16/other-operations.react.svg?url";
import ListIconUrl from "PUBLIC_DIR/images/icons/16/mark-as-read.react.svg?url";
import DeletePermanentlyIconUrl from "PUBLIC_DIR/images/icons/16/delete-permanently.react.svg?url";
import ExportIndexIconUrl from "PUBLIC_DIR/images/icons/16/export-index.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";
import UploadIconUrl from "PUBLIC_DIR/images/icons/16/upload.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

import { ProgressBarMobile } from "../../progress-bar-mobile";
import { Operation } from "../Section.types";
import { OPERATIONS_NAME } from "../../../constants";

interface ProgressListProps {
  secondaryOperations: Operation[];
  primaryOperations: Operation[];
  clearSecondaryProgressData: (
    operationId: string | null,
    operation: string,
  ) => void;
  clearPrimaryProgressData: (
    operationId: string | null,
    operation: string,
  ) => void;
  onCancel?: () => void;
  onOpenPanel?: () => void;
}

const getIcon = (icon: string): string => {
  switch (icon) {
    case OPERATIONS_NAME.download:
      return DownloadReactSvgUrl;
    case OPERATIONS_NAME.convert:
      return RefreshReactSvgUrl;
    case OPERATIONS_NAME.copy:
      return CopyReactSvgUrl;
    case OPERATIONS_NAME.duplicate:
      return DuplicateIconUrl;
    case OPERATIONS_NAME.markAsRead:
      return ListIconUrl;
    case OPERATIONS_NAME.deletePermanently:
      return DeletePermanentlyIconUrl;
    case OPERATIONS_NAME.exportIndex:
      return ExportIndexIconUrl;
    case OPERATIONS_NAME.move:
      return MoveReactSvgUrl;
    case OPERATIONS_NAME.upload:
      return UploadIconUrl;
    case OPERATIONS_NAME.trash:
      return TrashReactSvgUrl;
    default:
      return OtherOperationsIconUrl;
  }
};

const ProgressList = observer(
  ({
    secondaryOperations,
    primaryOperations,
    clearSecondaryProgressData,
    clearPrimaryProgressData,
    onCancel,
    onOpenPanel,
  }: ProgressListProps) => {
    return (
      <div className="progress-container">
        {secondaryOperations.map((item) => (
          <div
            key={`${item.operation}-${item.items?.[0]?.operationId ?? ""}-${item.completed}`}
            className="progress-list"
          >
            <ProgressBarMobile
              completed={item.completed}
              label={item.label}
              alert={item.alert}
              open
              iconUrl={getIcon(item.operation)}
              onClickAction={() => {}}
              withoutProgress
              onClearProgress={clearSecondaryProgressData}
              operation={item.operation}
            />
          </div>
        ))}
        {primaryOperations.map((item) => (
          <div
            key={`${item.operation}`}
            className={`progress-list ${onOpenPanel ? "withHover" : ""}`}
          >
            <ProgressBarMobile
              completed={item.completed}
              label={item.label}
              alert={item.alert}
              percent={item.percent}
              open
              iconUrl={getIcon(item.operation)}
              onClickAction={() => {}}
              onClearProgress={clearPrimaryProgressData}
              operation={item.operation}
              onCancel={onCancel}
              onOpenPanel={onOpenPanel}
            />
          </div>
        ))}
      </div>
    );
  },
);

export default ProgressList;
