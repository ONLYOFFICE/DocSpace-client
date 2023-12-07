import { useState } from "react";
import { useTranslation } from "react-i18next";

import RadioButtonGroup from "@docspace/components/radio-button-group";

import TextWatermark from "./Text";
import { StyledBody } from "./StyledComponent";

const textWatermark = "text",
  imageWatermark = "image",
  viewerInfoWatermark = "viewerInfo";

const options = (t) => [
  {
    label: t("ViewerInfo"),
    value: viewerInfoWatermark,
  },
  {
    label: t("Text"),
    value: textWatermark,
  },
  {
    label: t("Common:Image"),
    value: imageWatermark,
  },
];
const Watermarks = () => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);
  const [type, setType] = useState(textWatermark);

  const onSelectType = (e) => {
    const { value } = e.target;

    setType(value);
  };

  const typeOptions = options(t);

  return (
    <StyledBody>
      <RadioButtonGroup
        name="watermarks-radiobutton"
        fontSize="13px"
        fontWeight="400"
        spacing="8px"
        options={typeOptions}
        selected={type}
        onClick={onSelectType}
      />

      {type === textWatermark && <TextWatermark />}
    </StyledBody>
  );
};

export default Watermarks;
