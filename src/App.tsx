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
