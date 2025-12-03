import PluginStore from "SRC_DIR/store/PluginStore";

export const usePlugin = (
  currentView: string,
  infoPanelItemsList?: PluginStore["infoPanelItemsList"],
) => {
  const isPlugin = currentView.indexOf("info_plugin") > -1;
  const infoPanelItemKey = currentView.replace("info_plugin-", "");

  const infoPanelItem = infoPanelItemsList?.find(
    (i) => i.key === infoPanelItemKey,
  )?.value;

  const isPluginHeaderVisible =
    !!infoPanelItem && infoPanelItem.isHeaderVisible;

  return {
    isPlugin,
    isPluginHeaderVisible,
    infoPanelItem,
  };
};
