import chalk from "chalk";

export const fg = (text: string, time: number) => {
  let textModifier = chalk.bold;
  if (time > 10000) textModifier = textModifier.red;
  else if (time > 2000) textModifier = textModifier.yellow;
  else textModifier = textModifier.green;

  return textModifier(text);
};

export const bg = (text: string) => chalk.bgBlack.green.bold(text);
