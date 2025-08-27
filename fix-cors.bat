@echo off
echo Arreglando URLs hardcodeadas en controladores...

cd src\main\java\com\capacitapro\backend\controller

for %%f in (*.java) do (
    echo Procesando %%f...
    powershell -Command "(Get-Content '%%f') -replace '@CrossOrigin\(origins = \{\"http://localhost:5173\", \"http://localhost:5174\"\}\)', '@CrossOrigin(origins = {\"http://localhost:5173\", \"http://localhost:5174\", \"https://transyt-frontend.onrender.com\"})' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace '@CrossOrigin\(origins = \{\"http://localhost:5173\", \"http://localhost:5174\", \"http://localhost:5175\"\}\)', '@CrossOrigin(origins = {\"http://localhost:5173\", \"http://localhost:5174\", \"http://localhost:5175\", \"https://transyt-frontend.onrender.com\"})' | Set-Content '%%f'"
)

echo Completado!
pause