import { useTranslation, Trans } from "react-i18next";

import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { Text } from "@docspace/shared/components/text";
import { DeviceType } from "@docspace/shared/enums";
import { Consumer } from "@docspace/shared/utils/context";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";

import RegisterNewButton from "../RegisterNewButton";

import TableView from "./TableView";
import RowView from "./RowView";

import { StyledContainer } from "./List.styled";

interface ListProps {
  clients: IClientProps[];
  viewAs: ViewAsType;
  currentDeviceType: DeviceType;
}

const List = ({ clients, viewAs, currentDeviceType }: ListProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  const descText = (
    <Trans
      ns="OAuth"
      t={t}
      i18nKey="OAuthAppDescription"
      values={{
        productName: t("Common:ProductName"),
        organizationName: t("Common:OrganizationName"),
      }}
    />
  );

  return (
    <StyledContainer>
      <Text
        fontSize="12px"
        fontWeight={400}
        lineHeight="16px"
        className="description"
      >
        {descText}
      </Text>
      <RegisterNewButton currentDeviceType={currentDeviceType} />
      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <TableView
              items={clients || []}
              sectionWidth={context.sectionWidth || 0}
            />
          ) : (
            <RowView
              items={clients || []}
              sectionWidth={context.sectionWidth || 0}
            />
          )
        }
      </Consumer>
    </StyledContainer>
  );
};

export default List;
