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

import React, { useEffect } from "react";

import { inject, observer } from "mobx-react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { regDesktop } from "@docspace/shared/utils/desktop";
import PaymentsLoader from "@docspace/shared/skeletons/payments";
import { setDocumentTitle } from "@docspace/client/src/helpers/filesUtils";

import PaymentContainer from "./PaymentContainer";

const SaaSPage = ({
  language,
  isLoadedTariffStatus,
  isLoadedCurrentQuota,
  isInitPaymentPage,
  init,
  isUpdatingTariff,
  isUpdatingBasicSettings,
  resetTariffContainerToBasic,
  user,
  encryptionKeys,
  isEncryption,
  setEncryptionKeys,
  isDesktop,
  isDesktopClientInit,
  setIsDesktopClientInit,
}) => {
  const { t, ready } = useTranslation(["Payments", "Common", "Settings"]);

  useEffect(() => {
    moment.locale(language);

    if (isDesktop && !isDesktopClientInit) {
      setIsDesktopClientInit(true);

      regDesktop(
        user,
        isEncryption,
        encryptionKeys,
        setEncryptionKeys,
        false,
        null,
        t,
      );
    }
    return () => resetTariffContainerToBasic();
  }, []);

  useEffect(() => {
    setDocumentTitle(t("Common:PaymentsTitle"));
  }, [ready]);

  useEffect(() => {
    if (!isLoadedTariffStatus || !isLoadedCurrentQuota || !ready) return;

    init(t);
  }, [isLoadedTariffStatus, isLoadedCurrentQuota, ready]);

  return !isInitPaymentPage ||
    !ready ||
    isUpdatingTariff ||
    isUpdatingBasicSettings ? (
    <PaymentsLoader />
  ) : (
    <PaymentContainer t={t} />
  );
};

export default inject(
  ({
    authStore,
    settingsStore,
    paymentStore,
    userStore,
    currentQuotaStore,
    currentTariffStatusStore,
  }) => {
    const {
      language,

      isUpdatingTariff,
    } = authStore;
    const { user } = userStore;
    const { isLoaded: isLoadedCurrentQuota } = currentQuotaStore;
    const { isLoaded: isLoadedTariffStatus } = currentTariffStatusStore;
    const {
      isInitPaymentPage,
      init,
      isUpdatingBasicSettings,
      resetTariffContainerToBasic,
    } = paymentStore;
    const {
      isEncryptionSupport,
      setEncryptionKeys,
      encryptionKeys,
      isDesktopClient,
      isDesktopClientInit,
      setIsDesktopClientInit,
    } = settingsStore;
    return {
      isDesktopClientInit,
      setIsDesktopClientInit,
      isDesktop: isDesktopClient,
      user,
      encryptionKeys,
      isEncryption: isEncryptionSupport,
      setEncryptionKeys,
      resetTariffContainerToBasic,
      isUpdatingTariff,
      init,
      isInitPaymentPage,
      language,
      isLoadedTariffStatus,
      isLoadedCurrentQuota,
      isUpdatingBasicSettings,
    };
  },
)(observer(SaaSPage));
