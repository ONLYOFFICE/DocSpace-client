import React from "react";
import Text from "@docspace/components/text";

import styled from "styled-components";

import { useNavigate } from "react-router-dom";

import { IntegrationButton } from "./components/integration-button";

import GoogleWorkspaceSvg from "PUBLIC_DIR/images/googleworkspace.react.svg?url";
import NextcloudSvg from "PUBLIC_DIR/images/nextcloud.logo.react.svg?url";
import OnlyOfficeWorkspaceSvg from "PUBLIC_DIR/images/logo/workspace.svg?url";

const DescriptionWrapper = styled.div`
  max-width: 675px;
  margin-bottom: 21px;
  margin-top: 3px;
`;
const WorkspacesWrapper = styled.div`
  max-width: 700px;
  margin-top: 21px;
  gap: 20px;
  display: flex;
  flex-wrap: wrap;
`;

const DataImport = () => {
  const navigate = useNavigate();

  const redirectToGoogleMigration = () => {
    navigate(window.location.pathname + `/google`);
  };
  const redirectToNextcloudMigration = () => {
    navigate(window.location.pathname + `/nextcloud`);
  };

  return (
    <div>
      <DescriptionWrapper>
        <Text color="#657077" lineHeight="20px">
          Import data from a third party service to ONLYOFFICE DocSpace. Data import allows
          transferring data such as all users, their personal and shared documents.
        </Text>
      </DescriptionWrapper>
      <Text fontWeight={600}>
        Upload a backup copy from a desired service below to start migration.
      </Text>

      <WorkspacesWrapper>
        <IntegrationButton icon={GoogleWorkspaceSvg} onClick={redirectToGoogleMigration} />
        <IntegrationButton icon={NextcloudSvg} onClick={redirectToNextcloudMigration} />
        <IntegrationButton icon={OnlyOfficeWorkspaceSvg} />
      </WorkspacesWrapper>
    </div>
  );
};

export default inject(({ setup }) => {
  const { initSettings } = setup;
  return {
    initSettings,
  };
})(withTranslation(["Settings"])(observer(DataImport)));
