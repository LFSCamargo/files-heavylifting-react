# Files HeavyLifting Processing

Its a simple implementation of webworkers to handle heavy lifting processing in the browser, sometimes we need to process a lot of data in the browser and we don't want to block the UI, so we can use webworkers to handle this task.

# Main Thread

- The main thread is the thread that runs the JavaScript code that you write.
- The main thread is also called the UI thread because it is responsible for updating the DOM.

# Worker Thread

- Worker threads are threads that run JavaScript code in the background. And that we normally execute heavy lifting processing in the worker thread and send a event back to the main thread to update the UI.

# Project Structure

```
- src/
  - App.tsx (main component that will call the worker thread)
  - types/
    - worker.ts (types for the worker)
    - file.ts
  - workers/
    - file.ts (worker)
  - hooks/
    - useFileWorker.ts (hook to use the worker and control the instance of the worker)
```

## Worker

```ts
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

        self.postMessage({
          type: "done",
          payload: {
            progress: 100,
            chunks
          }
        } as FileWorkerMessage);
      } catch (error) {
        self.postMessage({
          type: "error",
          payload: {
            error
          }
        } as FileWorkerMessage);
      }
      break;

    default:
      break;
  }
});

export {};
```

- The worker will receive a file from the main thread and will split the file into chunks and send back to the main thread a array of chunks.

## Hooks

```ts
import { useCallback, useMemo } from "react";
import { FileWorkerInput, FileWorkerMessage } from "../types";

export function useFilesWorker() {
  const worker = useMemo(
    () =>
      new Worker(new URL("../workers/file.ts", import.meta.url), {
        type: "module"
      }),
    []
  );

  const splitIntoChunks = useCallback(
    (file: File, chunkSize = 1024) => {
      return new Promise<Blob[]>((resolve, reject) => {
        worker.postMessage({
          type: "single_file",
          input: {
            file,
            chunkSize
          }
        } as FileWorkerInput);

        worker.addEventListener(
          "message",
          (event: MessageEvent<FileWorkerMessage>) => {
            switch (event.data.type) {
              case "done":
                console.log(event.data);
                resolve(event.data.payload.chunks);
                break;

              case "error":
                console.log(event.data);
                reject(event.data.payload.error);
                break;
              default:
                break;
            }
          },
          {
            once: true
          }
        );
      });
    },
    [worker]
  );

  return {
    worker,
    handlers: {
      splitIntoChunks
    }
  };
}
```

- The hook will create a instance of the worker and will return a function to split the file into chunks.

## App

```tsx
import "./App.css";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { useFilesWorker } from "./hooks/useFileWorker";

function App() {
  const { handlers } = useFilesWorker();
  const [isSending, setSending] = useState(false);

  const splitIntoChunks = async (file: File) => {
    try {
      if (!file || isSending) return;
      setSending(true);
      const chunks = await handlers.splitIntoChunks(file, 1024);
      console.log("Chunks", chunks);
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <input
          type="file"
          disabled={isSending}
          onChange={(e) => splitIntoChunks(e.target.files![0] as File)}
        />
        <p>{isSending ? "Processing File" : "Send Another File"}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
```

- The main component will call the hook and will call the function to split the file into chunks.
