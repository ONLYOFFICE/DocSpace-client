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

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import DuplicateIconUrl from "PUBLIC_DIR/images/icons/16/duplicate.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import OtherOperationsIconUrl from "PUBLIC_DIR/images/icons/16/other-operations.react.svg?url";
import ListIconUrl from "PUBLIC_DIR/images/icons/16/mark-as-read.react.svg?url";
import DeletePermanentlyIconUrl from "PUBLIC_DIR/images/icons/16/delete-permanently.react.svg?url";
import ExportIndexIconUrl from "PUBLIC_DIR/images/icons/16/export-index.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/icons/16/move.react.svg?url";
import UploadIconUrl from "PUBLIC_DIR/images/icons/16/upload.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";

import { ProgressBar } from "./ProgressBar";
import { Operation } from "./OperationsProgressButton.types";
import { OPERATIONS_NAME } from "../../constants";

interface ProgressListProps {
  onOpenPanel: () => void;
  operations: Operation[];
  panelOperations?: Operation[];
  clearOperationsData?: (operationId: string | null, operation: string) => void;
  clearPanelOperationsData?: (
    operationId: string | null,
    operation: string,
  ) => void;
  onCancel?: () => void;
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
    case OPERATIONS_NAME.deleteVersionFile:
      return TrashReactSvgUrl;
    default:
      return OtherOperationsIconUrl;
  }
};

const ProgressList = ({
  operations,
  panelOperations,
  clearOperationsData,
  clearPanelOperationsData,
  onCancel,
  onOpenPanel,
}: ProgressListProps) => {
  const onOpenPanelOperation = (item: Operation) => {
    if (!item.showPanel) return;

    item.showPanel(true);
    onOpenPanel();
  };

  return (
    <div className="progress-container">
      {operations.map((item) => (
        <div
          key={`${item.operation}-${item.items?.[0]?.operationId ?? ""}-${item.completed}`}
          className="progress-list"
        >
          <ProgressBar
            completed={item.completed}
            label={item.label}
            alert={item.alert}
            open
            iconUrl={getIcon(item.operation)}
            onClickAction={() => {}}
            withoutProgress
            onClearProgress={clearOperationsData}
            operation={item.operation}
          />
        </div>
      ))}
      {panelOperations?.map((item) => (
        <div
          key={`${item.operation}`}
          className={`progress-list ${item.showPanel ? "withHover" : ""}`}
        >
          <ProgressBar
            completed={item.completed}
            label={item.label}
            alert={item.alert}
            percent={item.percent}
            open
            iconUrl={getIcon(item.operation)}
            onClickAction={() => {}}
            onClearProgress={clearPanelOperationsData}
            operation={item.operation}
            onCancel={onCancel}
            onOpenPanel={() => onOpenPanelOperation(item)}
            withoutStatus={item.withoutStatus}
            withoutProgress={item.withoutProgress}
          />
        </div>
      ))}
    </div>
  );
};

export default ProgressList;
