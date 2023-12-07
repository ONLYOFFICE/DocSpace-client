import { useState } from "react";
import { useTranslation } from "react-i18next";
import TabContainer from "@docspace/components/tabs-container";
import TextInput from "@docspace/components/text-input";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";

import { StyledWatermark } from "./StyledComponent";

const options = (t) => [
  {
    key: "userName",
    title: t("UserName"),
  },
  {
    key: "userEmail",
    title: t("UserEmail"),
  },
  {
    key: "userIPAddress",
    title: t("UserIPAddress"),
  },
  {
    key: "currentDate",
    title: t("Common:CurrentDate"),
  },
  {
    key: "RoomName",
    title: t("Common:RoomName"),
  },
];
const ViewerInfoWatermark = () => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const [isChecked, setIsChecked] = useState(true);
  const [elements, setElements] = useState({
    userName: false,
    userEmail: false,
    userIP: false,
    currentDate: false,
    roomName: false,
  });

  const dataTabs = options(t);

  const onSelect = (item) => {
    const updatedElem = elements[item.key];
    const key = item.key;
    setElements({ ...elements, [key]: !updatedElem });
  };
  const onCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <StyledWatermark>
      <div>
        <Text className="watermark-title" fontWeight={600} lineHeight="20px">
          {t("WatermarkElements")}
        </Text>
        <TabContainer
          elements={dataTabs}
          onSelect={onSelect}
          withBodyScroll={false}
          multiple
          withBorder
        />
        <Text className="watermark-title" fontWeight={600} lineHeight="20px">
          {t("Position")}
        </Text>
        <TextInput scale value={t("Center")} isReadOnly />
        <Checkbox
          className="watermark-checkbox"
          label={t("Semitransparent")}
          onChange={onCheckboxChange}
          isChecked={isChecked}
        />
      </div>
    </StyledWatermark>
  );
};
export default ViewerInfoWatermark;
