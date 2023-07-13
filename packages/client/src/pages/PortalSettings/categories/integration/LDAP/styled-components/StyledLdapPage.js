import styled from "styled-components";
import { UnavailableStyles } from "../../../../utils/commonSettingsStyles";
import Box from "@docspace/components/box";

const StyledLdapPage = styled(Box)`
  max-width: 700px;
  width: 100%;

  .intro-text {
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .toggle {
    position: static;
    margin-top: 1px;
  }

  .toggle-caption {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .toggle-caption_title {
      display: flex;
      .toggle-caption_title_badge {
        margin-left: 4px;
        cursor: auto;
      }
    }
  }

  .hide-button {
    margin-left: 12px;
  }

  .checkbox-container {
    margin: 20px 0 20px 0;
    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-gap: 12px;
  }

  .ldap_connection-container {
    margin: 20px 0 28px 0;
    display: grid;
    grid-template-columns: minmax(100px, 340px) 1fr;
    grid-gap: 12px;
  }

  .ldap_attribute-mapping {
    input {
      margin-bottom: 16px;
    }
    display: grid;
    grid-template-columns: minmax(100px, 340px) 1fr;
    grid-gap: 12px;
  }
  ${(props) => !props.isSettingPaid && UnavailableStyles}
`;

export default StyledLdapPage;
