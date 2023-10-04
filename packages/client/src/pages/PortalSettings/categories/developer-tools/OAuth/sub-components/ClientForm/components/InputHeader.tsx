import Text from "@docspace/components/text";

const InputHeader = ({ header }: { header: string }) => {
  return (
    <Text
      fontSize={"13px"}
      fontWeight={600}
      lineHeight={"20px"}
      title={header}
      tag={""}
      as={"p"}
      color={""}
      textAlign={""}
    >
      {header}
    </Text>
  );
};

export default InputHeader;
