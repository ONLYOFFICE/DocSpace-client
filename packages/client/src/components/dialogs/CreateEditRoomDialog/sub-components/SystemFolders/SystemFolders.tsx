import React from "react";

import {
  SystemFoldersTitle,
  SystemFoldersHeader,
  SystemFoldersDescription,
  SystemFoldersToggleButton,
} from "./SystemFolders.styled";

import type SystemFoldersProps from "./SystemFolders.props";

function SystemFolders({ t }: SystemFoldersProps) {
  return (
    <section>
      <SystemFoldersHeader>
        <SystemFoldersTitle>
          {t("CreateEditRoomDialog:PublicRoomSystemFoldersTitle")}
        </SystemFoldersTitle>
        <SystemFoldersToggleButton isChecked isDisabled onChange={() => {}} />
      </SystemFoldersHeader>
      <SystemFoldersDescription>
        {t("CreateEditRoomDialog:PublicRoomSystemFoldersDescription")}
      </SystemFoldersDescription>
    </section>
  );
}

export default SystemFolders;
