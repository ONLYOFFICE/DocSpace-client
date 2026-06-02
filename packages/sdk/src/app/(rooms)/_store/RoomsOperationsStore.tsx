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

import type { Operation } from "@docspace/ui-kit/components/operations-progress-button/OperationsProgressButton.types";

class RoomsOperationsStore {
  operations: Operation[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  startOperation = (operation: string, label: string): string => {
    const id = `${operation}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.operations = [
      ...this.operations,
      {
        id,
        operation,
        label,
        alert: false,
        completed: false,
        withoutProgress: true,
        withoutStatus: true,
      },
    ];
    return id;
  };

  finishOperation = (id: string, alert = false) => {
    this.operations = this.operations.map((op) =>
      op.id === id ? { ...op, completed: true, alert } : op,
    );
  };

  clearOperation = (operationId?: string | null, operation?: string | null) => {
    if (!operationId && !operation) {
      this.operations = this.operations.filter((op) => !op.completed);
      return;
    }
    this.operations = this.operations.filter(
      (op) => op.id !== operationId && op.operation !== operation,
    );
  };
}

export const RoomsOperationsStoreContext =
  React.createContext<RoomsOperationsStore>(new RoomsOperationsStore());

export const RoomsOperationsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new RoomsOperationsStore(), []);
  return (
    <RoomsOperationsStoreContext.Provider value={store}>
      {children}
    </RoomsOperationsStoreContext.Provider>
  );
};

export const useRoomsOperationsStore = () => {
  return React.useContext(RoomsOperationsStoreContext);
};
