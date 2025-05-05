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
