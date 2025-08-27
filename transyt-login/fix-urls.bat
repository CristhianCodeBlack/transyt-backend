@echo off
echo Arreglando URLs hardcodeadas en frontend...

cd src

echo Reemplazando fetch con api.get...
for /r %%f in (*.jsx *.js) do (
    powershell -Command "(Get-Content '%%f') -replace 'fetch\(`http://localhost:8080/api([^`]+)`, \{[^}]*headers:[^}]*Authorization[^}]*\}\)', 'api.get(`$1`)' | Set-Content '%%f'"
)

echo Reemplazando fetch POST con api.post...
for /r %%f in (*.jsx *.js) do (
    powershell -Command "(Get-Content '%%f') -replace 'fetch\(`http://localhost:8080/api([^`]+)`, \{[^}]*method: ''POST''[^}]*\}\)', 'api.post(`$1`, data)' | Set-Content '%%f'"
)

echo Completado!