import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { IClientProps } from "@docspace/shared/utils/oauth/types";
import { Text } from "@docspace/shared/components/text";

import { Consumer } from "@docspace/shared/utils/context";

import { ViewAsType } from "SRC_DIR/store/OAuthStore";
import { DeviceUnionType } from "SRC_DIR/Hooks/useViewEffect";

import TableView from "./TableView";
import RowView from "./RowView";

import RegisterNewButton from "../RegisterNewButton";

export const StyledContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  .description {
    margin-bottom: 20px;
    max-width: 700px;
  }

  .add-button {
    width: fit-content;

    margin-bottom: 12px;
  }
`;

interface ListProps {
  clients: IClientProps[];
  viewAs: ViewAsType;
  currentDeviceType: DeviceUnionType;
}

const List = ({ clients, viewAs, currentDeviceType }: ListProps) => {
  const { t } = useTranslation(["OAuth", "Common"]);

  return (
    <StyledContainer>
      <Text
        fontSize="12px"
        fontWeight={400}
        lineHeight="16px"
        title={t("OAuthAppDescription")}
        className="description"
      >
        {t("OAuthAppDescription")}
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
