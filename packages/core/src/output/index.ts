import { SpeedMeasureDescriptor } from "../interface";
import { getHumanOutput } from "./utils";

export function outputAsJSON(output: SpeedMeasureDescriptor) {
  return JSON.stringify(output, null, 2);
}

export function outputAsHuman(output: SpeedMeasureDescriptor, options: {
  verbose?: boolean
} = {}) {
  return getHumanOutput(
    output,
    options,
  );
}

// TODO: implements as html
export function outputAsHTML(output: SpeedMeasureDescriptor) {
  return output.toString();
}
