import Row from "@docspace/components/row";
import UsersTypeRowContent from "./UsersTypeRowContent";

const UsersTypeRow = ({
  isChecked,
  onChangeCheckbox,
  checkbox,
  data,
  id,
  sectionWidth,
  typeOptions,
}) => {
  const onChange = (checked) => {
    onChangeCheckbox(id, checked);
  };

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        key={data.id}
        data={data}
        checked={checkbox.includes(id)}
        checkbox={isChecked}
        onSelect={onChange}
        contextButtonSpacerWidth="0"
      >
        <UsersTypeRowContent
          sectionWidth={sectionWidth}
          displayName={data.displayName}
          email={data.email}
          type={data.type}
          typeOptions={typeOptions}
        />
      </Row>
    </>
  );
};

export default UsersTypeRow;
