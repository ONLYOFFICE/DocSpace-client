import { IInfoPanelItem } from "SRC_DIR/helpers/plugins/types";
import PluginStore from "SRC_DIR/store/PluginStore";

export const usePlugin = (
  currentView: string,
  infoPanelItemsList?: PluginStore["infoPanelItemsList"],
) => {
  const isPlugin = currentView.indexOf("info_plugin") > -1;
  const infoPanelItemKey = currentView.replace("info_plugin-", "");

  const infoPanelItem: IInfoPanelItem | undefined = infoPanelItemsList?.find(
    (i) => i.key === infoPanelItemKey,
  )?.value;

  const isPluginTitleVisible = !!infoPanelItem && infoPanelItem.isTitleVisible;

  return {
    isPlugin,
    isPluginTitleVisible,
    infoPanelItem,
  };
};
