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

import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { getTfaNewBackupCodes } from "@docspace/shared/api/settings";
import { withTranslation } from "react-i18next";
import { isDesktop } from "@docspace/shared/utils";

const StyledBodyContent = styled.div`
  .backup-codes-counter {
    margin-top: 16px;
    color: ${(props) => props.theme.client.settings.security.tfa.textColor};
  }
`;

const StyledFooterContent = styled.div`
  display: contents;

  .backup-codes-print-link-wrapper {
    display: flex;
    align-items: center;

    padding-inline-start: 8px;
  }
`;

class BackupCodesDialogComponent extends React.Component {
  getNewBackupCodes = async () => {
    const { setBackupCodes } = this.props;
    try {
      const newCodes = await getTfaNewBackupCodes();
      setBackupCodes(newCodes);
    } catch (e) {
      toastr.error(e);
    }
  };

  printPage = () => {
    const { t } = this.props;
    const printContent = document.getElementById("backup-codes-print-content");
    const printWindow = window.open(
      "about:blank",
      "",
      "toolbar=0,scrollbars=1,status=0",
    );
    printWindow.document.write(`<h1>${t("BackupCodesTitle")}</h1>`);
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  render() {
    // console.log("Render BackupCodesDialog");
    const { t, tReady, visible, onClose, backupCodes, backupCodesCount } =
      this.props;

    return (
      <ModalDialog
        isLoading={!tReady}
        visible={visible}
        onClose={onClose}
        autoMaxHeight
        isLarge
      >
        <ModalDialog.Header>{t("BackupCodesTitle")}</ModalDialog.Header>
        <ModalDialog.Body>
          <StyledBodyContent id="backup-codes-print-content">
            <Text className="backup-codes-description-one">
              {t("BackupCodesDescription")}
            </Text>
            <Text className="backup-codes-description-two">
              {t("BackupCodesSecondDescription")}
            </Text>

            <Text className="backup-codes-counter" fontWeight={600}>
              {backupCodesCount} {t("CodesCounter")}
            </Text>

            <Text className="backup-codes-codes" isBold>
              {backupCodes.length > 0 &&
                backupCodes.forEach((item) => {
                  if (!item.isUsed) {
                    return (
                      <strong key={item.code} dir="auto">
                        {item.code} <br />
                      </strong>
                    );
                  }
                })}
            </Text>
          </StyledBodyContent>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <StyledFooterContent>
            <Button
              key="RequestNewBtn"
              label={t("RequestNewButton")}
              size="normal"
              primary
              onClick={this.getNewBackupCodes}
            />
            <Button
              key="PrintBtn"
              label={t("Common:CancelButton")}
              size="normal"
              onClick={onClose}
            />
            {isDesktop() && (
              <div className="backup-codes-print-link-wrapper">
                <Link
                  type="action"
                  fontSize="13px"
                  fontWeight={600}
                  isHovered
                  onClick={this.printPage}
                >
                  {t("PrintButton")}
                </Link>
              </div>
            )}
          </StyledFooterContent>
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }
}

const BackupCodesDialog = withTranslation(
  "BackupCodesDialog",
  "Common",
)(BackupCodesDialogComponent);

BackupCodesDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  backupCodes: PropTypes.array.isRequired,
  backupCodesCount: PropTypes.number.isRequired,
  setBackupCodes: PropTypes.func.isRequired,
};

export default BackupCodesDialog;
