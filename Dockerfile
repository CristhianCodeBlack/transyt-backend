# Dockerfile para Spring Boot
FROM openjdk:21-jdk-slim

# Instalar herramientas necesarias
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permisos a mvnw
RUN chmod +x ./mvnw

# Descargar dependencias
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src src

# Construir aplicación
RUN ./mvnw clean package -DskipTests -q

# Exponer puerto
EXPOSE 8080

# Variables de entorno para producción
ENV SPRING_PROFILES_ACTIVE=prod

# Ejecutar aplicación con nombre específico del JAR
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar target/backend-0.0.1-SNAPSHOT.jar"]