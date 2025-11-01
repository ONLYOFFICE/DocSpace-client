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

import { toastr } from "@docspace/shared/components/toast";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { Link } from "@docspace/shared/components/link";

import { makeAutoObservable } from "mobx";
import { Trans } from "react-i18next";

import { createFolderNavigation } from "SRC_DIR/helpers/createFolderNavigation";
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

import i18n from "../i18n";

class SecondaryProgressDataStore {
  percent = 0;

  itemsSelectionLength = 0;

  itemsSelectionTitle = null;

  isDownload = false;

  secondaryOperationsArray = [];

  constructor(treeFoldersStore, mediaViewerDataStore) {
    this.treeFoldersStore = treeFoldersStore;
    this.mediaViewerDataStore = mediaViewerDataStore;
    makeAutoObservable(this);
  }

  get secondaryActiveOperations() {
    return this.secondaryOperationsArray;
  }

  get isSecondaryProgressVisbile() {
    return this.secondaryOperationsArray.length > 0;
  }

  showToast = async (currentOperation, operation, isSuccess = true) => {
    if (
      operation !== OPERATIONS_NAME.copy &&
      operation !== OPERATIONS_NAME.duplicate &&
      operation !== OPERATIONS_NAME.move &&
      operation !== OPERATIONS_NAME.trash
    )
      return;

    if (!currentOperation.title && !currentOperation.itemsCount) return;

    const { error, title, itemsCount, destFolderInfo, isFolder } =
      currentOperation;
    const t = (key, options) =>
      i18n.t(key, { ...options, ns: ["Files", "Common"] });

    let toastTranslation = "";

    const { url, state } = await createFolderNavigation(destFolderInfo);

    const onClickLocation = () => {
      toastr.clear();

      const { visible, setMediaViewerData } = this.mediaViewerDataStore;

      if (visible) {
        setMediaViewerData({ visible: false, id: null });
      }

      if (window.ClientConfig?.isFrame) return;

      window.DocSpace.navigate(url, { state });
    };

    const getError = () => {
      const errorMessage = error;

      if (typeof errorMessage === "string") return errorMessage;

      if (errorMessage.message) return errorMessage?.message;

      if (errorMessage.error) return errorMessage.error;
    };

    const commonComponents = {
      1: (
        <Link
          tag="a"
          onClick={onClickLocation}
          target="_blank"
          textDecoration="underline"
          color="accent"
        />
      ),
      2: <span style={{ fontWeight: "600" }} />,
    };

    if (currentOperation.itemsCount === 1) {
      const commonProps = {
        title,
        folderName: state.title,
      };

      if (
        operation === OPERATIONS_NAME.move ||
        operation === OPERATIONS_NAME.trash
      ) {
        toastTranslation = isSuccess ? (
          isFolder ? (
            <Trans
              t={t}
              i18nKey="MoveFolderItem"
              components={commonComponents}
              values={commonProps}
            />
          ) : (
            <Trans
              t={t}
              i18nKey="MoveItem"
              components={commonComponents}
              values={commonProps}
            />
          )
        ) : (
          <Trans
            t={t}
            i18nKey="ErrorMoveItem"
            components={commonComponents}
            values={commonProps}
          />
        );
      }

      if (operation === OPERATIONS_NAME.copy) {
        toastTranslation = isSuccess ? (
          isFolder ? (
            <Trans
              t={t}
              i18nKey="CopyFolderItem"
              components={commonComponents}
              values={commonProps}
            />
          ) : (
            <Trans
              t={t}
              ns="Common"
              i18nKey="CopyItem"
              components={commonComponents}
              values={commonProps}
            />
          )
        ) : (
          <Trans
            t={t}
            i18nKey="ErrorCopyItem"
            components={commonComponents}
            values={commonProps}
          />
        );
      }

      if (operation === OPERATIONS_NAME.duplicate) {
        toastTranslation = isSuccess ? (
          isFolder ? (
            <Trans
              t={t}
              i18nKey="DuplicateFolderItem"
              components={commonComponents}
              values={commonProps}
            />
          ) : (
            <Trans
              t={t}
              i18nKey="DuplicateItem"
              components={commonComponents}
              values={commonProps}
            />
          )
        ) : (
          <Trans
            t={t}
            i18nKey="ErrorDuplicateItem"
            components={commonComponents}
            values={commonProps}
          />
        );
      }
    }

    if (itemsCount > 1) {
      const commonProps = {
        qty: itemsCount,
        folderName: state.title,
      };

      if (
        operation === OPERATIONS_NAME.move ||
        operation === OPERATIONS_NAME.trash
      ) {
        toastTranslation = isSuccess ? (
          <Trans
            t={t}
            i18nKey="MoveItems"
            components={commonComponents}
            values={commonProps}
          />
        ) : (
          <Trans
            t={t}
            i18nKey="ErrorMoveItems"
            components={commonComponents}
            values={commonProps}
          />
        );
      }

      if (operation === OPERATIONS_NAME.copy) {
        toastTranslation = isSuccess ? (
          <Trans
            t={t}
            i18nKey="CopyItems"
            components={commonComponents}
            values={commonProps}
          />
        ) : (
          <Trans t={t} i18nKey="ErrorCopyItems">
            {commonProps}
            {commonComponents}
          </Trans>
        );
      }
    }

    if (error) {
      const message = getError();

      toastTranslation = (
        <>
          {toastTranslation}
          <br />
          {message}
        </>
      );
    }

    isSuccess
      ? toastr.success(toastTranslation)
      : toastr.error(toastTranslation, null, 0, true);
  };

  setSecondaryProgressBarData = (secondaryProgressData) => {
    const { operation, ...progressInfo } = secondaryProgressData;

    if (!operation) return;

    const operationIndex = this.secondaryOperationsArray.findIndex(
      (object) => object.operation === operation,
    );

    if (operationIndex !== -1) {
      const operationObject = this.secondaryOperationsArray[operationIndex];
      const itemIndex = operationObject.items.findIndex(
        (item) => item.operationId === progressInfo.operationId,
      );

      let items = [...operationObject.items];

      if (itemIndex !== -1) {
        items[itemIndex] = {
          ...operationObject.items[itemIndex],
          ...progressInfo,
        };
      } else {
        items = [...items, progressInfo];
      }

      const updatedItems = items;

      const isCompleted = updatedItems.every((item) => item.completed);

      const cuttentOperation = updatedItems[itemIndex];

      if (progressInfo.completed && !progressInfo.alert) {
        this.showToast(cuttentOperation, operation);
      }
      if (progressInfo.completed && progressInfo.alert) {
        this.showToast(cuttentOperation, operation, false);
      }
      this.secondaryOperationsArray[operationIndex] = {
        ...operationObject,
        alert: progressInfo.alert,
        items: updatedItems,
        completed: isCompleted,
        percent: progressInfo.percent,
      };
    } else {
      const progress = {
        operation,
        alert: progressInfo.alert,
        items: [progressInfo],
        label: getOperationsProgressTitle(operation),
        completed: progressInfo.completed,
        percent: progressInfo.percent,
      };

      this.secondaryOperationsArray = [
        ...this.secondaryOperationsArray,
        progress,
      ];
    }
  };

  setItemsSelectionTitle = (itemsSelectionTitle) => {
    this.itemsSelectionTitle = itemsSelectionTitle;
  };

  setItemsSelectionLength = (itemsSelectionLength) => {
    this.itemsSelectionLength = itemsSelectionLength;
  };

  clearSecondaryProgressData = (operationId, operation) => {
    if (!operationId && !operation) {
      const incompleteOperations = this.secondaryOperationsArray.filter(
        (item) => !item.completed,
      );

      this.secondaryOperationsArray.splice(
        0,
        this.secondaryOperationsArray.length,
        ...incompleteOperations,
      );

      console.log("clearSecondaryProgressData", this.secondaryOperationsArray);
      return;
    }

    const operationIndex = this.secondaryOperationsArray.findIndex(
      (obj) => obj.operation === operation,
    );

    if (operationIndex === -1) return;

    const operationObject = this.secondaryOperationsArray[operationIndex];

    if (operationId) {
      const itemIndex = operationObject.items.findIndex(
        (item) => item.operationId === operationId,
      );
      if (itemIndex === -1) return;
      operationObject.items.splice(itemIndex, 1);
      if (operationObject.items.length === 0) {
        this.secondaryOperationsArray.splice(operationIndex, 1);
      }
    } else {
      this.secondaryOperationsArray.splice(operationIndex, 1);
    }
    console.log("clearSecondaryProgressData", this.secondaryOperationsArray);
  };

  findOperationById = (itemId) => {
    const operation = this.secondaryOperationsArray.find((process) => {
      return process.items.some(
        (item) => item.operationIds && item.operationIds.includes(itemId),
      );
    });

    if (!operation)
      return {
        operation: "",
        label: "",
      };

    const operationItem = operation.items.find(
      (item) => item.operationIds && item.operationIds.includes(itemId),
    );

    return {
      operation: operation.operation,
      item: operationItem,
      label: operation.label,
    };
  };

  get secondaryOperationsAlert() {
    return this.secondaryOperationsArray.some((op) => op.alert);
  }

  get secondaryOperationsCompleted() {
    return (
      this.secondaryOperationsArray.length > 0 &&
      this.secondaryOperationsArray.every((op) => op.completed)
    );
  }
}

export default SecondaryProgressDataStore;
