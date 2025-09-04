@echo off
echo Limpiando anotaciones CrossOrigin de los controladores...

REM Lista de archivos a limpiar
set files=AdminController.java CapacitacionEnVivoController.java CertificadoController.java CursoController.java DashboardController.java EmpleadoController.java EmpresaController.java EvaluacionController.java EventoController.java FileUploadController.java InstructorStatsController.java ModuloController.java ModuloProgresoController.java ReportesController.java SeguimientoTestController.java UsuarioController.java VideoProgresoController.java

for %%f in (%files%) do (
    echo Procesando %%f...
    powershell -Command "(Get-Content 'src\main\java\com\capacitapro\backend\controller\%%f') -replace '@CrossOrigin\(origins = \{.*?\}\)', '' | Set-Content 'src\main\java\com\capacitapro\backend\controller\%%f'"
)

echo Limpieza completada.
pause