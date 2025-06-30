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
import { makeAutoObservable, runInAction } from "mobx";

import { type AIModel, getModels } from "../../../api/ai";
import FlowsApi from "../../../api/flows/flows.api";

import { TOption } from "../../combobox";

const SELECTED_CHAT_MODEL = "selected-ai-model";

export default class ModelStore {
  selectedModel: { display_name: string; id: string } = {
    display_name: "",
    id: "",
  };

  variableId: string = "";

  models: AIModel[] = [];

  selectedFolder: string | number = "";

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedFolder = (folder: string | number) => {
    this.selectedFolder = folder;
  };

  fetchModels = async () => {
    const [models, variable] = await Promise.all([
      getModels(),
      FlowsApi.readVariable(SELECTED_CHAT_MODEL),
    ]);

    const modelId = variable?.value;
    const model = models.find((m) => m.id === modelId);

    runInAction(() => {
      if (variable && model) {
        this.selectedModel = model;
        this.variableId = variable.id;
      } else {
        this.selectedModel = models[0];
      }

      this.models = models.filter((m) => m.type === "chat");
    });

    if (!model) {
      const newVar = await FlowsApi.createVariable(
        SELECTED_CHAT_MODEL,
        this.selectedModel.id,
      );

      runInAction(() => {
        this.variableId = newVar.id;
      });
    }
  };

  setCurrentModel = async (option: TOption) => {
    this.selectedModel = {
      id: option.key! as string,
      display_name: option.title!,
    };

    if (this.variableId) {
      await FlowsApi.updateVariable(this.variableId, option.key! as string);
    } else {
      const newVar = await FlowsApi.createVariable(
        SELECTED_CHAT_MODEL,
        option.key! as string,
      );

      runInAction(() => {
        this.variableId = newVar.id;
      });
    }
  };

  get preparedModels() {
    const prepModels: TOption[] = this.models.map((model) => ({
      id: model.id,
      display_name: model.display_name,
      label: model.display_name,
      key: model.id,
      title: model.display_name,
    }));

    return prepModels;
  }

  get preparedSelectedModel() {
    const option: TOption = {
      ...this.selectedModel,
      key: this.selectedModel?.id || "",
      label: this.selectedModel?.display_name || "",
      title: this.selectedModel?.display_name || "",
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
