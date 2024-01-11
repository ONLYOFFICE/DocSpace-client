import json_beautifier from "csvjson-json_beautifier";

export function beautifyJSON(jsonString: string) {
  // @ts-expect-error no types
  return json_beautifier(JSON.parse(jsonString), {
    inlineShortArrays: true,
  });
}

export function isJSON(jsonString: string) {
  try {
    const parsedJson = JSON.parse(jsonString);
    return parsedJson && typeof parsedJson === "object";
  } catch (e) {
    return false;
  }
}

export function jsonify(value?: string, isJSONField?: boolean) {
  if (isJSONField && value && isJSON(value)) {
    return beautifyJSON(value);
  }
  return value;
}
