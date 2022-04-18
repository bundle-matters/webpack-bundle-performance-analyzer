import { Command, Option } from 'clipanion';
import * as t from 'typanion';

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

  filename = Option.String('--filename');

  async execute() {
    this.context.stdout.write(`Print ${this.format} ${this.file}!\n`);
  }
}
