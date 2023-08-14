import { useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { Consumer } from "@docspace/components/utils/context";
import Paging from "@docspace/components/paging";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import TableView from "./TableView";
import RowView from "./RowView";

import { mockData } from "../mockData.js";

const StyledPagging = styled(Paging)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`;

const countItems = [
  {
    key: "25 per page",
    label: "25 per page",
  },
  {
    key: "50 per page",
    label: "50 per page",
  },
  {
    key: "100 per page",
    label: "100 per page",
  },
];

const ThirdStep = (props) => {
  const { t, onNextStep, onPrevStep, viewAs, showReminder } = props;
  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));
  const [currentCount, setCurrentCount] = useState(25);

  const createPageItems = (count) => {
    let pageItems = [];
    for (let i = 0; i < count; i++) {
      pageItems.push({
        key: i,
        label: i + 1 + " of " + count,
      });
    }
    return pageItems;
  };

  const pageItems = createPageItems(Math.ceil(mockData.length / 25));

  const [selectedPageItem, setSelectedPageItems] = useState(pageItems[0]);
  const [countItem, setCountItem] = useState(countItems[0]);

  const onSelectPageNextHandler = (e) => {
    const currentPage = pageItems[selectedPageItem.key + 1];
    if (currentPage) {
      if (currentCount <= 0) {
        setDataPortion(mockData.slice(currentCount + 25, currentCount + 50));
        setCurrentCount((prevCurrentCount) => prevCurrentCount + 50);
      } else {
        setDataPortion(mockData.slice(currentCount, currentCount + 25));
        setCurrentCount((prevCurrentCount) => prevCurrentCount + 25);
      }
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPagePrevHandler = () => {
    const currentPage = pageItems[selectedPageItem.key - 1];
    if (currentPage) {
      if (currentCount >= mockData.length) {
        setDataPortion(mockData.slice(currentCount - 50, currentCount - 25));
        setCurrentCount((prevCurrentCount) => prevCurrentCount - 50);
      } else {
        setDataPortion(mockData.slice(currentCount - 25, currentCount));
        setCurrentCount((prevCurrentCount) => prevCurrentCount - 25);
      }
      setSelectedPageItems(currentPage);
    }
  };

  const onSelectPage = (selectedPage) => {
    const count = selectedPage.key * 25;
    setDataPortion(mockData.slice(count, count + 25));
    setCurrentCount(count + 25);
    setSelectedPageItems(pageItems[selectedPage.key]);
  };

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStep}
        onCancelClick={onPrevStep}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />

      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <TableView
              t={t}
              sectionWidth={context.sectionWidth}
              usersData={dataPortion}
            />
          ) : (
            <RowView
              t={t}
              sectionWidth={context.sectionWidth}
              usersData={dataPortion}
            />
          )
        }
      </Consumer>
      <StyledPagging
        className="users-pagging"
        pageItems={pageItems}
        countItems={countItems}
        previousLabel={t("Common:Previous")}
        nextLabel={t("Common:Next")}
        openDirection="top"
        onSelectPage={onSelectPage}
        onSelectCount={() => console.log("select-count")}
        previousAction={onSelectPagePrevHandler}
        nextAction={onSelectPageNextHandler}
        selectedPageItem={selectedPageItem}
        selectedCountItem={countItem}
        disablePrevious={currentCount <= 25}
        disableNext={mockData.length - currentCount <= 0}
      />
    </>
  );
};

export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(ThirdStep));
