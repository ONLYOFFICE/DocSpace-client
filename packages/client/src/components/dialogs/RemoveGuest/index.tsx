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
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { ButtonKeys } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";

type RemoveGuestDialogProps = {
  visible: boolean;
  onClose: VoidFunction;

  guests: UsersStore["selection"];
  removeGuests: UsersStore["removeGuests"];
  setSelected: UsersStore["setSelected"];
};

const RemoveGuestDialog = ({
  visible,
  onClose,

  guests,
  removeGuests,
  setSelected,
}: RemoveGuestDialogProps) => {
  const { t } = useTranslation(["PeopleTranslations", "Common"]);

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const isMulti = guests.length > 1;

  const onRemove = React.useCallback(() => {
    if (isRequestRunning) return;
    setIsRequestRunning(true);

    const ids = guests.map((g) => g.id);

    removeGuests(ids)
      .then(() => {
        toastr.success(t("GuestsRemoved"));
        onClose();
      })
      .catch((e: unknown) => {
        toastr.error(e as string);
      })
      .finally(() => {
        setIsRequestRunning(false);
        setSelected("close");
      });
  }, [guests, isRequestRunning, onClose, removeGuests, setSelected, t]);

  const onCloseAction = React.useCallback(() => {
    if (isRequestRunning) return;
    onClose();
  }, [isRequestRunning, onClose]);

  const onKeyUpHandler = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.esc) onCloseAction();
      if (e.key === ButtonKeys.enter) onRemove();
    },
    [onCloseAction, onRemove],
  );

  React.useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  console.log(guests);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {isMulti ? t("RemoveGuests") : t("RemoveGuest")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {!isMulti ? (
            <Trans
              i18nKey="RemoveGuestDescription"
              ns="PeopleTranslations"
              t={t}
              values={{ userName: guests[0]?.displayName }}
            />
          ) : (
            t("RemoveGuestsDescription")
          )}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="change-user-type-modal_submit"
          label={t("Common:Remove")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onRemove}
          isLoading={isRequestRunning}
        />
        <Button
          id="change-user-type-modal_cancel"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onCloseAction}
          isDisabled={isRequestRunning}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ peopleStore }: TStore) => {
  const { removeGuests, selection, bufferSelection, setSelected } =
    peopleStore.usersStore!;

  const guests = selection.length ? selection : [bufferSelection];

  return { guests, removeGuests, setSelected };
})(observer(RemoveGuestDialog));
