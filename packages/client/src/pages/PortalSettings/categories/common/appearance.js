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

import CheckWhiteSvgUrl from "PUBLIC_DIR/images/check.white.svg?url";
import LightSvgUrl from "PUBLIC_DIR/images/icons/16/light.svg?url";
import DarkSvgUrl from "PUBLIC_DIR/images/icons/16/dark.svg?url";
import { useState, useEffect, useCallback, useMemo } from "react";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";
import { inject, observer } from "mobx-react";
import { Button } from "@docspace/shared/components/button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Text } from "@docspace/shared/components/text";
import { Tabs, TabsTypes } from "@docspace/shared/components/tabs";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { DropDown } from "@docspace/shared/components/drop-down";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Link } from "@docspace/shared/components/link";

import api from "@docspace/shared/api";

import { ReactSVG } from "react-svg";
import { isMobile, getTextColor } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ColorPicker } from "@docspace/shared/components/color-picker";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";

import ModalDialogDelete from "./sub-components/modalDialogDelete";
import {
  StyledComponent,
  StyledTheme,
  StyledBodyContent,
} from "./Appearance/StyledApperance";
import Loader from "./sub-components/loaderAppearance";
import ColorSchemeDialog from "./sub-components/colorSchemeDialog";
import Preview from "./Appearance/preview";

const Appearance = (props) => {
  const {
    appearanceTheme,
    selectedThemeId,

    getAppearanceTheme,
    currentColorScheme,

    tReady,
    t,
    currentDeviceType,
    resetIsInit,

    appearanceBlockHelpUrl,
  } = props;

  const defaultAppliedColorAccent = currentColorScheme.main?.accent;
  const defaultAppliedColorButtons = currentColorScheme.main.buttons;

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const headerAddTheme = t("Settings:NewColorScheme");
  const headerEditTheme = t("Settings:EditColorScheme");

  const checkImgHover = (
    <ReactSVG className="check-hover" src={CheckWhiteSvgUrl} />
  );

  const [showColorSchemeDialog, setShowColorSchemeDialog] = useState(false);

  const [headerColorSchemeDialog, setHeaderColorSchemeDialog] =
    useState(headerEditTheme);

  const [currentColorAccent, setCurrentColorAccent] = useState(null);
  const [currentColorButtons, setCurrentColorButtons] = useState(null);

  const [openHexColorPickerAccent, setOpenHexColorPickerAccent] =
    useState(false);
  const [openHexColorPickerButtons, setOpenHexColorPickerButtons] =
    useState(false);

  const [appliedColorAccent, setAppliedColorAccent] = useState(
    defaultAppliedColorAccent,
  );
  const [appliedColorButtons, setAppliedColorButtons] = useState(
    defaultAppliedColorButtons,
  );

  const [changeCurrentColorAccent, setChangeCurrentColorAccent] =
    useState(false);
  const [changeCurrentColorButtons, setChangeCurrentColorButtons] =
    useState(false);

  const [showSaveButtonDialog, setShowSaveButtonDialog] = useState(false);

  const [isEditDialog, setIsEditDialog] = useState(false);
  const [isAddThemeDialog, setIsAddThemeDialog] = useState(false);

  const [previewAccent, setPreviewAccent] = useState(
    currentColorScheme.main?.accent,
  );

  const [colorCheckImg, setColorCheckImg] = useState(
    currentColorScheme.text?.accent,
  );
  const [colorCheckImgHover, setColorCheckImgHover] = useState(
    currentColorScheme.text?.accent,
  );

  const [selectThemeId, setSelectThemeId] = useState(selectedThemeId);

  const [isDisabledSaveButton, setIsDisabledSaveButton] = useState(true);

  const [abilityAddTheme, setAbilityAddTheme] = useState(true);

  const [isDisabledEditButton, setIsDisabledEditButton] = useState(true);
  const [isDisabledDeleteButton, setIsDisabledDeleteButton] = useState(true);
  const [isShowDeleteButton, setIsShowDeleteButton] = useState(false);

  const [visibleDialog, setVisibleDialog] = useState(false);

  const [theme, setTheme] = useState(appearanceTheme);

  const arrayItems = useMemo(
    () => [
      {
        id: "light-theme",
        name: t("Common:LightTheme"),
        content: (
          <Preview
            appliedColorAccent={appliedColorAccent}
            previewAccent={previewAccent}
            selectThemeId={selectThemeId}
            colorCheckImg={colorCheckImg}
            themePreview="Light"
          />
        ),
        iconName: LightSvgUrl,
      },
      {
        id: "dark-theme",
        name: t("Common:DarkTheme"),
        content: (
          <Preview
            appliedColorAccent={appliedColorAccent}
            previewAccent={previewAccent}
            selectThemeId={selectThemeId}
            colorCheckImg={colorCheckImg}
            themePreview="Dark"
          />
        ),
        iconName: DarkSvgUrl,
      },
    ],
    [previewAccent, selectThemeId, colorCheckImg, tReady],
  );

  const [selectedItemId, setSelectedItemId] = useState(arrayItems[0].id);

  // const getSettings = () => {
  //   const selectColorId = getFromSessionStorage("selectColorId");
  //   const defaultColorId = selectedThemeId;
  //   saveToSessionStorage("defaultColorId", defaultColorId);
  //   if (selectColorId) {
  //     setSelectThemeId(selectColorId);
  //   } else {
  //     setSelectThemeId(defaultColorId);
  //   }
  // };

  useEffect(() => {
    // getSettings();
    setDocumentTitle(t("Settings:Appearance"));
  }, []);

  useEffect(() => {
    saveToSessionStorage("selectColorId", selectThemeId);
  }, [selectThemeId]);

  useEffect(() => {
    return () => {
      !isMobileView && resetIsInit();
    };
  }, []);

  useEffect(() => {
    if (!currentColorScheme) return;

    setAppliedColorButtons(defaultAppliedColorButtons);
    setAppliedColorAccent(defaultAppliedColorAccent);
  }, [
    currentColorScheme,
    defaultAppliedColorButtons,
    defaultAppliedColorAccent,
  ]);

  const onColorCheck = useCallback(
    (themes) => {
      const img = themes.find((item) => item.id == selectThemeId)?.text?.accent;

      setColorCheckImg(img);
    },
    [selectThemeId],
  );

  useEffect(() => {
    onColorCheck(appearanceTheme);

    // Setting a checkbox for a new theme
    setTheme(appearanceTheme);
    if (appearanceTheme.length > theme.length) {
      const newTheme = appearanceTheme[appearanceTheme.length - 1];
      const idNewTheme = newTheme.id;
      const accentNewTheme = newTheme.main?.accent;

      setSelectThemeId(idNewTheme);
      setPreviewAccent(accentNewTheme);
    }

    if (appearanceTheme.length === 9) {
      setAbilityAddTheme(false);
    } else {
      setAbilityAddTheme(true);
    }

    if (appearanceTheme.length === 6) {
      setIsShowDeleteButton(false);
    } else {
      setIsShowDeleteButton(true);
    }
  }, [
    appearanceTheme,
    theme,
    setSelectThemeId,
    setPreviewAccent,
    setAbilityAddTheme,
    setIsShowDeleteButton,
  ]);

  useEffect(() => {
    onColorCheck(appearanceTheme);

    if (appearanceTheme.find((aTheme) => aTheme.id == selectThemeId)?.name) {
      setIsDisabledEditButton(true);
      setIsDisabledDeleteButton(true);
      return;
    }

    setIsDisabledEditButton(false);
    setIsDisabledDeleteButton(false);
  }, [selectThemeId]);

  useEffect(() => {
    if (selectThemeId === selectedThemeId) {
      setIsDisabledSaveButton(true);
    } else {
      setIsDisabledSaveButton(false);
    }

    if (
      changeCurrentColorAccent &&
      changeCurrentColorButtons &&
      isAddThemeDialog
    ) {
      setShowSaveButtonDialog(true);
    }

    if (
      (changeCurrentColorAccent || changeCurrentColorButtons) &&
      isEditDialog
    ) {
      setShowSaveButtonDialog(true);
    }

    if (
      !changeCurrentColorAccent &&
      !changeCurrentColorButtons &&
      isEditDialog
    ) {
      setShowSaveButtonDialog(false);
    }
  }, [
    selectedThemeId,
    selectThemeId,
    changeCurrentColorAccent,
    changeCurrentColorButtons,
    isAddThemeDialog,
    isEditDialog,
    previewAccent,
  ]);

  const onColorCheckImgHover = useCallback(
    (e) => {
      const id = e.target.id;
      if (!id) return;

      const img = appearanceTheme.find((aTheme) => aTheme.id == id).text
        ?.accent;

      setColorCheckImgHover(img);
    },
    [appearanceTheme],
  );

  const onColorSelection = useCallback(
    (e) => {
      const currentTheme = e.currentTarget;
      const id = +currentTheme.id;
      const accent = appearanceTheme.find((aTheme) => aTheme.id == id).main
        ?.accent;

      setPreviewAccent(accent);
      setSelectThemeId(id);
      saveToSessionStorage("selectColorId", id);
      saveToSessionStorage("selectColorAccent", accent);
    },
    [appearanceTheme, setPreviewAccent, setSelectThemeId],
  );

  const onSave = useCallback(async () => {
    setIsDisabledSaveButton(true);

    if (!selectThemeId) return;

    try {
      await api.settings.sendAppearanceTheme({ selected: selectThemeId });
      await getAppearanceTheme();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }
    saveToSessionStorage("selectColorId", selectThemeId);
    saveToSessionStorage("defaultColorId", selectThemeId);
    saveToSessionStorage("selectColorAccent", previewAccent);
    saveToSessionStorage("defaultColorAccent", previewAccent);
  }, [selectThemeId, setIsDisabledSaveButton, getAppearanceTheme]);

  // Open HexColorPicker
  const onClickColor = (e) => {
    if (e.target.id === "accent") {
      setOpenHexColorPickerAccent(true);
      setOpenHexColorPickerButtons(false);
    } else {
      setOpenHexColorPickerButtons(true);
      setOpenHexColorPickerAccent(false);
    }
  };

  const onCloseDialogDelete = () => {
    setVisibleDialog(false);
  };

  const onClickDeleteModal = useCallback(async () => {
    try {
      await api.settings.deleteAppearanceTheme(selectThemeId);
      await getAppearanceTheme();

      if (selectedThemeId !== selectThemeId) {
        setSelectThemeId(selectedThemeId);
        setPreviewAccent(currentColorScheme.main?.accent);
      }

      if (selectedThemeId === selectThemeId) {
        setSelectThemeId(appearanceTheme[0].id);
        setPreviewAccent(appearanceTheme[0].main?.accent);
      }

      saveToSessionStorage("selectColorId", appearanceTheme[0].id);
      saveToSessionStorage(
        "selectColorAccent",
        appearanceTheme[0].main?.accent,
      );

      onCloseDialogDelete();

      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }
  }, [selectThemeId, selectedThemeId, onCloseDialogDelete, getAppearanceTheme]);

  const onCloseColorSchemeDialog = () => {
    if ((openHexColorPickerAccent || openHexColorPickerButtons) && isMobile())
      return;

    setShowColorSchemeDialog(false);

    setOpenHexColorPickerAccent(false);
    setOpenHexColorPickerButtons(false);

    setChangeCurrentColorAccent(false);
    setChangeCurrentColorButtons(false);

    setIsEditDialog(false);
    setIsAddThemeDialog(false);

    setShowSaveButtonDialog(false);

    setCurrentColorAccent(null);
    setCurrentColorButtons(null);

    setAppliedColorAccent(defaultAppliedColorAccent);
    setAppliedColorButtons(defaultAppliedColorButtons);
  };

  const onAddTheme = () => {
    if (!abilityAddTheme) return;
    setIsAddThemeDialog(true);

    setHeaderColorSchemeDialog(headerAddTheme);

    setShowColorSchemeDialog(true);
  };

  const onClickEdit = () => {
    appearanceTheme.forEach((item) => {
      if (item.id === selectThemeId) {
        setCurrentColorAccent(item.main?.accent.toUpperCase());
        setCurrentColorButtons(item.main.buttons.toUpperCase());

        setAppliedColorAccent(item.main?.accent.toUpperCase());
        setAppliedColorButtons(item.main.buttons.toUpperCase());
      }
    });

    setIsEditDialog(true);

    setHeaderColorSchemeDialog(headerEditTheme);

    setShowColorSchemeDialog(true);
  };

  const onCloseHexColorPickerAccent = useCallback(() => {
    setOpenHexColorPickerAccent(false);
    if (!currentColorAccent) return;
    setAppliedColorAccent(currentColorAccent);
  }, [currentColorAccent, setOpenHexColorPickerAccent, setAppliedColorAccent]);

  const onCloseHexColorPickerButtons = useCallback(() => {
    setOpenHexColorPickerButtons(false);
    if (!currentColorButtons) return;
    setAppliedColorButtons(currentColorButtons);
  }, [
    currentColorButtons,
    setOpenHexColorPickerButtons,
    setAppliedColorButtons,
  ]);

  const onAppliedColorAccent = useCallback(
    (color) => {
      if (color.toUpperCase() !== currentColorAccent) {
        setChangeCurrentColorAccent(true);
      }

      setCurrentColorAccent(color);
      saveToSessionStorage("selectColorAccent", color);

      setOpenHexColorPickerAccent(false);
    },
    [
      currentColorAccent,
      setChangeCurrentColorAccent,
      setOpenHexColorPickerAccent,
    ],
  );

  const onAppliedColorButtons = useCallback(
    (color) => {
      if (color.toUpperCase() !== currentColorButtons) {
        setChangeCurrentColorButtons(true);
      }

      setCurrentColorButtons(color);

      setOpenHexColorPickerButtons(false);
    },
    [
      currentColorButtons,
      setChangeCurrentColorButtons,
      setOpenHexColorPickerButtons,
    ],
  );

  const onSaveNewThemes = useCallback(
    async (newTheme) => {
      try {
        await api.settings.sendAppearanceTheme({ theme: newTheme });
        await getAppearanceTheme();

        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    },
    [getAppearanceTheme],
  );

  const onSaveChangedThemes = useCallback(
    async (editTheme) => {
      try {
        await api.settings.sendAppearanceTheme({ theme: editTheme });
        await getAppearanceTheme();
        setPreviewAccent(editTheme.main?.accent);

        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    },
    [getAppearanceTheme],
  );

  const onSaveColorSchemeDialog = () => {
    const textColorAccent = getTextColor(currentColorAccent);
    const textColorButtons = getTextColor(currentColorButtons);

    if (isAddThemeDialog) {
      // Saving a new custom theme
      const newTheme = {
        main: {
          accent: currentColorAccent,
          buttons: currentColorButtons,
        },
        text: {
          accent: textColorAccent,
          buttons: textColorButtons,
        },
      };

      onSaveNewThemes(newTheme);

      setCurrentColorAccent(null);
      setCurrentColorButtons(null);

      onCloseColorSchemeDialog();

      return;
    }

    // Editing themes
    const editTheme = {
      id: selectThemeId,
      main: {
        accent: currentColorAccent,
        buttons: currentColorButtons,
      },
      text: {
        accent: textColorAccent,
        buttons: textColorButtons,
      },
    };

    onSaveChangedThemes(editTheme);

    setCurrentColorAccent(appliedColorAccent);
    setCurrentColorButtons(appliedColorButtons);

    onCloseColorSchemeDialog();
  };

  const onOpenDialogDelete = () => {
    setVisibleDialog(true);
  };

  const nodeHexColorPickerButtons = isMobile() ? (
    <ModalDialog
      visible={openHexColorPickerButtons}
      onClose={onCloseHexColorPickerButtons}
      blur={8}
      autoMaxHeight
    >
      <ModalDialog.Body>
        <StyledBodyContent>
          <ColorPicker
            id="buttons-hex"
            onClose={onCloseHexColorPickerButtons}
            onApply={onAppliedColorButtons}
            appliedColor={appliedColorButtons}
            applyButtonLabel={t("Common:ApplyButton")}
            cancelButtonLabel={t("Common:CancelButton")}
            hexCodeLabel={t("Settings:HexCode")}
          />
        </StyledBodyContent>
      </ModalDialog.Body>
    </ModalDialog>
  ) : (
    <DropDown
      directionX="right"
      manualY="62px"
      withBackdrop={false}
      isDefaultMode={false}
      open={openHexColorPickerButtons}
      clickOutsideAction={onCloseHexColorPickerButtons}
    >
      <DropDownItem className="drop-down-item-hex">
        <ColorPicker
          id="buttons-hex"
          onClose={onCloseHexColorPickerButtons}
          onApply={onAppliedColorButtons}
          appliedColor={appliedColorButtons}
          applyButtonLabel={t("Common:ApplyButton")}
          cancelButtonLabel={t("Common:CancelButton")}
          hexCodeLabel={t("Settings:HexCode")}
        />
      </DropDownItem>
    </DropDown>
  );

  const nodeHexColorPickerAccent = isMobile() ? (
    <ModalDialog
      visible={openHexColorPickerAccent}
      onClose={onCloseHexColorPickerAccent}
      blur={8}
      autoMaxHeight
    >
      <ModalDialog.Body>
        <StyledBodyContent>
          <ColorPicker
            id="accent-hex"
            onClose={onCloseHexColorPickerAccent}
            onApply={onAppliedColorAccent}
            appliedColor={appliedColorAccent}
            applyButtonLabel={t("Common:ApplyButton")}
            cancelButtonLabel={t("Common:CancelButton")}
          />
        </StyledBodyContent>
      </ModalDialog.Body>
    </ModalDialog>
  ) : (
    <DropDown
      directionX="right"
      manualY="62px"
      withBackdrop={false}
      isDefaultMode={false}
      open={openHexColorPickerAccent}
      clickOutsideAction={onCloseHexColorPickerAccent}
    >
      <DropDownItem className="drop-down-item-hex">
        <ColorPicker
          id="accent-hex"
          onClose={onCloseHexColorPickerAccent}
          onApply={onAppliedColorAccent}
          appliedColor={appliedColorAccent}
          applyButtonLabel={t("Common:ApplyButton")}
          cancelButtonLabel={t("Common:CancelButton")}
        />
      </DropDownItem>
    </DropDown>
  );

  const textTooltip = () => {
    return (
      <Text fontSize="12px" noSelect>
        {t("Settings:LimitThemesTooltip")}
      </Text>
    );
  };

  const buttonSize =
    currentDeviceType === DeviceType.desktop ? "small" : "normal";

  return !tReady ? (
    <Loader />
  ) : (
    <>
      <ModalDialogDelete
        visible={visibleDialog}
        onClose={onCloseDialogDelete}
        onClickDelete={onClickDeleteModal}
      />

      <StyledComponent
        colorCheckImg={colorCheckImg}
        isShowDeleteButton={isShowDeleteButton}
      >
        <div className="header">{t("Common:Color")}</div>

        <div className="theme-standard-container">
          <div className="theme-name">{t("Common:Standard")}</div>

          <div className="theme-container">
            {appearanceTheme.map((item) => {
              if (!item.name) return;
              return (
                <StyledTheme
                  key={item.name}
                  id={item.id}
                  colorCheckImgHover={colorCheckImgHover}
                  style={{ background: item.main?.accent }}
                  onClick={onColorSelection}
                  onMouseOver={onColorCheckImgHover}
                  data-testid={`appearance_standard_theme_${item.id}`}
                >
                  {selectThemeId === item.id ? (
                    <ReactSVG className="check-img" src={CheckWhiteSvgUrl} />
                  ) : null}

                  {selectThemeId !== item.id ? checkImgHover : null}
                </StyledTheme>
              );
            })}
          </div>
        </div>

        <div className="theme-custom-container">
          <div className="theme-name">{t("Common:Custom")}</div>

          <div className="theme-container">
            <div className="custom-themes">
              {appearanceTheme.map((item) => {
                if (item.name) return;
                return (
                  <StyledTheme
                    key={item.id}
                    id={item.id}
                    style={{ background: item.main?.accent }}
                    colorCheckImgHover={colorCheckImgHover}
                    onClick={onColorSelection}
                    onMouseOver={onColorCheckImgHover}
                    data-testid={`appearance_custom_theme_${item.id}`}
                  >
                    {selectThemeId === item.id ? (
                      <ReactSVG className="check-img" src={CheckWhiteSvgUrl} />
                    ) : null}
                    {selectThemeId !== item.id ? checkImgHover : null}
                  </StyledTheme>
                );
              })}
            </div>

            <div
              data-tooltip-id="theme-add"
              data-tip="tooltip"
              className="theme-add"
              data-testid="appearance_add_theme"
              onClick={onAddTheme}
            />
            {!abilityAddTheme ? (
              <Tooltip
                id="theme-add"
                offsetBottom={0}
                offsetRight={130}
                place="bottom"
                getContent={textTooltip}
                maxWidth="300px"
              />
            ) : null}
          </div>
        </div>

        <ColorSchemeDialog
          onClickColor={onClickColor}
          currentColorAccent={currentColorAccent}
          currentColorButtons={currentColorButtons}
          nodeHexColorPickerAccent={nodeHexColorPickerAccent}
          nodeHexColorPickerButtons={nodeHexColorPickerButtons}
          visible={showColorSchemeDialog}
          onClose={onCloseColorSchemeDialog}
          header={headerColorSchemeDialog}
          // viewMobile={isMobileOnly}
          openHexColorPickerButtons={openHexColorPickerButtons}
          openHexColorPickerAccent={openHexColorPickerAccent}
          showSaveButtonDialog={showSaveButtonDialog}
          onSaveColorSchemeDialog={onSaveColorSchemeDialog}
        />
        <div className="header preview-header">
          {t("Common:Preview")}
          <HelpButton
            place="right"
            dataTestId="appearance_preview_help_button"
            tooltipContent={
              <div>
                <Text fontSize="12px" fontWeight={400}>
                  {t("Settings:PreviewTooltipDescription")}
                </Text>
                <Link
                  isHovered
                  type="page"
                  href={appearanceBlockHelpUrl}
                  target="_blank"
                  dataTestId="appearance_preview_help_button_link"
                >
                  {t("Common:LearnMore")}
                </Link>
              </div>
            }
          />
        </div>
        <Tabs
          items={arrayItems}
          type={TabsTypes.Secondary}
          onSelect={(e) => setSelectedItemId(e.id)}
          selectedItemId={selectedItemId}
          isLoading={!tReady}
          scaled
        />

        <div className="buttons-container">
          <Button
            className="save button"
            label={t("Common:SaveButton")}
            onClick={onSave}
            primary
            size={buttonSize}
            isDisabled={isDisabledSaveButton}
            testId="appearance_save_button"
          />

          <Button
            className="edit-current-theme button"
            label={t("Common:EditButton")}
            onClick={onClickEdit}
            size={buttonSize}
            isDisabled={isDisabledEditButton}
            testId="appearance_edit_button"
          />
          {isShowDeleteButton ? (
            <Button
              className="delete-theme button"
              label={t("Settings:DeleteTheme")}
              onClick={onOpenDialogDelete}
              size={buttonSize}
              isDisabled={isDisabledDeleteButton}
              testId="appearance_delete_button"
            />
          ) : null}
        </div>
      </StyledComponent>
    </>
  );
};

export default inject(({ settingsStore, common }) => {
  const {
    appearanceTheme,
    selectedThemeId,

    getAppearanceTheme,
    currentColorScheme,

    theme,
    currentDeviceType,

    appearanceBlockHelpUrl,
  } = settingsStore;

  const { resetIsInit } = common;

  return {
    appearanceTheme,
    selectedThemeId,

    getAppearanceTheme,
    currentColorScheme,

    currentDeviceType,
    theme,
    resetIsInit,

    appearanceBlockHelpUrl,
  };
})(withTranslation(["Profile", "Common", "Settings"])(observer(Appearance)));
