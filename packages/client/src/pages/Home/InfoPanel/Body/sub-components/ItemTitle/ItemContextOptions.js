import { useRef, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { ContextMenu, ContextMenuButton } from "@docspace/components";
import ContextHelper from "../../helpers/ContextHelper";

const StyledItemContextOptions = styled.div`
  height: 16px;
  margin: ${({ withLabel, theme }) =>
    theme.interfaceDirection === "rtl"
      ? withLabel
        ? "0 8px 0 0"
        : "0 auto 0 0"
      : withLabel
      ? "0 0 0 8px"
      : "0 0 0 auto"};
`;

const ItemContextOptions = ({
  t,
  selection,
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

  const options = contextHelper?.getItemContextOptions();
  const getData = () => options;

  const onContextMenu = (e) => {
    e.button === 2;
    if (!contextMenuRef?.current.menuRef.current)
      itemTitleRef?.current.click(e);
    contextMenuRef?.current.show(e);
  };

  useEffect(() => {
    contextMenuRef?.current.hide();
    const newContextHelper = new ContextHelper({
      t,
      selection,
      isUser,
      getContextOptions,
      getContextOptionActions,
      getUserContextOptions,
    });
    setContextHelper(newContextHelper);
  }, [selection, isUser]);

  return (
    <StyledItemContextOptions withLabel={withLabel}>
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        withBackdrop={true}
        baseZIndex={310}
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
