Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "C:\Projects\elenchos-frontend"
sh.Run "cmd /c npm run build > build-output.txt 2>&1 & echo EXITCODE=%ERRORLEVEL%>>build-output.txt", 0, True