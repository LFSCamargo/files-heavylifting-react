export type FileWorkerInput = {
  type: "single_file";
  input: {
    file: File;
    chunkSize: number;
  };
};

export type FileWorkerEventType = MessageEvent<FileWorkerInput>;

export type FileWorkerMessage =
  | {
      type: "done";
      payload: {
        progress: number;
        chunks: Blob[];
      };
    }
  | {
      type: "error";
      payload: {
        error: string;
      };
    };
