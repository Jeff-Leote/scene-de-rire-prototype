FROM node:22-alpine

# Crée un dossier de travail dans le container
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie tout le reste du projet
COPY . .

# Expose le port Vite (par défaut : 5173)
EXPOSE 5173

# Active le mode développement (avec hot reload)
CMD ["npm", "run", "dev", "--", "--host"]
