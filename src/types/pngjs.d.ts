declare module 'pngjs' {
  export interface PNGOptions {
    width?: number;
    height?: number;
    fill?: boolean;
    deflateChunkSize?: number;
    deflateLevel?: number;
    deflateStrategy?: number;
    inputHasAlpha?: boolean;
    colorType?: number;
    bitDepth?: number;
  }

  export class PNG {
    constructor(options?: PNGOptions);
    width: number;
    height: number;
    data: Buffer;
    pack(): any;
    parse(data: Buffer | string, callback?: (error: Error | null, data: PNG) => void): PNG;
    static sync: {
      read(buffer: Buffer, options?: any): PNG;
      write(png: PNG, options?: any): Buffer;
    };
  }
}
