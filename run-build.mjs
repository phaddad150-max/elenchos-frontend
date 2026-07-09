import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

const child = spawn(
  "cmd.exe",
  [
    "/c",
    "npm run build > build-output.txt 2>&1 & echo EXITCODE=%ERRORLEVEL%>>build-output.txt",
  ],
  {
    cwd: root,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  },
);

child.unref();