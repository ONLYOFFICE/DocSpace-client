import React, { useRef, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { ContextMenu, ContextMenuButton } from "@docspace/components";

import ContextHelper from "../../helpers/ContextHelper";

const StyledItemContextOptions = styled.div`
  height: 16px;
  ${({ withLabel }) => !withLabel && "margin-left: auto;"}
`;

const getFormContextOptions = (t) => [
  {
    key: "create",
    label: t("Common:Create"),
    onClick: () => {},
  },
  {
    key: "preview",
    label: t("Common:Preview"),
    onClick: () => {},
  },
  {
    key: "separator",
    isSeparator: true,
  },
  {
    key: "suggest-changes",
    label: t("FormGallery:SuggestChanges"),
    onClick: () => {},
  },
];

const ItemContextOptions = ({
  t,
  selection,
  isForm = false,
  getContextOptions,
  getContextOptionActions,
  getUserContextOptions,

  isUser = false,
  itemTitleRef,

  withLabel = false,
}) => {
  if (!selection) return null;

  const [contextHelper, setContextHelper] = useState(null);

  const contextMenuRef = useRef();

  const onContextMenu = (e) => {
    e.button === 2;
    if (!contextMenuRef.current.menuRef.current) itemTitleRef.current.click(e);
    contextMenuRef.current.show(e);
  };

  useEffect(() => {
    contextMenuRef.current.hide();
  }, [selection]);

  useEffect(() => {
    const contextHelper = new ContextHelper({
      t,
      isUser,
      selection,
      getContextOptions,
      getContextOptionActions,
      getUserContextOptions,
    });

    setContextHelper(contextHelper);
  }, [
    t,
    isUser,
    selection,
    getContextOptions,
    getContextOptionActions,
    getUserContextOptions,
  ]);

  const options = contextHelper?.getItemContextOptions();

  const getData = () => {
    if (isForm) return getFormContextOptions(t);
    return options;
  };

  return (
    <StyledItemContextOptions withLabel={withLabel}>
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        withBackdrop={false}
      />
      {options?.length > 0 && (
        <ContextMenuButton
          id="info-options"
          className="expandButton"
          title={
            selection.isFolder
              ? t("Translations:TitleShowFolderActions")
              : t("Translations:TitleShowActions")
          }
          onClick={onContextMenu}
          getData={getData}
          directionX="right"
          displayType="toggle"
        />
      )}
    </StyledItemContextOptions>
  );
};

export default inject(({ filesStore, peopleStore, contextOptionsStore }) => {
  const { getUserContextOptions } = peopleStore.contextOptionsStore;
  const { setBufferSelection, getFilesContextOptions: getContextOptions } =
    filesStore;
  const { getFilesContextOptions: getContextOptionActions } =
    contextOptionsStore;

  return {
    setBufferSelection,
    getContextOptions,
    getContextOptionActions,
    getUserContextOptions,
  };
})(observer(ItemContextOptions));
