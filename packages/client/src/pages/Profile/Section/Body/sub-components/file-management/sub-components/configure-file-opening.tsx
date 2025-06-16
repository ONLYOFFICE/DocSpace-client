import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";

import { useDeepLinkSettings } from "@docspace/shared/hooks/useDeepLinkSettings";

import styled from "styled-components";

const StyledWrapper = styled.div`
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .category-item-description {
    color: ${(props) => props.theme.client.settings.descriptionColor};
  }

  .radio-button-group {
    width: fit-content;
    margin-top: 8px;
  }
`;

const ConfigureFileOpening = ({ deepLinkSettings, getDeepLinkSettings }) => {
  const { t } = useTranslation(["Settings", "Common"]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getDeepLinkSettings();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const { type, isVisible, onSelect, onSave, getSettings } =
    useDeepLinkSettings({
      deepLinkSettings,
      isUserProfile: true, // These are user settings
    });

  useEffect(() => {
    if (!deepLinkSettings) return;
    getSettings();
  }, [deepLinkSettings]);

  const onSaveProfileDeepLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e);
    onSave();
  };

  if (isLoading) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <StyledWrapper>
      <Text fontSize="16px" fontWeight={700}>
        {t("ConfigureDeepLink")}
      </Text>
      <Text className="category-item-description" fontSize="13px">
        {t("ConfigureDeepLinkUserDescription") ||
          t("ConfigureDeepLinkDescription")}
      </Text>
      <RadioButtonGroup
        className="radio-button-group"
        fontSize="13px"
        fontWeight={400}
        orientation="vertical"
        spacing="8px"
        options={[
          {
            id: "provide-a-choice",
            label: t("AlwaysAsk"),
            value: 0,
          },
          {
            id: "by-web",
            label: t("OpenInWebOnly", {
              productName: t("Common:ProductName"),
            }),
            value: 1,
          },
          {
            id: "by-app",
            label: t("OpenInAppOnly"),
            value: 2,
          },
        ]}
        selected={type}
        onClick={onSaveProfileDeepLink}
      />
    </StyledWrapper>
  );
};

export default inject<TStore>(({ common }) => {
  // Must receive user settings
  const { deepLinkSettings, getDeepLinkSettings } = common;

  return {
    deepLinkSettings,
    getDeepLinkSettings,
  };
})(observer(ConfigureFileOpening));
