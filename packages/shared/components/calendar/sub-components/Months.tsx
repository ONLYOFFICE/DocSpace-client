import React from "react";
import { MonthsBody } from "./MonthsBody";
import { MonthsHeader } from "./MonthsHeader";

import { MonthsProps } from "../Calendar.types";

export const Months = ({
  observedDate,
  setObservedDate,
  selectedDate,
  setSelectedScene,
  minDate,
  maxDate,
  isMobile,
}: MonthsProps) => {
  return (
    <>
      <MonthsHeader
        observedDate={observedDate}
        setObservedDate={setObservedDate}
        setSelectedScene={setSelectedScene}
        minDate={minDate}
        maxDate={maxDate}
        isMobile={isMobile}
      />
      <MonthsBody
        observedDate={observedDate}
        setObservedDate={setObservedDate}
        setSelectedScene={setSelectedScene}
        selectedDate={selectedDate}
        minDate={minDate}
        maxDate={maxDate}
        isMobile={isMobile}
      />
    </>
  );
};
