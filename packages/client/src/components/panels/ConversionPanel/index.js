/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ClearReactSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";
import ButtonCancelReactSvgUrl from "PUBLIC_DIR/images/button.cancel.react.svg?url";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
  DialogAsideSkeleton
} from "@docspace/ui-kit/components/modal-dialog";

import styles from "../UploadPanel/UploadPanel.module.scss";
import FileList from "./FileList";
import withLoader from "../../../HOCs/withLoader";

const ConversionPanelComponent = ({
  t,
  conversionVisible,
  setConversionPanelVisible,
  converted,

  cancelConversion,
  clearConversionData,
  setNeedErrorChecking,
  clearPrimaryProgressData,
}) => {
  const onClose = () => {
    setConversionPanelVisible(!conversionVisible);
    setNeedErrorChecking(false, OPERATIONS_NAME.convert);
  };

  useEffect(() => {
    const onKeyPress = (event) => {
      if (event.key === "Esc" || event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keyup", onKeyPress);
    setNeedErrorChecking(true, OPERATIONS_NAME.convert);

    return () => {
      document.removeEventListener("keyup", onKeyPress);
    };
  }, []);

  const clearConversionPanel = () => {
    clearConversionData();
    clearPrimaryProgressData(OPERATIONS_NAME.convert);
    onClose();
  };

  const onCancelConversion = () => {
    cancelConversion(true);
  };

  const title = t("Files:Conversion");
  const url = converted ? ClearReactSvgUrl : ButtonCancelReactSvgUrl;
  const clickEvent = converted ? clearConversionPanel : onCancelConversion;

  return (
    <ModalDialog
      visible={conversionVisible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      headerIcons={[{ key: "conversion-panel", url, onClick: clickEvent }]}
    >
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.uploadBody}>
          <FileList />
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

const ConversionPanel = withTranslation(["UploadPanel", "Files"])(
  withLoader(ConversionPanelComponent)(<DialogAsideSkeleton isPanel />),
);

export default inject(({ uploadDataStore }) => {
  const {
    conversionVisible,
    setConversionPanelVisible,
    converted,
    isConverting,
    cancelConversion,
    clearConversionData,
    primaryProgressDataStore,
  } = uploadDataStore;
  const { clearPrimaryProgressData, setNeedErrorChecking } =
    primaryProgressDataStore;
  return {
    conversionVisible,
    setConversionPanelVisible,
    converted,
    isConverting,
    cancelConversion,
    clearConversionData,
    setNeedErrorChecking,
    clearPrimaryProgressData,
  };
})(observer(ConversionPanel));
