import React from "react";

import RectangleLoader from "@docspace/common/components/Loaders/RectangleLoader";
import { PluginListContainer } from "../StyledPlugins";

const ListLoader = ({ widthUpload }) => {
  return (
    <>
      <RectangleLoader width={"58px"} height={"22px"} />
      <RectangleLoader width={"700px"} height={"40px"} />
      {widthUpload && <RectangleLoader width={"144px"} height={"32px"} />}
      <PluginListContainer>
        <RectangleLoader width={"340px"} height={"135px"} />
        <RectangleLoader width={"340px"} height={"135px"} />
        <RectangleLoader width={"340px"} height={"135px"} />
      </PluginListContainer>
    </>
  );
};

export default ListLoader;
