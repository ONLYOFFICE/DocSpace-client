import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget, LinkType } from "@docspace/ui-kit/components/link";
import { RowContent as RowContentComponent } from "@docspace/ui-kit/components/rows";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";

import { RowContentProps } from "./RowView.types";
import styles from "../../authorized-apps.module.scss";

export const RowContent = ({ sectionWidth, item }: RowContentProps) => {
  return (
    <RowContentComponent
      sectionWidth={sectionWidth}
      className={styles.rowContent}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.flexWrapper}>
          <Text
            fontWeight={600}
            fontSize="14px"
            style={{ marginInlineEnd: "8px" }}
          >
            {item.name}
          </Text>
        </div>

        <Text fontWeight={600} fontSize="12px" color={globalColors.gray}>
          <Link
            color={globalColors.gray}
            href={item.websiteUrl}
            type={LinkType.page}
            target={LinkTarget.blank}
            isHovered
            dataTestId="website_link"
          >
            {item.websiteUrl}
          </Link>
        </Text>
      </div>
      <div />
    </RowContentComponent>
  );
};
