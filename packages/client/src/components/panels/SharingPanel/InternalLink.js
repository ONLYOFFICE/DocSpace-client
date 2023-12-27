import React from "react";
import copy from "copy-to-clipboard";

import { toastr } from "@docspace/shared/components";
import { Text } from "@docspace/shared/components";

import { StyledInternalLink } from "./StyledSharingPanel";

const InternalLink = ({ t, internalLink, style }) => {
  const onCopyInternalLinkAction = React.useCallback(() => {
    copy(internalLink);
    toastr.success(t("Translations:LinkCopySuccess"));
  }, [internalLink]);

  return (
    <StyledInternalLink style={style}>
      <Text trucate className={"internal-link__link-text"}>
        {t("InternalLink")}
      </Text>
      <Text
        className={"internal-link__copy-text"}
        onClick={onCopyInternalLinkAction}
      >
        {t("Common:Copy")}
      </Text>
    </StyledInternalLink>
  );
};

export default React.memo(InternalLink);
