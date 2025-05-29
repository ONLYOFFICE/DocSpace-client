import FlowsApi from "../../api/flows/flows.api";

const flowsApi = new FlowsApi("/onlyflow/api/v1", "");

export const vectorizeFiles = async (filesId: (string | number)[]) => {
  const input = filesId.join(",");
  const flow = await flowsApi.getFlow("ab41d318-98ac-49a1-aac3-942aca80869e");

  const response = await flowsApi.runFlow(flow, input);

  return response;
};
