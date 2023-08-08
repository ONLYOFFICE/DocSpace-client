import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";

import AccountsTable from "./AccountsTable";

import SearchInput from "@docspace/components/search-input";

import { Wrapper, UsersInfoBlock } from "../StyledStepper";

import Paging from "@docspace/components/paging";
import { mockData } from "./mockData";

const SecondStep = (props) => {
  const { t, incrementStep, decrementStep } = props;

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
    <Wrapper>
      <p className="users-without-email">
        We found <b>6 users</b> without emails. You can add necessary data to their accounts on the
        next step.
      </p>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        showReminder
        displaySettings
      />
      <UsersInfoBlock>
        <Text color="#555f65" fontSize="14px" fontWeight={700} className="selected-users-count">
          Selected: 0/10 users
        </Text>
        <Text color="#555f65" fontSize="14px" fontWeight={700} className="selected-admins-count">
          License limit Admins/Power: 0/100
        </Text>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={<Text>Insert tooltip content</Text>}
        />
      </UsersInfoBlock>

      <SearchInput
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder="Search"
      />

      <AccountsTable accountsData={dataPortion} />

      <Paging
        className="accounts-pagging"
        pageItems={pageItems}
        countItems={countItems}
        previousLabel="Previous"
        nextLabel="Next"
        openDirection="top"
        style={{ justifyContent: "center", alignItems: "center" }}
        onSelectPage={onSelectPage}
        onSelectCount={console.log}
        previousAction={onSelectPagePrevHandler}
        nextAction={onSelectPageNextHandler}
        selectedPageItem={selectedPageItem}
        selectedCountItem={countItem}
        disablePrevious={currentCount <= 25}
        disableNext={mockData.length - currentCount <= 0}
      />

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        showReminder
        displaySettings
      />
    </Wrapper>
  );
};

export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(SecondStep));
