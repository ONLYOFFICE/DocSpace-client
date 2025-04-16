import React from "react";
import { makeAutoObservable } from "mobx";

import { TOption } from "../../combobox";
import { TModel } from "../types/chat";

const fakeModels: TModel[] = [
  { id: "gpt-4o", name: "GPT 4o" },
  { id: "gpt-4.5", name: "GPT 4.5" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
  { id: "deepseek-r1", name: "DeepSeek R1" },
];

export default class ModelStore {
  selectedModel: TModel = { id: "", name: "" };

  models: TModel[] = [];

  selectedFolder: string | number = "";

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedFolder = (folder: string | number) => {
    this.selectedFolder = folder;
  };

  fetchModels = async () => {
    // TODO: fetch models list
    this.models = fakeModels;
  };

  fetchCurrentModel = async () => {
    // TODO: fetch current model using selectedFolder
    this.selectedModel = this.models[0];
  };

  setCurrentModel = (option: TOption) => {
    this.selectedModel = { id: option.key! as string, name: option.title! };
  };

  get preparedModels() {
    const prepModels: TOption[] = this.models.map((model) => ({
      id: model.id,
      name: model.name,
      label: model.name,
      key: model.id,
      title: model.name,
    }));

    return prepModels;
  }

  get preparedSelectedModel() {
    const option: TOption = {
      ...this.selectedModel,
      key: this.selectedModel?.id || "",
      label: this.selectedModel?.name || "",
      title: this.selectedModel?.name || "",
    };

    return option;
  }
}

export const ModelStoreContext = React.createContext<ModelStore>(undefined!);

export const ModelStoreContextProvider = ({
  children,
  selectedFolder,
}: {
  children: React.ReactNode;
  selectedFolder: string | number;
}) => {
  const store = React.useMemo(() => new ModelStore(), []);

  React.useEffect(() => {
    store.setSelectedFolder(selectedFolder);
    store.fetchModels();
    store.fetchCurrentModel();
  }, [selectedFolder, store]);

  return (
    <ModelStoreContext.Provider value={store}>
      {children}
    </ModelStoreContext.Provider>
  );
};

export const useModelStore = () => {
  return React.useContext(ModelStoreContext);
};
