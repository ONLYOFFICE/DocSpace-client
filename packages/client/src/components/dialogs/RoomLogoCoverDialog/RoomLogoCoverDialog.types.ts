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

import type { TTranslation } from "@docspace/shared/types";
import { TColorScheme } from "@docspace/shared/themes";
import FilesStore from "SRC_DIR/store/FilesStore";

export interface ICover {
  data: string;
  id: string;
}

export interface ILogo {
  color: string;
  cover: ICover;
}

export interface ILogoCover {
  color: string;
  cover: string;
}

interface IRoomCoverDialogProps {
  icon: string | null | ILogo;
  color: string | null;
  title: string | null;
  withoutIcon: boolean;
  withSelection: boolean;
  customColor: string | null;
}

export interface RoomLogoCoverProps {
  isBaseTheme?: boolean;
  logo?: ILogo;
  title?: string;
  covers?: ICover[] | undefined;
  setCover: (color: string, icon: string | ICover) => void;
  cover: ILogoCover;
  setRoomCoverDialogProps: (params: IRoomCoverDialogProps) => void;
  roomCoverDialogProps: IRoomCoverDialogProps;
  forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  scrollHeight: string;
  currentColorScheme: TColorScheme;
  openColorPicker: boolean;
  setOpenColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  generalScroll: boolean;
  isScrollLocked: boolean;
}

export type CoverDialogProps = RoomLogoCoverProps & {
  setRoomLogoCover: VoidFunction;
  covers?: ICover[] | undefined;
  getCovers: VoidFunction;
  setRoomLogoCoverDialogVisible: (value: boolean) => void;
  createRoomDialogVisible: boolean;
  editRoomDialogPropsVisible: boolean;
  createAgentDialogVisible: boolean;
  editAgentDialogVisible: boolean;
  roomLogoCoverDialogVisible: boolean;
  templateEventVisible: boolean;
  setEnabledHotkeys?: FilesStore["setEnabledHotkeys"];
};

export interface CustomLogoProps {
  color: string | null;
  icon: string | ILogo | ICover | ILogoCover | null;
  withoutIcon: boolean;
  isBaseTheme: boolean;
  roomTitle: string;
}

export interface SelectColorProps {
  t: TTranslation;
  logoColors: string[];
  selectedColor: string | null;
  onChangeColor: (value: string) => void;
  roomColor: string | null;
  openColorPicker: boolean;
  setOpenColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SelectIconProps {
  t: TTranslation;
  withoutIcon: boolean;
  setWithoutIcon: (value: boolean) => void;
  setIcon: (icon: string | ILogo | null) => void;
  covers?: ICover[];
  $currentColorScheme: TColorScheme;
  coverId: string;
}
