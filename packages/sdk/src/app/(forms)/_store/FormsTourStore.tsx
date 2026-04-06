// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { makeAutoObservable } from "mobx";

const TOUR_COMPLETED_KEY = "forms_tour_completed";

class FormsTourStore {
  isRunning = false;
  stepIndex = 0;
  tourCompleted = false;
  showMockItems = false;
  forceShowAiChat = false;

  constructor() {
    makeAutoObservable(this);
  }

  hydrate = () => {
    this.tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
  };

  startTour = () => {
    this.isRunning = true;
    this.stepIndex = 0;
    this.showMockItems = true;
    this.forceShowAiChat = true;
  };

  stopTour = () => {
    this.isRunning = false;
    this.showMockItems = false;
    this.forceShowAiChat = false;
  };

  setStepIndex = (index: number) => {
    this.stepIndex = index;
  };

  completeTour = () => {
    this.isRunning = false;
    this.showMockItems = false;
    this.forceShowAiChat = false;
    this.tourCompleted = true;
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
  };

  resetTour = () => {
    this.tourCompleted = false;
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  };
}

export const FormsTourStoreContext = React.createContext<FormsTourStore>(
  null as unknown as FormsTourStore,
);

export const FormsTourStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsTourStore(), []);
  React.useEffect(() => {
    store.hydrate();
  }, [store]);
  return (
    <FormsTourStoreContext.Provider value={store}>
      {children}
    </FormsTourStoreContext.Provider>
  );
};

export const useFormsTourStore = () => {
  return React.useContext(FormsTourStoreContext);
};
