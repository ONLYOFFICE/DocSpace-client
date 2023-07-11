import styled from "styled-components";
import { UnavailableStyles } from "../../../../utils/commonSettingsStyles";
import Box from "@docspace/components/box";

const StyledLdapPage = styled(Box)`
  max-width: 700px;
  width: 100%;

  .intro-text {
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  ${(props) => !props.isSettingPaid && UnavailableStyles}
`;

export default StyledLdapPage;
