// @ts-expect-error TS(7016): Could not find a declaration file for module 'csvj... Remove this comment to see the full error message
import json_beautifier from "csvjson-json_beautifier";

export function beautifyJSON(jsonString: any) {
  return json_beautifier(JSON.parse(jsonString), {
    inlineShortArrays: true,
  });
}
