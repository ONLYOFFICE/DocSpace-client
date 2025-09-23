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

import { createFolder } from "../../../api/files";
import { createRoom } from "../../../api/rooms";
import { RoomsType } from "../../../enums";
import { TSelectorItem } from "../../../components/selector/Selector.types";
import { toastr } from "../../../components/toast";

import { TUseInputItemHelper } from "../types";

const useInputItemHelper = ({
  withCreate,
  selectedItemId,
  setItems,
}: TUseInputItemHelper) => {
  const onCancelInput = React.useCallback(() => {
    if (!withCreate) return;

    setItems?.((value) => {
      if (!value[1]?.isInputItem && !value[0]?.isInputItem) return value;

      let idx = 1;

      if (value[0].isInputItem) idx = 0;

      const newValue = [...value];

      newValue.splice(idx, 1);

      return newValue;
    });
  }, [setItems, withCreate]);

  const onAcceptInput = React.useCallback(
    async (value: string, roomType?: RoomsType) => {
      if (!withCreate || (!selectedItemId && !roomType)) return;

      try {
        if (selectedItemId) await createFolder(selectedItemId, value);
        else if (roomType) {
          await createRoom({ roomType, title: value });
        }
      } catch (e) {
        console.log(e);
        toastr.error(e as string);
      }
    },
    [withCreate, selectedItemId],
  );

  const addInputItem = React.useCallback(
    (
      defaultInputValue: string,
      icon: string,
      roomType?: RoomsType,
      placeholder?: string,
    ) => {
      if (!withCreate || !setItems) return;

      const inputItem: TSelectorItem = {
        label: "",
        id: "new-folder-input",
        isInputItem: true,
        onAcceptInput: (value: string) => onAcceptInput(value, roomType),
        onCancelInput,
        defaultInputValue,
        icon,
        roomType,
        placeholder,
      };

      setItems((value) => {
        if (value[1]?.isInputItem || value[0]?.isInputItem) return value;

        const newValue = [...value];

        newValue.splice(1, 0, inputItem);

        return newValue;
      });
    },
    [onAcceptInput, onCancelInput, setItems, withCreate],
  );

  return { onAcceptInput, onCancelInput, addInputItem };
};

export default useInputItemHelper;
