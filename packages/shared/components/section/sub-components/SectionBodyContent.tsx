import React from "react";

import { SectionBodyContentProps } from "../Section.types";

const SectionBodyContent = React.memo<SectionBodyContentProps>((props) => {
  const { children } = props;

  return children;
});

SectionBodyContent.displayName = "SectionBodyContent";

export default SectionBodyContent;
