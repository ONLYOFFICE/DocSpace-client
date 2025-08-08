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
    margin-bottom: 4px;
    color: ${(props) => props.theme.client.settings.security.tfa.textColor};
  }

  .backup-codes-code {
    font-weight: 600;
    line-height: 20px;
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
            <Text className="backup-codes-description-one" lineHeight="20px">
              {t("BackupCodesDescription")}
            </Text>
            <Text className="backup-codes-description-two" lineHeight="20px">
              {t("BackupCodesSecondDescription")}
            </Text>

            <Text
              className="backup-codes-counter"
              fontWeight={600}
              lineHeight="20px"
            >
              {backupCodesCount} {t("CodesCounter")}
            </Text>

            <Text
              className="backup-codes-codes"
              isBold
              dataTestId="backup_codes_container"
            >
              {backupCodes.length > 0
                ? backupCodes.map((item, index) => {
                    if (!item.isUsed) {
                      return (
                        <strong
                          key={item.code}
                          className="backup-codes-code"
                          data-testid={`backup_code_${index}`}
                          dir="auto"
                        >
                          {item.code} <br />
                        </strong>
                      );
                    }
                    return null;
                  })
                : null}
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
              testId="request_new_backup_codes_button"
            />
            <Button
              key="PrintBtn"
              label={t("Common:CancelButton")}
              size="normal"
              onClick={onClose}
              testId="backup_codes_cancel_button"
            />
            {isDesktop() ? (
              <div className="backup-codes-print-link-wrapper">
                <Link
                  type="action"
                  fontSize="13px"
                  fontWeight={600}
                  isHovered
                  onClick={this.printPage}
                  dataTestId="print_backup_codes_link"
                >
                  {t("PrintButton")}
                </Link>
              </div>
            ) : null}
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
