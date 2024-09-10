import { useState } from "react";
import { Trans } from "react-i18next";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";

import FileLifetime from "./FileLifetime";
import WatermarkBlock from "./Watermarks/WatermarkBlock";

const StyledVirtualDataRoomBlock = styled.div`
  .virtual-data-room-block {
    margin-bottom: 18px;

    .virtual-data-room-block_header {
      display: flex;

      .virtual-data-room-block_toggle {
        margin-left: auto;
        margin-right: 28px;
      }
    }
    .virtual-data-room-block_description {
      max-width: 420px;
      margin-right: 28px;

      color: ${({ theme }) => theme.editLink.text.color};
    }
    .virtual-data-room-block_content {
      margin-top: 16px;
    }
  }
`;

const Block = ({
  headerText,
  bodyText,
  onChange,
  isDisabled,
  isChecked,
  children,
}) => {
  return (
    <div className="virtual-data-room-block">
      <div className="virtual-data-room-block_header">
        <Text fontWeight={600} fontSize="13px">
          {headerText}
        </Text>
        <ToggleButton
          isDisabled={isDisabled}
          isChecked={isChecked}
          onChange={onChange}
          className="virtual-data-room-block_toggle"
        />
      </div>
      <Text
        fontWeight={400}
        fontSize="12px"
        className="virtual-data-room-block_description"
      >
        {bodyText}
      </Text>
      {isChecked && (
        <div className="virtual-data-room-block_content">{children}</div>
      )}
    </div>
  );
};

const VirtualDataRoomBlock = ({ t, roomParams, setRoomParams, isEdit }) => {
  const role = t("Translations:RoleViewer");

  const [fileLifetimeChecked, setFileLifetimeChecked] = useState(
    !!roomParams?.lifetime,
  );
  const [copyAndDownloadChecked, setCopyAndDownloadChecked] = useState(
    !!roomParams?.denyDownload,
  );

  const onChangeAutomaticIndexing = () => {
    setRoomParams({ ...roomParams, indexing: !roomParams.indexing });
  };

  const onChangeFileLifetime = () => {
    if (fileLifetimeChecked) setRoomParams({ ...roomParams, lifetime: null });
    setFileLifetimeChecked(!fileLifetimeChecked);
  };

  const onChangeRestrictCopyAndDownload = () => {
    setRoomParams({ ...roomParams, denyDownload: !roomParams.denyDownload });

    setCopyAndDownloadChecked(!copyAndDownloadChecked);
  };

  return (
    <StyledVirtualDataRoomBlock>
      <Block
        headerText={t("AutomaticIndexing")}
        bodyText={t("AutomaticIndexingDescription")}
        onChange={onChangeAutomaticIndexing}
        isDisabled={false}
        isChecked={roomParams.indexing}
      ></Block>
      <Block
        headerText={t("FileLifetime")}
        bodyText={t("FileLifetimeDescription")}
        onChange={onChangeFileLifetime}
        isDisabled={false}
        isChecked={fileLifetimeChecked}
      >
        <FileLifetime
          t={t}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
        />
      </Block>
      <Block
        headerText={t("RestrictCopyAndDownload")}
        bodyText={
          <Trans t={t} i18nKey="RestrictCopyAndDownloadDescription">
            Enable this setting to disable downloads and content copying for
            users with the {{ role }} role.
          </Trans>
        }
        onChange={onChangeRestrictCopyAndDownload}
        isDisabled={false}
        isChecked={copyAndDownloadChecked}
      ></Block>

      <WatermarkBlock BlockComponent={Block} t={t} isEdit={isEdit} />
    </StyledVirtualDataRoomBlock>
  );
};

export default VirtualDataRoomBlock;
