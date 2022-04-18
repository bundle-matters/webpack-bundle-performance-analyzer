import { SpeedMeasureDescriptor } from "./interface";

export function outputAsTsv(results: SpeedMeasureDescriptor): string {
  const lines = ['Module\tTime'];

  results.forEach((bundle, index) => {
    if (index > 0) {
      // Separate bundles by empty line
      lines.push('');
    }

    Object.entries(bundle.files)
      .map<[string, number]>(([source, data]) => [source, data.size])
      .sort(sortFilesBySize)
      .forEach(([source, size]) => {
        lines.push(`${source}\t${size}`);
      });
  });

  return lines.join(os.EOL);
}
