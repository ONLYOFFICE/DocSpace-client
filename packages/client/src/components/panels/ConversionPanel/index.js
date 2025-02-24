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

import ClearReactSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";
import ButtonCancelReactSvgUrl from "PUBLIC_DIR/images/button.cancel.react.svg?url";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { DialogAsideSkeleton } from "@docspace/shared/skeletons/dialog";

import { StyledUploadBody } from "../StyledPanels";
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

  const title = t("Files:Convert");
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
        <StyledUploadBody>
          <FileList />
        </StyledUploadBody>
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
