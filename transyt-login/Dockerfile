# Dockerfile para React
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Variables de entorno para producción
ENV NODE_ENV=production
ENV REACT_APP_API_URL=https://transyt-backend.onrender.com

# Construir aplicación
RUN npm run build

# Instalar servidor estático
RUN npm install -g serve

# Exponer puerto
EXPOSE $PORT

# Ejecutar aplicación
CMD ["serve", "-s", "build", "-l", "$PORT"]