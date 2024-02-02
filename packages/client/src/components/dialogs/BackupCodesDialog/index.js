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
import ModalDialogContainer from "../ModalDialogContainer";

import { DeviceType } from "@docspace/shared/enums";
import { isDesktop } from "@docspace/shared/utils";

const StyledModal = styled(ModalDialogContainer)`
  .backup-codes-counter {
    margin-top: 16px;
  }

  .backup-codes-print-link-wrapper {
    display: flex;
    align-items: center;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 8px;`
        : `padding-left: 8px;`}
  }
`;

class BackupCodesDialogComponent extends React.Component {
  constructor(props) {
    super(props);
  }

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
      "toolbar=0,scrollbars=1,status=0"
    );
    printWindow.document.write(`<h1>${t("BackupCodesTitle")}</h1>`);
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  render() {
    //console.log("Render BackupCodesDialog");
    const { t, tReady, visible, onClose, backupCodes, backupCodesCount } =
      this.props;

    return (
      <StyledModal
        isLoading={!tReady}
        visible={visible}
        onClose={onClose}
        autoMaxHeight
        isLarge
      >
        <ModalDialog.Header>{t("BackupCodesTitle")}</ModalDialog.Header>
        <ModalDialog.Body>
          <div id="backup-codes-print-content">
            <Text className="backup-codes-description-one">
              {t("BackupCodesDescription")}
            </Text>
            <Text className="backup-codes-description-two">
              {t("BackupCodesSecondDescription")}
            </Text>

            <Text
              className="backup-codes-counter"
              fontWeight={600}
              color="#A3A9AE"
            >
              {backupCodesCount} {t("CodesCounter")}
            </Text>

            <Text className="backup-codes-codes" isBold={true}>
              {backupCodes.length > 0 &&
                backupCodes.map((item) => {
                  if (!item.isUsed) {
                    return (
                      <strong key={item.code} dir="auto">
                        {item.code} <br />
                      </strong>
                    );
                  }
                })}
            </Text>
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
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
            onClick={this.props.onClose}
          />
          {isDesktop() && (
            <div className="backup-codes-print-link-wrapper">
              <Link
                type="action"
                fontSize="13px"
                fontWeight={600}
                isHovered={true}
                onClick={this.printPage}
              >
                {t("PrintButton")}
              </Link>
            </div>
          )}
        </ModalDialog.Footer>
      </StyledModal>
    );
  }
}

const BackupCodesDialog = withTranslation(
  "BackupCodesDialog",
  "Common"
)(BackupCodesDialogComponent);

BackupCodesDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  backupCodes: PropTypes.array.isRequired,
  backupCodesCount: PropTypes.number.isRequired,
  setBackupCodes: PropTypes.func.isRequired,
};

export default BackupCodesDialog;
