# Étape 1 : Choisir une image de base avec Python
FROM python:3.10-slim

# Étape 2 : Définir le dossier de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers de ton projet dans le conteneur
COPY . /app

# Étape 4 : Installer pip + les dépendances du projet
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Étape 5 : Ouvrir le port 8000 (le port utilisé par Django)
EXPOSE 8000

# Étape 6 : Lancer le serveur Django quand le conteneur démarre
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
