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

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { useTranslation } from "react-i18next";

const RoundedButton = styled(Button)`
  box-sizing: border-box;
  font-size: 13px;
  font-weight: 400;
  padding: 13.5px 15px;

  border-radius: 16px;
  margin-inline-end: 7px;

  line-height: 20px;
`;

const Selectors = styled.div`
  position: relative;
  margin-top: 8px;
  margin-bottom: 16px;
`;

const StatusBadgeSelector = ({
  label,
  statusCode,
  isStatusSelected,
  handleStatusClick,
  id,
}) => {
  const handleOnClick = () => handleStatusClick(statusCode);
  return (
    <RoundedButton
      id={id}
      testId={`status_badge_${id}_button`}
      label={label}
      onClick={handleOnClick}
      primary={isStatusSelected(statusCode)}
      size="extraSmall"
    />
  );
};

const StatusPicker = ({ filters, setFilters }) => {
  const { t } = useTranslation(["Webhooks", "People"]);

  const StatusCodes = ["Not sent", "2XX", "3XX", "4XX", "5XX"];

  const isStatusSelected = (statusCode) => {
    return filters.status.includes(statusCode);
  };
  const handleStatusClick = (statusCode) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: prevFilters.status.includes(statusCode)
        ? prevFilters.status.filter((statusItem) => statusItem !== statusCode)
        : [...prevFilters.status, statusCode],
    }));
  };

  const StatusBadgeElements = StatusCodes.map((code) =>
    code === "Not sent" ? (
      <StatusBadgeSelector
        id="not-sent"
        label={t("NotSent")}
        statusCode={code}
        isStatusSelected={isStatusSelected}
        handleStatusClick={handleStatusClick}
        key={code}
      />
    ) : (
      <StatusBadgeSelector
        id={code}
        label={code}
        statusCode={code}
        isStatusSelected={isStatusSelected}
        handleStatusClick={handleStatusClick}
        key={code}
      />
    ),
  );

  return (
    <>
      <Text fontWeight={600} fontSize="15px">
        {t("People:UserStatus")}
      </Text>
      <Selectors>{StatusBadgeElements}</Selectors>
    </>
  );
};

export default StatusPicker;
