export interface RawStartEndDescriptor {
  name: string;
  fillLast: boolean;
  loaders: string[],
  start: number;
  end: number;
}

export interface LoaderSpeedMeasureDescriptor {
  averages: {
    dataPoints: number;
    median: number;
    mean: number;
    range: {
      start: number;
      end: number;
    },
    variance: number;
  },
  activeTime: number;
  loaders: string[];
  subLoadersTime: string[];
  rawStartEnds: RawStartEndDescriptor[];
}

export interface SpeedMeasureDescriptor {
  misc: {
    compileTime: number;
  },
  plugins: {
    [key: string]: number;
  },
  loaders: {
    build: LoaderSpeedMeasureDescriptor[];
  }
}
