import React from "react";
import { Provider as MobxProvider } from "mobx-react";
import { I18nextProvider } from "react-i18next";
// @ts-ignore
import store from "client/store";
import FilesSelector from "./";
import i18n from "./i18n";
import { FilesSelectorProps } from "./FilesSelector.types";
const { authStore, filesSettingsStore } = store;

const FilesSelectorWrapper = (props: FilesSelectorProps) => {
  React.useEffect(() => {
    const { setFilesSettings } = filesSettingsStore;
    const { settings } = props;
    authStore.init(true);
    settings && setFilesSettings(settings);
  }, []);

  return (
    <MobxProvider {...store}>
      <I18nextProvider i18n={i18n}>
        <FilesSelector {...props} />
      </I18nextProvider>
    </MobxProvider>
  );
};

export default FilesSelectorWrapper;
