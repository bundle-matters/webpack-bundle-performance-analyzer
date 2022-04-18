import chalk from 'chalk';
import { fg, bg } from '../colours';
import { SpeedMeasureDescriptor } from '../interface';
import { groupBy, getAverages, getTotalActiveTime } from '../utils';

const MS_IN_MINUTE = 60000;
const MS_IN_SECOND = 1000;

const humanTime = (
  ms: number,
  options: {
    verbose?: boolean;
  } = {}
) => {
  if (options.verbose) {
    return ms.toLocaleString() + ' ms';
  }

  const minutes = Math.floor(ms / MS_IN_MINUTE);
  const secondsRaw = (ms - minutes * MS_IN_MINUTE) / MS_IN_SECOND;
  const secondsWhole = Math.floor(secondsRaw);
  const remainderPrecision = secondsWhole > 0 ? 2 : 3;
  const secondsRemainder = Math.min(secondsRaw - secondsWhole, 0.99);
  const seconds =
    secondsWhole +
    secondsRemainder
      .toPrecision(remainderPrecision)
      .replace(/^0/, '')
      .replace(/0+$/, '')
      .replace(/^\.$/, '');

  let time = '';

  if (minutes > 0) time += minutes + ' min' + (minutes > 1 ? 's' : '') + ', ';
  time += seconds + ' secs';

  return time;
};

const smpTag = () => bg(' SMP ') + ' ⏱  ';

export const getHumanOutput = (outputObj: SpeedMeasureDescriptor, options: any = {}) => {
  let output = '\n\n' + smpTag() + '\n';

  if (outputObj.misc) {
    output +=
      'General output time took ' +
      fg(
        humanTime(outputObj.misc.compileTime, options),
        outputObj.misc.compileTime
      );
    output += '\n\n';
  }
  if (outputObj.plugins) {
    output += smpTag() + 'Plugins\n';
    Object.keys(outputObj.plugins)
      .sort(
        (name1, name2) => outputObj.plugins[name2] - outputObj.plugins[name1]
      )
      .forEach(pluginName => {
        output +=
          chalk.bold(pluginName) +
          ' took ' +
          fg(
            humanTime(outputObj.plugins[pluginName]),
            outputObj.plugins[pluginName]
          );
        output += '\n';
      });
    output += '\n';
  }
  if (outputObj.loaders) {
    output += smpTag() + 'Loaders\n';
    outputObj.loaders.build
      .sort((obj1, obj2) => obj2.activeTime - obj1.activeTime)
      .forEach(loaderObj => {
        output +=
          loaderObj.loaders.map(fg).join(', and \n') +
          ' took ' +
          fg(humanTime(loaderObj.activeTime), loaderObj.activeTime) +
          '\n';

        const xEqualsY = [];
        if (options.verbose) {
          xEqualsY.push(['median', humanTime(loaderObj.averages.median)]);
          xEqualsY.push(['mean', humanTime(loaderObj.averages.mean)]);
          if (typeof loaderObj.averages.variance === 'number')
            xEqualsY.push([
              's.d.',
              humanTime(Math.sqrt(loaderObj.averages.variance)),
            ]);
          xEqualsY.push([
            'range',
            '(' +
            humanTime(loaderObj.averages.range.start) +
            ' --> ' +
            humanTime(loaderObj.averages.range.end) +
            ')',
          ]);
        }

        if (loaderObj.loaders.length > 1) {
          Object.keys(loaderObj.subLoadersTime).forEach(subLoader => {
            xEqualsY.push([
              subLoader,
              humanTime(loaderObj.subLoadersTime[subLoader]),
            ]);
          });
        }

        xEqualsY.push(['module count', loaderObj.averages.dataPoints]);

        if (options.loaderTopFiles) {
          const loopLen = Math.min(
            loaderObj.rawStartEnds.length,
            options.loaderTopFiles
          );
          for (let i = 0; i < loopLen; i++) {
            const rawItem = loaderObj.rawStartEnds[i];
            xEqualsY.push([
              rawItem.name,
              humanTime(rawItem.end - rawItem.start),
            ]);
          }
        }

        const maxXLength = xEqualsY.reduce(
          (acc, cur) => Math.max(acc, cur[0].length),
          0
        );
        xEqualsY.forEach(xY => {
          const padEnd = maxXLength - xY[0].length;
          output += '  ' + xY[0] + ' '.repeat(padEnd) + ' = ' + xY[1] + '\n';
        });
      });
  }

  output += '\n\n';

  return output;
};

export const getMiscOutput = data => ({
  compileTime: data.compile[0].end - data.compile[0].start,
});

export const getPluginsOutput = data =>
  Object.keys(data).reduce((acc, key) => {
    const inData = data[key];

    const startEndsByName = groupBy('name', inData);

    return startEndsByName.reduce((innerAcc, startEnds) => {
      innerAcc[startEnds[0].name] =
        (innerAcc[startEnds[0].name] || 0) + getTotalActiveTime(startEnds);
      return innerAcc;
    }, acc);
  }, {});

export const getLoadersOutput = data => {
  const startEndsByLoader = groupBy('loaders', data.build);
  const allSubLoaders = data['build-specific'] || [];

  const buildData = startEndsByLoader.map(startEnds => {
    const averages = getAverages(startEnds);
    const activeTime = getTotalActiveTime(startEnds);
    const subLoaders = groupBy(
      'loader',
      allSubLoaders.filter(l => startEnds.find(x => x.name === l.name))
    );
    const subLoadersActiveTime = subLoaders.reduce((acc, loaders) => {
      acc[loaders[0].loader] = getTotalActiveTime(loaders);
      return acc;
    }, {});

    return {
      averages,
      activeTime,
      loaders: startEnds[0].loaders,
      subLoadersTime: subLoadersActiveTime,
      rawStartEnds: startEnds.sort(
        (a, b) => b.end - b.start - (a.end - a.start)
      ),
    };
  });

  return { build: buildData };
};
