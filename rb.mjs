import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const r = dirname(fileURLToPath(import.meta.url));
spawn("cmd.exe", ["/c", "npm run build > build-output.txt 2>&1 & echo EXITCODE=%ERRORLEVEL%>>build-output.txt"], { cwd: r, detached: true, stdio: "ignore", windowsHide: true }).unref();