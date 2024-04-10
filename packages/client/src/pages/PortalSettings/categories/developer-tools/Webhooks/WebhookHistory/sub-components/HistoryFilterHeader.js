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

import React, { useState, useEffect, useTransition, Suspense } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router-dom";

import { Base } from "@docspace/shared/themes";
import FilterReactSvrUrl from "PUBLIC_DIR/images/filter.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";

import FilterDialog from "./FilterDialog";
import StatusBar from "./StatusBar";

import { HistoryHeaderLoader } from "../../sub-components/Loaders/HistoryHeaderLoader";

import { tablet, mobile } from "@docspace/shared/utils";

const ListHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media ${tablet} {
    margin-top: -5px;
  }
  @media ${mobile} {
    margin-top: 8px;
  }
`;

const ListHeading = styled(Text)`
  line-height: 22px;
  font-weight: 700;
  margin: 0;

  overflow: hidden;
  text-overflow: ellipsis;
`;

const FilterButton = styled.div`
  position: relative;
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;

  flex-shrink: 0;

  width: 32px;
  height: 32px;

  z-index: ${(props) => (props.isGroupMenuVisible ? 199 : 201)};

  border: 1px solid;
  border-color: ${(props) =>
    props.theme.isBase ? "#d0d5da" : "rgb(71, 71, 71)"};
  border-radius: 3px;
  cursor: pointer;

  svg {
    cursor: pointer;
  }

  :hover {
    border-color: #a3a9ae;
    svg {
      path {
        fill: ${(props) => props.theme.iconButton.hoverColor};
      }
    }
  }

  span {
    z-index: 203;
    width: 8px;
    height: 8px;
    background-color: #4781d1;
    border-radius: 50%;
    position: absolute;
    bottom: -2px;
    inset-inline-end: -2px;
  }
`;

FilterButton.defaultProps = { theme: Base };

const HistoryFilterHeader = (props) => {
  const {
    applyFilters,
    historyFilters,
    isGroupMenuVisible,
    fetchConfigName,
    configName,
    clearConfigName,
  } = props;

  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { id } = useParams();

  const openFiltersModal = () => {
    setIsFiltersVisible(true);
  };

  const closeFiltersModal = () => {
    setIsFiltersVisible(false);
  };

  const handleConfigFetch = async () => {
    await fetchConfigName({
      configId: id,
    });
  };

  useEffect(() => {
    startTransition(handleConfigFetch);
    return clearConfigName;
  }, []);

  return (
    <div>
      <Suspense fallback={<HistoryHeaderLoader />}>
        <ListHeader>
          <ListHeading title={configName} fontWeight={700} fontSize="16px">
            {configName}
          </ListHeading>

          <FilterButton
            id="filter-button"
            onClick={openFiltersModal}
            isGroupMenuVisible={isGroupMenuVisible}
          >
            <IconButton iconName={FilterReactSvrUrl} size={16} />
            <span hidden={historyFilters === null}></span>
          </FilterButton>
        </ListHeader>
      </Suspense>
      {historyFilters !== null && <StatusBar applyFilters={applyFilters} />}
      <FilterDialog
        visible={isFiltersVisible}
        closeModal={closeFiltersModal}
        applyFilters={applyFilters}
      />
    </div>
  );
};

export default inject(({ webhooksStore }) => {
  const {
    historyFilters,
    isGroupMenuVisible,
    fetchConfigName,
    configName,
    clearConfigName,
  } = webhooksStore;
  return {
    historyFilters,
    isGroupMenuVisible,
    fetchConfigName,
    configName,
    clearConfigName,
  };
})(observer(HistoryFilterHeader));
