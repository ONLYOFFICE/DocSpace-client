import React from "react";
import { HeaderContainer, Title, HeaderActionIcon } from "../styled-components";
import { HeaderButtons } from "./HeaderButtons";

export const DaysHeader = ({
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
    setObservedDate((prevObservedDate: any) => prevObservedDate.clone().subtract(1, "month")
    );

  const onRightClick = () =>
    setObservedDate((prevObservedDate: any) => prevObservedDate.clone().add(1, "month")
    );

  const isLeftDisabled =
    observedDate.clone().subtract(1, "month").endOf("month") < minDate;
  const isRightDisabled =
    observedDate.clone().add(1, "month").startOf("month") > maxDate;

  return (
    <HeaderContainer>
      // @ts-expect-error TS(2769): No overload matches this call.
      <Title onClick={onTitleClick} className="days-header" isMobile={isMobile}>
        {observedDate.format("MMMM").charAt(0).toUpperCase() +
          observedDate.format("MMMM").substring(1)}{" "}
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
