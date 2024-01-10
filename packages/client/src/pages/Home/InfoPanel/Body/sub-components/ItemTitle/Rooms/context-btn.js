import { useRef, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { ContextMenu, ContextMenuButton } from "@docspace/components";

const generalKeys = ["select", "show-info"];
const roomKeys = ["separator0", "room-info"];
const currentRoomKeys = ["pin-room", "unpin-room"];
const currentFolderKeys = ["open", "separator0", "separator1"];

const StyledItemContextOptions = styled.div`
  height: 16px;
  margin: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? "0 auto 0 0" : "0 0 0 auto"};
`;

const RoomsContextBtn = ({
  t,
  selection,
  itemTitleRef,

  getItemContextOptionsKeys,
  getItemContextOptionsActions,

  onSelectItem,
}) => {
  const contextMenuRef = useRef();

  if (!selection) return null;

  const onContextMenu = (e) => {
    onSelectItem();

    if (!contextMenuRef?.current.menuRef.current)
      itemTitleRef?.current.click(e);
    contextMenuRef?.current.show(e);
  };

  const getData = () => {
    let item = { ...selection };
    if (!selection.contextOptions) {
      const contextOptions = getItemContextOptionsKeys(selection, true);
      item = { ...item, contextOptions };
    }

    const options = getItemContextOptionsActions(item, t, true);

    const removeOptionByKey = (key) => {
      const idx = options.findIndex((o) => o.key === key);
      if (idx !== -1) options.splice(idx, 1);
    };

    generalKeys.forEach((key) => removeOptionByKey(key));
    if (selection.isRoom) roomKeys.forEach((key) => removeOptionByKey(key));
    if (selection.isSelectedFolder && selection.isRoom)
      currentRoomKeys.forEach((key) => removeOptionByKey(key));
    if (selection.isSelectedFolder && !selection.isRoom)
      currentFolderKeys.forEach((key) => removeOptionByKey(key));

    options.forEach((item, index) => {
      const isSeparator = item.key.includes("separator");
      const isFirst = index === options.length - 1;
      const isLast = index === 0;
      const nextItem = isLast ? null : options[index + 1];
      const nextIsSeparator = nextItem && nextItem.key.includes("separator");
      if (
        (isFirst && isSeparator) ||
        (isLast && isSeparator) ||
        (isSeparator && nextIsSeparator)
      )
        options.splice(index, 1);
    });

    return options;
  };

  // useEffect(() => {
  //   contextMenuRef?.current.hide();
  // }, [selection]);

  return (
    <StyledItemContextOptions>
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
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        withBackdrop={true}
        baseZIndex={310}
      />
    </StyledItemContextOptions>
  );
};

export default inject(({ filesStore, contextOptionsStore }) => ({
  getItemContextOptionsKeys: filesStore.getFilesContextOptions,
  getItemContextOptionsActions: contextOptionsStore.getFilesContextOptions,
}))(
  withTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
  ])(observer(RoomsContextBtn))
);
