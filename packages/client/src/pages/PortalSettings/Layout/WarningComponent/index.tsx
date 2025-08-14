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
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import WarningComponent from "@docspace/shared/components/navigation/sub-components/WarningComponent";
import { Link } from "@docspace/shared/components/link";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

type InjectedProps = {
  isCardLinkedToPortal?: boolean;
  isPayer?: boolean;
  walletCustomerEmail?: string;
};

const Warning = ({
  isCardLinkedToPortal,
  isPayer,
  walletCustomerEmail,
}: InjectedProps) => {
  const { t } = useTranslation(["Services", "Common"]);
  const { pathname } = useLocation();

  const onClickServiceUrl = () => {
    const servicePageUrl = combineUrl("/portal-settings", "/services");

    window.DocSpace.navigate(servicePageUrl);
  };

  const isBackupRoute =
    typeof pathname === "string" && pathname.includes("portal-settings/backup");

  if (!isBackupRoute) return null;

  const warningText = () => {
    if (isCardLinkedToPortal) {
      if (isPayer) {
        return (
          <Trans
            t={t}
            i18nKey="ConnectService"
            ns="Services"
            components={{
              1: <Link tag="a" onClick={onClickServiceUrl} color="accent" />,
            }}
          />
        );
      }

      return (
        <Trans
          t={t}
          i18nKey="ContactToPayer"
          ns="Services"
          values={{ email: walletCustomerEmail }}
          components={{
            1: (
              <Link
                tag="a"
                color="accent"
                href={`mailto:${walletCustomerEmail}`}
              />
            ),
          }}
        />
      );
    }

    return t("FreeBackups", { value: "1", maxValue: "10" });
  };

  return <WarningComponent title={warningText()} />;
};

export default inject(({ paymentStore, currentTariffStatusStore }: TStore) => {
  const { isCardLinkedToPortal, isPayer } = paymentStore;
  const { walletCustomerEmail } = currentTariffStatusStore;

  return {
    isCardLinkedToPortal,
    isPayer,
    walletCustomerEmail,
  };
})(observer(Warning));
