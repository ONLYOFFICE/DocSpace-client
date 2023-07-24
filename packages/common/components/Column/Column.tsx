import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useEffect, useState } from "react";

import { ColumnContainer, ColumnHeader, ColumnBody } from "./Column.styled";
import ColumnHeaderContent from "./ColumnHeaderContent";
import ColumnBodyContent from "./ColumnBodyContent";

import type { ColumnProps } from "./Column.props";

import { StoreType } from "SRC_DIR/types";

function Column(props: ColumnProps) {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    props.fetchFilesByRole?.(props.role.id).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <ColumnContainer>
      <ColumnHeader>
        <ColumnHeaderContent role={props.role} getModel={props.getModel} />
      </ColumnHeader>
      <ColumnBody>
        <ColumnBodyContent
          isLoading={isLoading}
          filesByRole={props.filesByRole?.get(props.role.id)}
        />
      </ColumnBody>
    </ColumnContainer>
  );
}

export default inject<StoreType>(({ dashboardStore }) => {
  const { filesByRole, fetchFilesByRole } = dashboardStore;

  return { filesByRole, fetchFilesByRole };
})(observer(Column));
