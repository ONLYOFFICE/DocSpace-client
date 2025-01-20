import React from "react";
import { observer } from "mobx-react";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import DuplicateIconUrl from "PUBLIC_DIR/images/duplicate.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";

import { ProgressBarMobile } from "../../progress-bar-mobile";
import { Operation } from "../Section.types";

interface ProgressListProps {
  operations: Operation[];
  clearSecondaryProgressData: (
    operationId: string | null,
    operation: string,
  ) => void;
}

const getIcon = (icon: string): string => {
  switch (icon) {
    case "download":
      return DownloadReactSvgUrl;
    case "convert":
      return RefreshReactSvgUrl;
    case "copy":
    case "duplicate":
      return DuplicateIconUrl;
    default:
      return DuplicateIconUrl;
  }
};

const ProgressList = observer(
  ({ operations, clearSecondaryProgressData }: ProgressListProps) => {
    if (!operations?.length) return null;

    return (
      <div className="progress-container">
        {operations.map((item) => (
          <div
            key={`${item.operation}-${item.items[0]?.operationId}-${item.completed}`}
            className="progress-list"
          >
            <ProgressBarMobile
              completed={item.completed}
              label={item.label}
              percent={item.items[0]?.percent}
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
      </div>
    );
  },
);

export default ProgressList;
