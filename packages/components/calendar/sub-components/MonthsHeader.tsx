import React from "react";
import { HeaderActionIcon, HeaderContainer, Title } from "../styled-components";
import { HeaderButtons } from "./HeaderButtons";

export const MonthsHeader = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  minDate,
  maxDate,
  isMobile
}: any) => {
  const onTitleClick = () =>
    setSelectedScene((prevSelectedScene: any) => prevSelectedScene + 1);

  const onLeftClick = () =>
    setObservedDate((prevObservedDate: any) => prevObservedDate.clone().subtract(1, "year")
    );

  const onRightClick = () =>
    setObservedDate((prevObservedDate: any) => prevObservedDate.clone().add(1, "year")
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
        // @ts-expect-error TS(2769): No overload matches this call.
        isMobile={isMobile}
      >
        {observedDate.format("YYYY")}
        // @ts-expect-error TS(2769): No overload matches this call.
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
