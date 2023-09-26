import React from "react";

import { BlockContainer } from "../ClientForm.styled";
import { BlockProps } from "../ClientForm.types";

const Block = ({ children }: BlockProps) => {
  return <BlockContainer>{children}</BlockContainer>;
};

export default Block;
