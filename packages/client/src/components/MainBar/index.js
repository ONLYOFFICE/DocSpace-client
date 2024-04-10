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
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { useLocation } from "react-router-dom";

import { mobile } from "@docspace/shared/utils";
import Bar from "./Bar";

const StyledContainer = styled.div`
  width: 100%;
  max-width: 100%;

  @media ${mobile} {
    width: calc(100% + 8px);
    max-width: calc(100% + 8px);
  }

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: -16px;`
      : `margin-right: -16px;`}

  #bar-banner {
    margin-bottom: -3px;
  }

  #bar-frame {
    min-width: 100%;
    max-width: 100%;
  }
`;

const MainBar = ({
  firstLoad,
  checkedMaintenance,
  snackbarExist,
  setMaintenanceExist,
  isNotPaidPeriod,
  isFrame,
}) => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    return () => setMaintenanceExist && setMaintenanceExist(false);
  }, []);

  const isVisibleBar =
    !isFrame &&
    !isNotPaidPeriod &&
    !pathname.includes("error") &&
    !pathname.includes("confirm") &&
    !pathname.includes("preparation-portal");

  return (
    <StyledContainer id={"main-bar"} className={"main-bar"}>
      {isVisibleBar && checkedMaintenance && !snackbarExist && (
        <Bar firstLoad={firstLoad} setMaintenanceExist={setMaintenanceExist} />
      )}
    </StyledContainer>
  );
};

export default inject(
  ({
    settingsStore,
    clientLoadingStore,
    filesStore,
    currentTariffStatusStore,
  }) => {
    const { checkedMaintenance, setMaintenanceExist, snackbarExist, isFrame } =
      settingsStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { firstLoad } = clientLoadingStore;
    const { isInit } = filesStore;

    return {
      firstLoad: firstLoad && isInit,
      checkedMaintenance,
      snackbarExist,
      setMaintenanceExist,
      isNotPaidPeriod,
      isFrame,
    };
  },
)(observer(MainBar));
