import InvalidError from "@/components/Invalid";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  return <InvalidError match={searchParams} />;
}

export default Page;
