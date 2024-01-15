import React from "react";
import { HeaderActionIcon, HeaderContainer, Title } from "../Calendar.styled";
import { HeaderButtons } from "./HeaderButtons";
import { MonthsHeaderProps } from "../Calendar.types";

export const MonthsHeader = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  minDate,
  maxDate,
  isMobile,
}: MonthsHeaderProps) => {
  const onTitleClick = () =>
    setSelectedScene((prevSelectedScene) => prevSelectedScene + 1);

  const onLeftClick = () =>
    setObservedDate((prevObservedDate) =>
      prevObservedDate.clone().subtract(1, "year"),
    );

  const onRightClick = () =>
    setObservedDate((prevObservedDate) =>
      prevObservedDate.clone().add(1, "year"),
    );

  const isLeftDisabled =
    observedDate.clone().subtract(1, "year").endOf("year").endOf("month") <
    minDate;

  const isRightDisabled =
    observedDate.clone().add(1, "year").startOf("year").startOf("month") >
    maxDate;

  return (
    <HeaderContainer>
      <Title
        className="months-header"
        onClick={onTitleClick}
        isMobile={isMobile}
      >
        {observedDate.format("YYYY")}
        <HeaderActionIcon isMobile={isMobile} />
      </Title>
      <HeaderButtons
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        isLeftDisabled={isLeftDisabled}
        isRightDisabled={isRightDisabled}
        isMobile={isMobile}
      />
    </HeaderContainer>
  );
};
