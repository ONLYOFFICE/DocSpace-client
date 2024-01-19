import { Heading } from "@docspace/shared/components/heading";
import { IconButton } from "@docspace/shared/components/icon-button";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Badge } from "@docspace/shared/components/badge";
import { Text } from "@docspace/shared/components/text";

import PluginSettingsIconUrl from "PUBLIC_DIR/images/plugin.settings.react.svg?url";
import PluginDefaultLogoUrl from "PUBLIC_DIR/images/plugin.default-logo.png";

import { getPluginUrl } from "SRC_DIR/helpers/plugins/utils";
import { PluginScopes } from "SRC_DIR/helpers/plugins/constants";

import { StyledPluginItem, StyledPluginHeader } from "../StyledPlugins";

const PluginItem = ({
  name,
  version,
  description,

  enabled,
  updatePlugin,

  scopes,
  openSettingsDialog,

  image,
  url,
}) => {
  const imgSrc = image ? getPluginUrl(url, `/assets/${image}`) : null;

  const withSettings = scopes.includes(PluginScopes.Settings);

  const onChangeStatus = () => {
    console.log(name, enabled);
    updatePlugin && updatePlugin(name, !enabled);
  };

  const onOpenSettingsDialog = () => {
    openSettingsDialog && openSettingsDialog(name);
  };

  return (
    <StyledPluginItem description={description}>
      <img
        className="plugin-logo"
        src={imgSrc || PluginDefaultLogoUrl}
        alt={"Plugin logo"}
      />
      <div className="plugin-info">
        <StyledPluginHeader>
          <Heading className={"plugin-name"}>{name}</Heading>
          <div className="plugin-controls">
            {withSettings && (
              <IconButton
                iconName={PluginSettingsIconUrl}
                size={16}
                onClick={onOpenSettingsDialog}
              />
            )}
            <ToggleButton
              className="plugin-toggle-button"
              onChange={onChangeStatus}
              isChecked={enabled}
            />
          </div>
        </StyledPluginHeader>

        <Badge
          label={version}
          fontSize={"12px"}
          fontWeight={700}
          noHover={true}
          backgroundColor={"#22C386"}
        />

        {imgSrc && description && (
          <Text
            className={"plugin-description"}
            fontWeight={400}
            lineHeight={"20px"}
          >
            {description}
          </Text>
        )}
      </div>
    </StyledPluginItem>
  );
};

export default PluginItem;
