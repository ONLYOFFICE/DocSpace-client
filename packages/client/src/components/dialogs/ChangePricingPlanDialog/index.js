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

import PropTypes from "prop-types";
import styled from "styled-components";
import { useTranslation, Trans } from "react-i18next";

import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

import { inject, observer } from "mobx-react";
import { getConvertedSize } from "@docspace/shared/utils/common";

const StyledBodyContent = styled.div`
  display: contents;

  .cannot-downgrade-plan {
    margin-bottom: 16px;
  }

  .save-or-change {
    margin-top: 16px;
  }
`;

const ChangePricingPlanDialog = ({
  visible,
  onClose,
  addedManagersCount,
  managersCount,
  allowedStorageSizeByQuota,
  usedTotalStorageSizeCount,
}) => {
  const { t, ready } = useTranslation(["DowngradePlanDialog", "Common"]);

  const onCloseModal = () => {
    onClose && onClose();
  };

  const allowedStorageSpace = getConvertedSize(t, allowedStorageSizeByQuota);
  const currentStorageSpace = getConvertedSize(t, usedTotalStorageSizeCount);

  const planUsersLimitations = (
    <Text as="span" fontSize="13px">
      <Trans t={t} i18nKey="PlanUsersLimit" ns="DowngradePlanDialog">
        You wish to downgrade the team to
        <strong>{{ usersCount: managersCount }}</strong>
        admins, and current number of such users in your
        {{ productName: t("Common:ProductName") }} is
        <strong>{{ currentUsersCount: addedManagersCount }}</strong>
      </Trans>
    </Text>
  );

  const storagePlanLimitations = (
    <Text as="span" fontSize="13px">
      <Trans t={t} i18nKey="PlanStorageLimit" ns="DowngradePlanDialog">
        New tariff's limitation is
        <strong>{{ storageValue: allowedStorageSpace }}</strong> of storage, and
        your current used storage is
        <strong>{{ currentStorageValue: currentStorageSpace }}</strong>.
      </Trans>
    </Text>
  );

  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseModal}
      autoMaxHeight
      isLarge
      isLoading={!ready}
    >
      <ModalDialog.Header>{t("ChangePricingPlan")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
          <Text fontSize="13px" isBold className="cannot-downgrade-plan">
            {t("CannotChangePlan")}
          </Text>
          {planUsersLimitations}
          <br />
          {storagePlanLimitations}

          <Text fontSize="13px" className="save-or-change">
            {t("SaveOrChange")}
          </Text>
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="ok-button"
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={onCloseModal}
          tabIndex={3}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ChangePricingPlanDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default inject(({ paymentStore, currentQuotaStore }) => {
  const { managersCount, allowedStorageSizeByQuota } = paymentStore;

  const { addedManagersCount, usedTotalStorageSizeCount } = currentQuotaStore;
  return {
    managersCount,
    addedManagersCount,
    allowedStorageSizeByQuota,
    usedTotalStorageSizeCount,
  };
})(observer(ChangePricingPlanDialog));
