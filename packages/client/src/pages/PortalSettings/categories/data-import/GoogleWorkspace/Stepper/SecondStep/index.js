import { useState } from "react";
import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";
import styled from "styled-components";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";
import Paging from "@docspace/components/paging";

import { mockData } from "../mockData.js";

import TableView from "./TableView";
import RowView from "./RowView";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: #f8f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  .selected-users-count {
    margin-right: 24px;
    color: #555f65;
    font-weight: 700;
  }

  .selected-admins-count {
    margin-right: 8px;
    color: #555f65;
    font-weight: 700;
  }
`;

const StyledText = styled(Text)`
  color: #f21c0e;
  margin-top: 16px;
  font-size: 12px;
  font-weight: 600;
`;

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

const SecondStep = (props) => {
  const { t, onNextStepClick, onPrevStepClick, viewAs, showReminder } = props;
  const [isExceeded, setIsExceeded] = useState(false);
  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));
  const [currentCount, setCurrentCount] = useState(25);

  const selectedUsers = 0;
  const totalUsers = 10;
  const licencelimit = 0;
  const totalLicenceLimit = 100;

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
        onSaveClick={onNextStepClick}
        onCancelClick={onPrevStepClick}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
      {isExceeded && <StyledText>{t("Settings:UserLimitExceeded")}</StyledText>}
      <Wrapper>
        <Text className="selected-users-count">
          {t("Settings:SelectedUsersCounter", { selectedUsers, totalUsers })}
        </Text>
        <Text className="selected-admins-count">
          {t("Settings:LicenseLimitCounter", {
            licencelimit,
            totalLicenceLimit,
          })}
        </Text>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={
            <Text fontSize="12px">{t("Settings:LicenseLimitDescription")}</Text>
          }
        />
      </Wrapper>

      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <TableView
              sectionWidth={context.sectionWidth}
              usersData={dataPortion}
            />
          ) : (
            <RowView
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
})(observer(SecondStep));
