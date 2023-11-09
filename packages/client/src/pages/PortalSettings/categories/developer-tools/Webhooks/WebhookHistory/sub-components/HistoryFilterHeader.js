import React, { useState, useEffect, useTransition, Suspense } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useParams } from "react-router-dom";

import { Base } from "@docspace/components/themes";
import FilterReactSvrUrl from "PUBLIC_DIR/images/filter.react.svg?url";
import IconButton from "@docspace/components/icon-button";
import Text from "@docspace/components/text";

import FilterDialog from "./FilterDialog";
import StatusBar from "./StatusBar";

import { HistoryHeaderLoader } from "../../sub-components/Loaders/HistoryHeaderLoader";

import { tablet, mobile } from "@docspace/components/utils/device";

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
  border-color: ${(props) => (props.theme.isBase ? "#d0d5da" : "rgb(71, 71, 71)")};
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
            isGroupMenuVisible={isGroupMenuVisible}>
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
  const { historyFilters, isGroupMenuVisible, fetchConfigName, configName, clearConfigName } =
    webhooksStore;
  return {
    historyFilters,
    isGroupMenuVisible,
    fetchConfigName,
    configName,
    clearConfigName,
  };
})(observer(HistoryFilterHeader));
