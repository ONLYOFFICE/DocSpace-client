import React from "react";

import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { ContextMenuModel } from "../../context-menu";

import {
  TBreadCrumb,
  BreadCrumbsProps,
  TDisplayedItem,
} from "../Selector.types";
import {
  StyledBreadCrumbs,
  StyledItemText,
  StyledArrowRightSvg,
} from "../Selector.styled";

const BreadCrumbs = ({
  breadCrumbs,
  onSelectBreadCrumb,
  isLoading,
}: BreadCrumbsProps) => {
  const [displayedItems, setDisplayedItems] = React.useState<TDisplayedItem[]>(
    [],
  );

  const onClickItem = React.useCallback(
    ({ item }: { item: TBreadCrumb }) => {
      if (isLoading) return;
      onSelectBreadCrumb?.(item);
    },
    [isLoading, onSelectBreadCrumb],
  );

  const calculateDisplayedItems = React.useCallback(
    (items: TBreadCrumb[]) => {
      const itemsLength = items.length;
      const oldItems: TBreadCrumb[] = [];

      items.forEach((item) =>
        oldItems.push({
          ...item,
          id: item.id?.toString(),
        }),
      );
      if (itemsLength > 0) {
        const newItems: TDisplayedItem[] = [];

        if (itemsLength <= 3) {
          oldItems.forEach((item, index) => {
            newItems.push({
              ...item,
              isArrow: false,
              isList: false,
              listItems: [],
            });

            if (index !== oldItems.length - 1) {
              newItems.push({
                id: `arrow-${index}`,
                label: "",
                isArrow: true,
                isList: false,
                listItems: [],
              });
            }
          });
        } else {
          newItems.push({
            ...oldItems[0],
            isArrow: false,
            isList: false,
            listItems: [],
          });

          newItems.push({
            id: "arrow-1",
            label: "",
            isArrow: true,
            isList: false,
            listItems: [],
          });

          newItems.push({
            id: "drop-down-item",
            label: "",
            isArrow: false,
            isList: true,
            listItems: [],
          });

          newItems.push({
            id: "arrow-2",
            label: "",
            isArrow: true,
            isList: false,
            listItems: [],
          });

          newItems.push({
            ...oldItems[itemsLength - 2],
            isArrow: false,
            isList: false,
            listItems: [],
          });

          newItems.push({
            id: "arrow-3",
            label: "",
            isArrow: true,
            isList: false,
            listItems: [],
          });

          newItems.push({
            ...oldItems[itemsLength - 1],
            isArrow: false,
            isList: false,
            listItems: [],
          });

          oldItems.splice(0, 1);
          oldItems.splice(oldItems.length - 2, 2);

          oldItems.forEach((item) => {
            newItems[2].listItems?.push({
              ...item,
              minWidth: "150px",
              onClick: onClickItem,
            });
          });
        }

        return setDisplayedItems(newItems);
      }
    },
    [onClickItem],
  );

  React.useEffect(() => {
    if (breadCrumbs && breadCrumbs.length > 0) {
      calculateDisplayedItems(breadCrumbs);
    }
  }, [breadCrumbs, calculateDisplayedItems]);

  let gridTemplateColumns = "minmax(1px, max-content)";

  if (displayedItems.length > 5) {
    gridTemplateColumns =
      "minmax(1px, max-content) 12px 16px 12px minmax(1px, max-content) 12px minmax(1px, max-content)";
  } else if (displayedItems.length === 5) {
    gridTemplateColumns =
      "minmax(1px, max-content) 12px minmax(1px, max-content) 12px minmax(1px, max-content)";
  } else if (displayedItems.length === 3) {
    gridTemplateColumns =
      "minmax(1px, max-content) 12px minmax(1px, max-content)";
  }

  return (
    <StyledBreadCrumbs
      itemsCount={displayedItems.length}
      gridTemplateColumns={gridTemplateColumns}
    >
      {displayedItems.map((item, index) =>
        item.isList ? (
          <ContextMenuButton
            key={`bread-crumb-item-${item.id}`}
            className="context-menu-button"
            displayType={ContextMenuButtonDisplayType.dropdown}
            getData={() => {
              const items = item.listItems
                ? ([...item.listItems] as ContextMenuModel[])
                : [];
              return items;
            }}
          />
        ) : item.isArrow ? (
          <StyledArrowRightSvg key={`bread-crumb-item-${item.id}`} />
        ) : (
          <StyledItemText
            key={`bread-crumb-item-${item.id}`}
            fontSize="16px"
            fontWeight={600}
            lineHeight="22px"
            noSelect
            truncate
            isCurrent={index === displayedItems.length - 1}
            isLoading={isLoading || false}
            onClick={() => {
              if (index === displayedItems.length - 1 || isLoading) return;

              onSelectBreadCrumb?.({
                id: item.id,
                label: item.label,
                isRoom: item.isRoom,
              });
            }}
          >
            {item.label}
          </StyledItemText>
        ),
      )}
    </StyledBreadCrumbs>
  );
};

export { BreadCrumbs };
