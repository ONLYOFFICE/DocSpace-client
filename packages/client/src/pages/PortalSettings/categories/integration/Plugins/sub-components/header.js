import styled from "styled-components";

import Heading from "@docspace/components/heading";
import Text from "@docspace/components/text";
import Link from "@docspace/components/link";

const StyledHeader = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  .plugin-list-header {
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    font-weight: 700;
    lien-height: 22px;

    margin: 0 4px 0 0;
    padding: 0;
  }

  .header-container {
    margin-bottom: 8px;
  }

  div {
    display: flex;
    align-items: center;
  }
`;

const Header = ({ t, currentColorScheme, withUpload }) => {
  return (
    <StyledHeader>
      <div className="header-container">
        <Heading className={"plugin-list-header"}>
          {t("Common:Plugins")}
        </Heading>
        {/* <HelpButton
          offsetBottom={0}
          offsetLeft={0}
          offsetRight={0}
          offsetTop={0}
          tooltipContent={t("PluginsHelp")}
        /> */}
      </div>
      <div>
        <Text>{withUpload ? t("Description") : t("PluginsHelp")}</Text>
      </div>
    </StyledHeader>
  );
};

export default Header;
