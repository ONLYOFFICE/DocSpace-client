import styled, { css } from "styled-components";

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";

import { RadioButtonGroup } from "@docspace/shared/components";
import { HelpButton } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";

import { useTranslation } from "react-i18next";

const Header = styled.h4`
  font-weight: 600;
  margin-top: 22px;
  margin-bottom: 10px;

  display: flex;
  align-items: center;

  cursor: default;

  .verificationHelpButton {
    margin-left: 4px;
  }

  img {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 4px;
          `
        : css`
            margin-left: 4px;
          `}
  }
`;

export const SSLVerification = ({ onChange, value }) => {
  const { t } = useTranslation(["Webhooks"]);

  const handleOnChange = (e) => {
    onChange({
      target: { name: e.target.name, value: e.target.value === "true" },
    });
  };

  return (
    <div>
      <Header>
        {t("SSLVerification")}{" "}
        <HelpButton
          className="verificationHelpButton"
          iconName={InfoReactSvgUrl}
          tooltipContent={<Text fontSize="12px">{t("SSLHint")}</Text>}
          place="bottom"
        />
      </Header>
      <RadioButtonGroup
        fontSize="13px"
        fontWeight="400"
        name="ssl"
        onClick={handleOnChange}
        options={[
          {
            id: "enable-ssl",
            label: t("EnableSSL"),
            value: "true",
          },
          {
            id: "disable-ssl",
            label: t("DisableSSL"),
            value: "false",
          },
        ]}
        selected={value ? "true" : "false"}
        width="100%"
        orientation="vertical"
        spacing="8px"
      />
    </div>
  );
};
