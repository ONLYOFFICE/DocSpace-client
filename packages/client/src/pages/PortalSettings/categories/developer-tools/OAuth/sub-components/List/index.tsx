import styled from "styled-components";

//@ts-ignore
import { ClientProps } from "@docspace/common/utils/oauth/interfaces";

import Text from "@docspace/components/text";
//@ts-ignore
import { Consumer } from "@docspace/components/utils/context";

//@ts-ignore
import { ViewAsType } from "SRC_DIR/store/OAuthStore";

import TableView from "./TableView";
import RowView from "./RowView";

import RegisterNewButton from "../RegisterNewButton";

const StyledContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: 8px;
  }

  .description {
    margin-bottom: 8px;
  }

  button {
    width: fit-content;

    margin-bottom: 12px;
  }
`;

interface ListProps {
  t: any;
  clients: ClientProps[];
  viewAs: ViewAsType;
}

const List = ({ t, clients, viewAs }: ListProps) => {
  return (
    <StyledContainer>
      <Text
        fontSize={"16px"}
        fontWeight={700}
        lineHeight={"22px"}
        title={"OAuth applications"}
        tag={""}
        as={"p"}
        color={""}
        textAlign={""}
        className="header"
      >
        {"OAuth applications"}
      </Text>
      <Text
        fontSize={"12px"}
        fontWeight={400}
        lineHeight={"16px"}
        title={"OAuth description"}
        tag={""}
        as={"p"}
        color={""}
        textAlign={""}
        className="description"
      >
        {"OAuth description"}
      </Text>
      <RegisterNewButton t={t} />
      <Consumer>
        {(context: { sectionWidth: number; sectionHeight: number }) => (
          <>
            {viewAs === "table" ? (
              <TableView
                items={clients || []}
                sectionWidth={context.sectionWidth}
              />
            ) : (
              <RowView
                items={clients || []}
                sectionWidth={context.sectionWidth}
              />
            )}
          </>
        )}
      </Consumer>
    </StyledContainer>
  );
};

export default List;
