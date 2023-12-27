import { StyledAvailableList } from "../../../ChangePortalOwnerDialog/StyledDialog";
import { Link, Text } from "@docspace/shared/components";

const Description = ({ t, dataReassignmentUrl }) => {
  return (
    <>
      <StyledAvailableList className="list-container">
        <Text className="list-item" noSelect>
          {t("DataReassignmentDialog:DescriptionDataReassignment")}
        </Text>
        <Text className="list-item" noSelect>
          {t("DataReassignmentDialog:NoteDataReassignment")}
        </Text>

        <Link
          target="_blank"
          isHovered
          fontWeight={600}
          style={{ textDecoration: "underline" }}
          href={dataReassignmentUrl}
        >
          {t("DataReassignmentDialog:MoreAboutDataTransfer")}
        </Link>
      </StyledAvailableList>
    </>
  );
};

export default Description;
