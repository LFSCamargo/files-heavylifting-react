import { FileWorkerEventType, FileWorkerMessage } from "../types";

self.addEventListener("message", async (event: FileWorkerEventType) => {
  const { chunkSize } = event.data.input;

  switch (event.data.type) {
    case "single_file":
      try {
        const { file } = event.data.input;

        const chunks: Blob[] = [];

        for (let i = 0; i <= file.size; i += chunkSize) {
          const chunk = file.slice(i, i + chunkSize);
          chunks.push(chunk);
        }

        console.log(chunks);

        self.postMessage(
          {
            type: "done",
            payload: {
              progress: 100,
              chunks
            }
          } as FileWorkerMessage
        );
      } catch (error) {
        self.postMessage(
          {
            type: "error",
            payload: {
              error
            }
          } as FileWorkerMessage
        );
      }
      break;

    default:
      break;
  }
});

export {};
