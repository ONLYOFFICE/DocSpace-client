import { inject, observer } from "mobx-react";

import Submenu from "@docspace/components/submenu";

const SectionSubmenuContent = ({ isPersonalRoom }) => {
  const submenu = [
    {
      id: "my-documents",
      name: "My documents",
    },
    {
      id: "recently",
      name: "Recently accessible via link",
    },
  ];

  return isPersonalRoom ? (
    <Submenu data={submenu} startSelect={0} onSelect={(e) => console.log(e)} />
  ) : null;
};

export default inject(({ treeFoldersStore }) => {
  const { isPersonalRoom } = treeFoldersStore;

  return {
    isPersonalRoom,
  };
})(observer(SectionSubmenuContent));
