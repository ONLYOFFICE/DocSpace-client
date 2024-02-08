import { inject, observer } from "mobx-react";

import DocspaceLogo from "@docspace/shared/components/docspace-logo/DocspaceLogo";
import type { DocspaceLogoProps } from "@docspace/shared/components/docspace-logo/DocspaceLogo.types";

const DocspaceLogoWrapper = ({
  whiteLabelLogoUrls,
  className,
}: Partial<DocspaceLogoProps>) => {
  return (
    <DocspaceLogo
      whiteLabelLogoUrls={whiteLabelLogoUrls!}
      className={className}
    />
  );
};

export default inject<any>(({ settingsStore }) => {
  const { whiteLabelLogoUrls } = settingsStore;

  return {
    whiteLabelLogoUrls,
  };
})(observer(DocspaceLogoWrapper));
