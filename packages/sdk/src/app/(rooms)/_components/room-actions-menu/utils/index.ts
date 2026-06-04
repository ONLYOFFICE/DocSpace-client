const EXCLUDED_KEYS = new Set(["open", "select", "room-info"]);

const filterInfoPanelModel = (
  model: ContextMenuModel[],
): ContextMenuModel[] => {
  const isExcluded = (item: ContextMenuModel) =>
    item.key != null && EXCLUDED_KEYS.has(String(item.key));

  const result = model
    .filter((item) => !isExcluded(item))
    .map((item) =>
      "items" in item && item.items
        ? { ...item, items: item.items.filter((sub) => !isExcluded(sub)) }
        : item,
    );

  while (result[0]?.isSeparator) result.shift();
  while (result[result.length - 1]?.isSeparator) result.pop();

  return result;
};

export { filterInfoPanelModel };
