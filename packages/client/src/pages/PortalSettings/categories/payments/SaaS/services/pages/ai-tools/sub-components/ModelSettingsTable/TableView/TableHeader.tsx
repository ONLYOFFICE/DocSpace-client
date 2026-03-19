import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { TableHeader } from "@docspace/ui-kit/components/table";

type TableHeaderProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  sectionWidth: number;
  itemHeight: number;
  aiModelsCurrencySymbol?: string;
};

const ModelSettingsTableHeader = (props: TableHeaderProps) => {
  const { aiModelsCurrencySymbol } = props;
  const { t } = useTranslation(["Services"]);

  const defaultColumns = [
    {
      key: "Model",
      title: t("AIModel"),
      enable: true,
      resizable: true,
      default: true,
      active: true,
      minWidth: 240,
    },
    {
      key: "Input",
      title: t("InputCurrency", { currency: aiModelsCurrencySymbol }),
      enable: true,
      resizable: true,
      minWidth: 120,
    },
    {
      key: "Output",
      title: t("OutputCurrency", { currency: aiModelsCurrencySymbol }),
      enable: true,
      resizable: true,
      minWidth: 120,
    },
    {
      key: "OffOn",
      title: t("OffOn"),
      enable: true,
      resizable: true,
      minWidth: 90,
    },
  ];

  return (
    <TableHeader
      columns={defaultColumns}
      showSettings={false}
      useReactWindow
      {...props}
    />
  );
};

export default inject(({ servicesStore }: TStore) => {
  const { aiModelsCurrencySymbol } = servicesStore;

  return {
    aiModelsCurrencySymbol,
  };
})(observer(ModelSettingsTableHeader));
