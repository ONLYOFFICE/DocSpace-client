﻿import CheckWhiteSvgUrl from "PUBLIC_DIR/images/check.white.svg?url";
import { useState, useEffect, useCallback, useMemo } from "react";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";
import { inject, observer } from "mobx-react";
import { Button } from "@docspace/shared/components/button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { Text } from "@docspace/shared/components/text";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import Preview from "./Appearance/preview";
import { saveToSessionStorage, getFromSessionStorage } from "../../utils";
import ColorSchemeDialog from "./sub-components/colorSchemeDialog";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { DropDown } from "@docspace/shared/components/drop-down";
import api from "@docspace/shared/api";
import Loader from "./sub-components/loaderAppearance";

import { StyledComponent, StyledTheme } from "./Appearance/StyledApperance.js";
import { ReactSVG } from "react-svg";
import ModalDialogDelete from "./sub-components/modalDialogDelete";
import hexToRgba from "hex-to-rgba";
import { isMobile } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";

import { ColorPicker } from "@docspace/shared/components/color-picker";

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
    defaultAppliedColorAccent
  );
  const [appliedColorButtons, setAppliedColorButtons] = useState(
    defaultAppliedColorButtons
  );

  const [changeCurrentColorAccent, setChangeCurrentColorAccent] =
    useState(false);
  const [changeCurrentColorButtons, setChangeCurrentColorButtons] =
    useState(false);

  const [isSmallWindow, setIsSmallWindow] = useState(false);

  const [showSaveButtonDialog, setShowSaveButtonDialog] = useState(false);

  const [isEditDialog, setIsEditDialog] = useState(false);
  const [isAddThemeDialog, setIsAddThemeDialog] = useState(false);

  const [previewAccent, setPreviewAccent] = useState(
    currentColorScheme.main?.accent
  );

  const [colorCheckImg, setColorCheckImg] = useState(
    currentColorScheme.text?.accent
  );
  const [colorCheckImgHover, setColorCheckImgHover] = useState(
    currentColorScheme.text?.accent
  );

  const [selectThemeId, setSelectThemeId] = useState(selectedThemeId);

  const [isDisabledSaveButton, setIsDisabledSaveButton] = useState(true);

  const [abilityAddTheme, setAbilityAddTheme] = useState(true);

  const [isDisabledEditButton, setIsDisabledEditButton] = useState(true);
  const [isDisabledDeleteButton, setIsDisabledDeleteButton] = useState(true);
  const [isShowDeleteButton, setIsShowDeleteButton] = useState(false);

  const [visibleDialog, setVisibleDialog] = useState(false);

  const [theme, setTheme] = useState(appearanceTheme);

  const array_items = useMemo(
    () => [
      {
        id: "light-theme",
        key: "0",
        title: t("Profile:LightTheme"),
        content: (
          <Preview
            appliedColorAccent={appliedColorAccent}
            previewAccent={previewAccent}
            selectThemeId={selectThemeId}
            colorCheckImg={colorCheckImg}
            themePreview="Light"
          />
        ),
      },
      {
        id: "dark-theme",
        key: "1",
        title: t("Profile:DarkTheme"),
        content: (
          <Preview
            appliedColorAccent={appliedColorAccent}
            previewAccent={previewAccent}
            selectThemeId={selectThemeId}
            colorCheckImg={colorCheckImg}
            themePreview="Dark"
          />
        ),
      },
    ],
    [previewAccent, selectThemeId, colorCheckImg, tReady]
  );

  const getSettings = () => {
    const selectColorId = getFromSessionStorage("selectColorId");
    const defaultColorId = selectedThemeId;
    saveToSessionStorage("defaultColorId", defaultColorId);
    if (selectColorId) {
      setSelectThemeId(selectColorId);
    } else {
      setSelectThemeId(defaultColorId);
    }
  };

  useEffect(() => {
    getSettings();
    setDocumentTitle(t("Appearance"));
  }, []);

  useEffect(() => {
    saveToSessionStorage("selectColorId", selectThemeId);
  }, [selectThemeId]);

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => {
      window.removeEventListener("resize", onCheckView);
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

    if (appearanceTheme.find((theme) => theme.id == selectThemeId).name) {
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

  const onColorCheck = useCallback(
    (themes) => {
      const colorCheckImg = themes.find((theme) => theme.id == selectThemeId)
        ?.text?.accent;

      setColorCheckImg(colorCheckImg);
    },
    [selectThemeId]
  );

  const onColorCheckImgHover = useCallback(
    (e) => {
      const id = e.target.id;
      if (!id) return;

      const colorCheckImg = appearanceTheme.find((theme) => theme.id == id).text
        ?.accent;

      setColorCheckImgHover(colorCheckImg);
    },
    [appearanceTheme]
  );

  const onCheckView = () => {
    if (isMobile()) {
      setIsSmallWindow(true);
    } else {
      setIsSmallWindow(false);
    }
  };

  const onColorSelection = useCallback(
    (e) => {
      const theme = e.currentTarget;
      const id = +theme.id;
      const accent = appearanceTheme.find((theme) => theme.id == id).main
        ?.accent;

      setPreviewAccent(accent);
      setSelectThemeId(id);
      saveToSessionStorage("selectColorId", id);
      saveToSessionStorage("selectColorAccent", accent);
    },
    [appearanceTheme, setPreviewAccent, setSelectThemeId]
  );

  const onSave = useCallback(async () => {
    setIsDisabledSaveButton(true);

    if (!selectThemeId) return;

    try {
      await api.settings.sendAppearanceTheme({ selected: selectThemeId });
      await getAppearanceTheme();
      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
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
        appearanceTheme[0].main?.accent
      );

      onCloseDialogDelete();

      toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }
  }, [selectThemeId, selectedThemeId, onCloseDialogDelete, getAppearanceTheme]);

  const onCloseColorSchemeDialog = () => {
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
    appearanceTheme.map((item) => {
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

  const getTextColor = (color) => {
    const black = "#333333";
    const white = "#FFFFFF";

    const rgba = hexToRgba(color)
      .replace("rgba(", "")
      .replace(")", "")
      .split(", ");

    const r = rgba[0];
    const g = rgba[1];
    const b = rgba[2];

    const textColor =
      (r * 299 + g * 587 + b * 114) / 1000 > 128 ? black : white;

    return textColor;
  };

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
    ]
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
    ]
  );

  const onSaveNewThemes = useCallback(
    async (theme) => {
      try {
        await api.settings.sendAppearanceTheme({ theme: theme });
        await getAppearanceTheme();

        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    },
    [getAppearanceTheme]
  );

  const onSaveChangedThemes = useCallback(
    async (editTheme) => {
      try {
        await api.settings.sendAppearanceTheme({ theme: editTheme });
        await getAppearanceTheme();
        setPreviewAccent(editTheme.main?.accent);

        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      } catch (error) {
        toastr.error(error);
      }
    },
    [getAppearanceTheme]
  );

  const onSaveColorSchemeDialog = () => {
    const textColorAccent = getTextColor(currentColorAccent);
    const textColorButtons = getTextColor(currentColorButtons);

    if (isAddThemeDialog) {
      // Saving a new custom theme
      const theme = {
        main: {
          accent: currentColorAccent,
          buttons: currentColorButtons,
        },
        text: {
          accent: textColorAccent,
          buttons: textColorButtons,
        },
      };

      onSaveNewThemes(theme);

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

  const onCloseDialogDelete = () => {
    setVisibleDialog(false);
  };

  const onOpenDialogDelete = () => {
    setVisibleDialog(true);
  };

  const nodeHexColorPickerButtons = (
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

  const nodeHexColorPickerAccent = (
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
            {appearanceTheme.map((item, index) => {
              if (!item.name) return;
              return (
                <StyledTheme
                  key={index}
                  id={item.id}
                  colorCheckImgHover={colorCheckImgHover}
                  style={{ background: item.main?.accent }}
                  onClick={onColorSelection}
                  onMouseOver={onColorCheckImgHover}
                >
                  {selectThemeId === item.id && (
                    <ReactSVG className="check-img" src={CheckWhiteSvgUrl} />
                  )}

                  {selectThemeId !== item.id && checkImgHover}
                </StyledTheme>
              );
            })}
          </div>
        </div>

        <div className="theme-custom-container">
          <div className="theme-name">{t("Settings:Custom")}</div>

          <div className="theme-container">
            <div className="custom-themes">
              {appearanceTheme.map((item, index) => {
                if (item.name) return;
                return (
                  <StyledTheme
                    key={index}
                    id={item.id}
                    style={{ background: item.main?.accent }}
                    colorCheckImgHover={colorCheckImgHover}
                    onClick={onColorSelection}
                    onMouseOver={onColorCheckImgHover}
                  >
                    {selectThemeId === item.id && (
                      <ReactSVG className="check-img" src={CheckWhiteSvgUrl} />
                    )}
                    {selectThemeId !== item.id && checkImgHover}
                  </StyledTheme>
                );
              })}
            </div>

            <div
              data-tooltip-id="theme-add"
              data-tip="tooltip"
              className="theme-add"
              onClick={onAddTheme}
            />
            {!abilityAddTheme && (
              <Tooltip
                id="theme-add"
                offsetBottom={0}
                offsetRight={130}
                place="bottom"
                getContent={textTooltip}
                maxWidth="300px"
              />
            )}
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
        <div className="header preview-header">{t("Common:Preview")}</div>
        <TabsContainer elements={array_items} />

        <div className="buttons-container">
          <Button
            className="save button"
            label={t("Common:SaveButton")}
            onClick={onSave}
            primary
            size={buttonSize}
            isDisabled={isDisabledSaveButton}
          />

          <Button
            className="edit-current-theme button"
            label={t("Common:EditButton")}
            onClick={onClickEdit}
            size={buttonSize}
            isDisabled={isDisabledEditButton}
          />
          {isShowDeleteButton && (
            <Button
              className="delete-theme button"
              label={t("Settings:DeleteTheme")}
              onClick={onOpenDialogDelete}
              size={buttonSize}
              isDisabled={isDisabledDeleteButton}
            />
          )}
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
  };
})(withTranslation(["Profile", "Common", "Settings"])(observer(Appearance)));
