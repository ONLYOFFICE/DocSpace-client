import React from "react";
import { SectionWarningProps } from "../Section.types";

const SectionWarning = ({ children }: SectionWarningProps) => {
  return <div>{children}</div>;
};

SectionWarning.displayName = "SectionWarning";

export default SectionWarning;
