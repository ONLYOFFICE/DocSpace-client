import { useRef } from "react";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import ItemContextOptions from "./ItemContextOptions";

import { Text } from "@docspace/components";
import { StyledTitle } from "../../styles/common";

const GalleryItemTitle = ({ t, gallerySelected, getIcon }) => {
  const itemTitleRef = useRef();

  return (
    <StyledTitle ref={itemTitleRef}>
      <ReactSVG className="icon" src={getIcon(32, ".docxf")} />
      <Text className="text">{gallerySelected?.attributes?.name_form}</Text>

      <Text className="free-label">{t("FormGallery:Free")}</Text>
      {gallerySelected && (
        <ItemContextOptions
          t={t}
          itemTitleRef={itemTitleRef}
          selection={gallerySelected}
          isForm={true}
          withLabel={true}
        />
      )}
    </StyledTitle>
  );
};

export default withTranslation([
  "FormGallery",
  "Files",
  "Common",
  "Translations",
  "InfoPanel",
])(GalleryItemTitle);
