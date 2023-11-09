import { useTranslation } from "react-i18next";

//@ts-ignore
import TableHeader from "@docspace/components/table-container/TableHeader";

import { HeaderProps } from "./TableView.types";

const Header = (props: HeaderProps) => {
  const { sectionWidth, tableRef, columnStorageName, tagRef } = props;
  const { t } = useTranslation(["Common"]);

  const defaultColumns: {
    [key: string]:
      | string
      | number
      | boolean
      | ((key: string, e: any) => void | undefined);
  }[] = [
    {
      key: "App",
      title: "Applications",
      resizable: true,
      enable: true,
      default: true,
      active: false,
      minWidth: 210,
    },
    {
      key: "Website",
      title: "Website",
      resizable: true,
      enable: true,
      minWidth: 150,
    },
    {
      key: "Access granted",
      title: "Access granted",
      resizable: true,
      enable: true,
      minWidth: 150,
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
      tagRef={tagRef}
    />
  );
};

export default Header;
