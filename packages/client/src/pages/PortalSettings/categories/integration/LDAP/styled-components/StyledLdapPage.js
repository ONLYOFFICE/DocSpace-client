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
    .toggle-button-text {
      font-size: 14px;
      font-weight: 600;
    }
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
    margin-top: 16px;
    margin-bottom: 30px;
    input {
      margin-bottom: 16px;
    }
    display: grid;
    grid-template-columns: minmax(100px, 340px) 1fr;
    grid-gap: 12px;
  }

  .group_membership-header {
    display: flex;
    align-items: baseline;
    .help-icon {
      padding-left: 8px;
    }
  }

  .group_membership-container {
    margin-top: 18px;
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: minmax(100px, 340px) 1fr;
    grid-gap: 12px;
  }

  .ldap_group-filter {
    grid-column: span 2;
  }

  .ldap_attribute-mapping-text {
    display: flex;
    align-items: baseline;
    p:first-child {
      margin-right: 4px;
    }
  }
  .ldap_buttons-container {
    button:first-child {
      margin-right: 8px;
    }
  }
  .ldap_authentication {
    margin: 16px 0;
    display: grid;
    grid-template-columns: minmax(100px, 340px) 1fr;
    grid-gap: 12px;
  }
  .ldap_advanced-settings {
    p:first-child {
      margin-bottom: 16px;
    }

    margin-bottom: 28px;
  }

  .ldap_sync-container {
    margin: 16px 0;
  }

  .ldap_progress-container {
    margin: 16px 0;
    width: 350px;
  }

  .sync-description {
    margin-top: 8px;
  }

  .manual-sync-button {
    margin-top: 16px;
  }

  ${(props) => !props.isSettingPaid && UnavailableStyles}
`;

export default StyledLdapPage;
