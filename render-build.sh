#!/bin/bash

# Salir inmediatamente si un comando falla
set -e

# Instalar dependencias en la raíz
echo "--- Instalando dependencias en la raíz ---"
npm install

# Navegar a la carpeta del backend
cd backend

# Instalar dependencias del backend
echo "--- Instalando dependencias del backend ---"
npm install

echo "--- Construcción completada ---"
