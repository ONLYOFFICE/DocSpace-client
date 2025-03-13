import axios from "axios";

export async function sendMessage(
  baseUrl: string,
  flowId: string,
  message: string,
  input_type: string,
  output_type: string,
  sessionId: React.MutableRefObject<string>,
  output_component?: string,
  tweaks?: Object,
  api_key?: string,
  additional_headers?: { [key: string]: string },
  bearer_token?: string
) {
  const data: { [key: string]: unknown } = {
    input_type,
    input_value: message,
    output_type,
  };

  if (tweaks) {
    data["tweaks"] = tweaks;
  }
  if (output_component) {
    data["output_component"] = output_component;
  }
  let headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };

  if (bearer_token) {
    headers["Authorization"] = `Bearer ${bearer_token}`;
  }

  if (api_key) {
    headers["x-api-key"] = api_key;
  }
  if (additional_headers) {
    headers = Object.assign(headers, additional_headers);
  }
  if (sessionId.current && sessionId.current !== "") {
    data.session_id = sessionId.current;
  }
  const response = await axios.post(
    `${baseUrl}/onlyflow/api/v1/run/${flowId}`,
    data,
    {
      headers,
    }
  );

  return response;
}
