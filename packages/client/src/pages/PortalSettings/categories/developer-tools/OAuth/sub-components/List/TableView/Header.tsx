import { useTranslation } from "react-i18next";

//@ts-ignore
import TableHeader from "@docspace/components/table-container/TableHeader";

import { HeaderProps } from "./TableView.types";

const Header = (props: HeaderProps) => {
  const { sectionWidth, tableRef, columnStorageName } = props;
  const { t } = useTranslation(["Webhooks", "Common"]);

  const defaultColumns: {
    [key: string]:
      | string
      | number
      | boolean
      | ((key: string, e: any) => void | undefined);
  }[] = [
    {
      key: "Name",
      title: t("Common:Name"),
      resizable: true,
      enable: true,
      default: true,
      active: false,
      minWidth: 210,
    },
    {
      key: "Description",
      title: "Description",
      resizable: true,
      enable: true,
      minWidth: 150,
    },
    {
      key: "Enable",
      title: "Enable",
      enable: true,
      resizable: false,
      defaultSize: 64,
    },
  ];

  return (
    <TableHeader
      checkboxSize="48px"
      containerRef={tableRef}
      columns={defaultColumns}
      columnStorageName={columnStorageName}
      sectionWidth={sectionWidth}
      checkboxMargin="12px"
      showSettings={false}
      useReactWindow
      infoPanelVisible={false}
    />
  );
};

export default Header;
