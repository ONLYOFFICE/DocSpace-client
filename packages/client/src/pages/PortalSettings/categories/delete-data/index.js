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

import React, { useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Submenu } from "@docspace/shared/components/submenu";
import { inject, observer } from "mobx-react";
import PortalDeactivationSection from "./portalDeactivation";
import PortalDeletionSection from "./portalDeletion";
import DeleteDataLoader from "./DeleteDataLoader";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "../../../../../package.json";
import { PORTAL } from "@docspace/shared/constants";

const DeleteData = (props) => {
  const { t, isNotPaidPeriod, tReady } = props;

  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const data = [
    {
      id: "deletion",
      name: t("DeletePortal", { portalName: PORTAL }),
      content: <PortalDeletionSection />,
    },
    {
      id: "deactivation",
      name: t("PortalDeactivation", { portalName: PORTAL }),
      content: <PortalDeactivationSection />,
    },
  ];

  useEffect(() => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    if (currentTab !== -1) setCurrentTab(currentTab);
    setIsLoading(true);
  }, []);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/delete-data/${e.id}`,
      ),
    );
  };

  if (!isLoading || !tReady) return <DeleteDataLoader />;
  return isNotPaidPeriod ? (
    <PortalDeletionSection />
  ) : (
    <Submenu
      data={data}
      startSelect={currentTab}
      onSelect={(e) => onSelect(e)}
    />
  );
};

export default inject(({ currentTariffStatusStore }) => {
  const { isNotPaidPeriod } = currentTariffStatusStore;

  return {
    isNotPaidPeriod,
  };
})(observer(withTranslation("Settings")(DeleteData)));
