import React from "react";
import moment from "moment";
import {
  TAvailableExternalRights,
  TFile,
  TFileLink,
} from "../../api/files/types";
import { ShareAccessRights } from "../../enums";
import { TOption } from "../combobox";

export type ShareCalendarProps = {
  onDateSet: (formattedDate: moment.Moment) => void;
  closeCalendar: (formattedDate: moment.Moment) => void;
  calendarRef: React.RefObject<HTMLDivElement>;
  locale: string;
};
export type TLink = TFileLink | { isLoaded: boolean };

export type LinkRowProps = {
  onAddClick: () => Promise<void>;
  links: TLink[] | null;
  changeShareOption: (item: TOption, link: TFileLink) => Promise<void>;
  changeAccessOption: (item: TOption, link: TFileLink) => Promise<void>;
  changeExpirationOption: (
    link: TFileLink,
    expirationDate: moment.Moment | null,
  ) => Promise<void>;
  availableExternalRights: TAvailableExternalRights;
  loadingLinks: (string | number)[];
};

export type ExpiredComboBoxProps = {
  link: TFileLink;
  changeExpirationOption: (
    link: TFileLink,
    expirationDate: moment.Moment | null,
  ) => Promise<void>;
  isDisabled?: boolean;
};

export type ShareProps = {
  infoPanelSelection: TFile;

  isRooms?: boolean;
  setView?: (view: string) => void;

  shareChanged?: boolean;
  setShareChanged?: (value: boolean) => void;

  getPrimaryFileLink?: (id: string | number) => Promise<TFileLink>;
  editFileLink?: (
    fileId: number | string,
    linkId: number | string,
    access: ShareAccessRights,
    primary: boolean,
    internal: boolean,
    expirationDate: moment.Moment,
  ) => Promise<TFileLink>;
  addFileLink?: (
    fileId: number | string,
    access: ShareAccessRights,
    primary: boolean,
    internal: boolean,
  ) => Promise<TFileLink>;
};
