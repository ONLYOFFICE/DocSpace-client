import InvalidError from "@/components/Invalid";

async function Page(
  props: {
    searchParams: Promise<{ [key: string]: string }>;
  }
) {
  const searchParams = await props.searchParams;
  return <InvalidError match={searchParams} />;
}

export default Page;
