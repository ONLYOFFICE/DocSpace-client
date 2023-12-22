import React from "react";
import { HeaderContainer, Title, HeaderActionIcon } from "../Calendar.styled";
import { HeaderButtons } from "./HeaderButtons";
import { DaysHeaderProps } from "../Calendar.types";

export const DaysHeader = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  minDate,
  maxDate,
  isMobile,
}: DaysHeaderProps) => {
  const onTitleClick = () =>
    setSelectedScene((prevSelectedScene) => prevSelectedScene + 1);

  const onLeftClick = () =>
    setObservedDate((prevObservedDate) =>
      prevObservedDate.clone().subtract(1, "month"),
    );

  const onRightClick = () =>
    setObservedDate((prevObservedDate) =>
      prevObservedDate.clone().add(1, "month"),
    );

  const isLeftDisabled =
    observedDate.clone().subtract(1, "month").endOf("month") < minDate;
  const isRightDisabled =
    observedDate.clone().add(1, "month").startOf("month") > maxDate;

  return (
    <HeaderContainer>
      <Title onClick={onTitleClick} className="days-header" isMobile={isMobile}>
        {observedDate.format("MMMM").charAt(0).toUpperCase() +
          observedDate.format("MMMM").substring(1)}{" "}
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
