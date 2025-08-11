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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import EmptyFilterImg from "PUBLIC_DIR/images/empty_filter.react.svg?url";
import EmptyFilterDarkImg from "PUBLIC_DIR/images/empty_filter_dark.react.svg?url";
import ClearEmptyFilterIcon from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { globalColors } from "@docspace/shared/themes";
import { formatFilters } from "SRC_DIR/helpers/webhooks";

const EmptyFilterWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 149px;
`;

const EmptyFilterContent = styled.div`
  display: flex;

  .emptyFilterText {
    margin-inline-start: 40px;
  }

  .clearFilter {
    display: block;
    margin-top: 26px;
    cursor: pointer;
  }

  .clearFilterIcon {
    margin-inline-end: 8px;
  }

  .emptyFilterHeading {
    margin-bottom: 8px;
  }
`;

const EmptyFilter = (props) => {
  const { applyFilters, clearHistoryFilters, theme } = props;
  const { t } = useTranslation(["Webhooks", "Common"]);

  const clearFilters = () => {
    clearHistoryFilters(null);
    applyFilters(
      formatFilters({
        deliveryDate: null,
        status: [],
      }),
    );
  };

  return (
    <EmptyFilterWrapper>
      <EmptyFilterContent>
        <img
          src={theme.isBase ? EmptyFilterImg : EmptyFilterDarkImg}
          alt="Empty filter"
        />
        <div className="emptyFilterText">
          <Text
            fontSize="16px"
            fontWeight={700}
            as="p"
            className="emptyFilterHeading"
          >
            {t("Common:NotFoundTitle")}
          </Text>
          <Text
            fontSize="12px"
            color={
              theme.isBase ? globalColors.grayText : globalColors.grayDarkText
            }
          >
            {t("NoResultsMatched")}
          </Text>
          <span className="clearFilter" onClick={clearFilters}>
            <img
              src={ClearEmptyFilterIcon}
              alt={t("ClearFilter")}
              className="clearFilterIcon"
            />
            <Link
              color={theme.isBase ? globalColors.lightGrayDark : "inherit"}
              isHovered
              fontWeight={600}
              type="action"
              dataTestId="clear_empty_filter_link"
            >
              {t("Common:ClearFilter")}
            </Link>
          </span>
        </div>
      </EmptyFilterContent>
    </EmptyFilterWrapper>
  );
};

export default inject(({ webhooksStore, settingsStore }) => {
  const { clearHistoryFilters } = webhooksStore;
  const { theme } = settingsStore;

  return { clearHistoryFilters, theme };
})(observer(EmptyFilter));
