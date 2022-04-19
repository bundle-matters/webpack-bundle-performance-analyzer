import * as fs from 'fs';
import * as path from 'path';

import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { outputAsHuman } from '@webpack-bundle-performance/core';

export class PrintCommand extends Command {
  static usage = Command.Usage({
    category: `Output`,
    description: `Print with specific output format`,
    examples: [[
      'Print with tsv',
      `$0 `,
    ], [
      `A second example`,
      `$0 my-command --with-parameter`,
    ]],
  });

  file = Option.String();

  format = Option.String('-f,--format', {
    validator: t.isEnum(['tsv', 'json', 'html']),
  });

  outputFilename = Option.String('--filename');

  async execute() {
    const filePath = path.isAbsolute(this.file) ? this.file : path.resolve(process.cwd(), this.file);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not existed: ${filePath}`);
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    try {
      const jsonModule = JSON.parse(fileContent);
      this.context.stdout.write(outputAsHuman(jsonModule));
    } catch (err) {
      console.error((`Invalid json file: ${filePath}`));
      console.log(err);
    }
  }
}
