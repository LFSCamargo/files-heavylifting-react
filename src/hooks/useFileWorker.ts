import { useCallback, useRef } from "react";
import { FileWorkerInput, FileWorkerMessage } from "../types";

export function useFilesWorker() {
  const workerRef = useRef(new Worker(new URL('../workers/file.ts', import.meta.url), { type: 'module'}));

  const splitIntoChunks = useCallback((file: File, chunkSize = 1024) => {
    return new Promise<Blob[]>((resolve, reject) => {
      workerRef.current.postMessage({
        type: "single_file",
        input: {
          file,
          chunkSize
        }
      } as FileWorkerInput)

      workerRef.current.addEventListener("message", (event: MessageEvent<FileWorkerMessage>) => {
        switch (event.data.type) {
          case "done":
            console.log(event.data);
            resolve(event.data.payload.chunks)
            break;
            
          case "error":
            console.log(event.data);
            reject(event.data.payload.error)
            break;
          default:
            break;
        }
      }, {
        once: true
      }); 
    });
  }, [])

  return {
    worker: workerRef.current,
    handlers: {
      splitIntoChunks
    }
  }
}