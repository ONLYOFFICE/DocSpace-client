import React from "react";
import { observer } from "mobx-react";

import {
  ComboBox,
  ComboBoxDisplayType,
  ComboBoxSize,
} from "../../../../combobox";

import { useModelStore } from "../../../store/modelStore";

const SelectModel = () => {
  const { preparedModels, preparedSelectedModel, setCurrentModel } =
    useModelStore();

  return (
    <ComboBox
      options={preparedModels}
      selectedOption={preparedSelectedModel}
      scaled={false}
      displayType={ComboBoxDisplayType.default}
      size={ComboBoxSize.content}
      showDisabledItems
      onSelect={setCurrentModel}
      isDefaultMode
      noBorder
      directionX="right"
      modernView
    />
  );
};

export default observer(SelectModel);
