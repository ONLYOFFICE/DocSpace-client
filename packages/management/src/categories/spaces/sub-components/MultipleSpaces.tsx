import React from "react";
import { TextInput } from "@docspace/shared/components/text-input";
import { observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { isMobile } from "react-device-detect";
import { SpacesRowContainer } from "./RowView/SpacesRowContainer";
import { StyledMultipleSpaces } from "../StyledSpaces";
import { useStore } from "SRC_DIR/store";
import { TranslationType } from "SRC_DIR/types/spaces";

type TMultipleSpaces = {
  t: TranslationType;
};

const MultipleSpaces = ({ t }: TMultipleSpaces) => {
  const { spacesStore, authStore } = useStore();

  const { setChangeDomainDialogVisible, setCreatePortalDialogVisible } =
    spacesStore;

  const { portals, baseDomain } = authStore.settingsStore;

  const buttonSize = isMobile ? "normal" : "small";

  return (
    <StyledMultipleSpaces>
      <div className="multiple-spaces-section">
        <Button
          size={buttonSize}
          label={t("NewSpace")}
          className="spaces-button"
          primary={true}
          onClick={() => setCreatePortalDialogVisible(true)}
        />
        <SpacesRowContainer portals={portals} />
        <div className="domain-settings-wrapper">
          <Text fontSize="16px" fontWeight={700}>
            {t("DomainSettings")}
          </Text>

          <div className="spaces-input-block">
            <Text
              fontSize="13px"
              className="spaces-input-subheader"
              fontWeight="600"
            >
              {t("Settings:YourCurrentDomain")}
            </Text>
            <TextInput
              isDisabled={true}
              placeholder={baseDomain}
              className="spaces-input"
            />
          </div>

          <Button
            className="spaces-button"
            size={buttonSize}
            label={t("Common:EditButton")}
            primary={true}
            onClick={() => setChangeDomainDialogVisible(true)}
          />
        </div>
      </div>
    </StyledMultipleSpaces>
  );
};

export default observer(MultipleSpaces);
