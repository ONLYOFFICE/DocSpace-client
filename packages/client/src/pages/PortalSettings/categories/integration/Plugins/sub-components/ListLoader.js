import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { PluginListContainer } from "../StyledPlugins";

const ListLoader = ({ widthUpload }) => {
  return (
    <>
      {widthUpload && <RectangleSkeleton width={"144px"} height={"32px"} />}
      <PluginListContainer>
        <RectangleSkeleton width={"340px"} height={"135px"} />
        <RectangleSkeleton width={"340px"} height={"135px"} />
        <RectangleSkeleton width={"340px"} height={"135px"} />
      </PluginListContainer>
    </>
  );
};

export default ListLoader;
