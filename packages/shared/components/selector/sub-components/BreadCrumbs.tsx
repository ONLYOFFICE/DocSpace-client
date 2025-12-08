// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import { classNames } from "../../../utils";

import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "../../context-menu-button";
import { ContextMenuModel } from "../../context-menu";
import {
  TBreadCrumb,
  TDisplayedItem,
  BreadCrumbsProps,
} from "../Selector.types";
import { BreadCrumbsContext } from "../contexts/BreadCrumbs";
import { SearchDispatchContext } from "../contexts/Search";
import styles from "../Selector.module.scss";
import { Text } from "../../text";
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";

const calculateDisplayedItems = (
  items: TBreadCrumb[],
  onClickItem: ({ item }: { item: TBreadCrumb }) => void,
) => {
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

    return newItems;
  }

  return [];
};

const BreadCrumbs = ({ visible = true }: BreadCrumbsProps) => {
  const {
    withBreadCrumbs,
    breadCrumbs,
    breadCrumbsLoader,
    isBreadCrumbsLoading,
    onSelectBreadCrumb,
    bodyIsLoading,
  } = React.use(BreadCrumbsContext);
  const setIsSearch = React.use(SearchDispatchContext);

  const { isRTL } = useInterfaceDirection();

  const onClickItem = React.useCallback(
    ({ item }: { item: TBreadCrumb }) => {
      if (isBreadCrumbsLoading) return;
      setIsSearch(false);
      onSelectBreadCrumb?.(item);
    },
    [isBreadCrumbsLoading, onSelectBreadCrumb, setIsSearch],
  );

  const [displayedItems, setDisplayedItems] = React.useState<TDisplayedItem[]>(
    breadCrumbs ? calculateDisplayedItems(breadCrumbs, onClickItem) : [],
  );

  React.useEffect(() => {
    if (breadCrumbs && breadCrumbs.length > 0) {
      const items = calculateDisplayedItems(breadCrumbs, onClickItem);
      setDisplayedItems(items);
    }
  }, [breadCrumbs, onClickItem]);

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

  if (!withBreadCrumbs || !visible) {
    if (withBreadCrumbs && !visible && bodyIsLoading) return breadCrumbsLoader;

    return null;
  }

  if (isBreadCrumbsLoading) return breadCrumbsLoader;

  return (
    <div
      id="selector_bread_crumbs"
      className={styles.breadCrumbs}
      style={
        {
          "--items-count": displayedItems.length,
          "--grid-template-columns": gridTemplateColumns,
        } as React.CSSProperties
      }
    >
      {displayedItems.map((item, index) =>
        item.isList ? (
          <ContextMenuButton
            key={`bread-crumb-item-${item.id}`}
            className={styles.contextMenuButton}
            displayType={ContextMenuButtonDisplayType.dropdown}
            getData={() => {
              const items = item.listItems
                ? ([...item.listItems] as ContextMenuModel[])
                : [];
              return items;
            }}
          />
        ) : item.isArrow ? (
          <ArrowIcon
            className={classNames(styles.arrowRightSvg, {
              [styles.rtl]: isRTL,
            })}
            key={`bread-crumb-item-${item.id}`}
          />
        ) : (
          <Text
            key={`bread-crumb-item-${item.id}`}
            dataTestId={`selector_bread_crumb_item_${item.id}`}
            fontSize="16px"
            fontWeight={600}
            lineHeight="22px"
            className={classNames(styles.itemText, {
              [styles.isNotCurrent]: index !== displayedItems.length - 1,
              [styles.isNotLoading]: !isBreadCrumbsLoading,
            })}
            noSelect
            truncate
            onClick={() => {
              if (index === displayedItems.length - 1 || isBreadCrumbsLoading)
                return;

              setIsSearch(false);

              onSelectBreadCrumb?.({
                id: item.id,
                label: item.label,
                isRoom: item.isRoom,
                isAgent: item.isAgent,
              });
            }}
          >
            {item.label}
          </Text>
        ),
      )}
    </div>
  );
};

export { BreadCrumbs };
