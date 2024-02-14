import React from "react";
import { Loader, LoaderTypes } from "../loader";

import { StyledContainer } from "./AppLoader.styled";

const AppLoader = () => (
  <StyledContainer>
    <Loader className="pageLoader" type={LoaderTypes.rombs} size="40px" />
  </StyledContainer>
);

export default AppLoader;
