# Gestion des stocks et de la facturation

Ce projet permet de gérer des stocks, des produits, des fournisseurs, des clients, des factures et des mouvements de stock avec une API ASP.NET Core et une interface React.

## Prérequis

- .NET 8 SDK
- Node.js 18 ou supérieur
- MySQL Server en cours d’exécution
- Git

## Préparation de la base de données

1. Démarrez MySQL.
2. Vérifiez la chaîne de connexion dans `Backend/appsettings.json`.
3. Le backend crée automatiquement la base et les données de seed au démarrage.

## Lancer le projet

### 1. Backend

```powershell
cd Backend
dotnet restore
dotnet run
```

Le backend démarre sur `http://localhost:5172` avec le profil `http` défini dans `Backend/Properties/launchSettings.json`.

### 2. Frontend

```powershell
cd Frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`.

## Tester le projet

### Vérification de démarrage

- Ouvrez `http://localhost:5173` pour l’interface.
- Ouvrez `http://localhost:5172/swagger` pour l’API Swagger.

### Flux de test minimal

1. Lancez le backend et le frontend.
2. Connectez-vous avec l’administrateur par défaut :
   - Email : `admin@example.com`
   - Mot de passe : `Admin123!`
3. Vérifiez le tableau de bord.
4. Créez un produit, une catégorie et une facture de test.
5. Vérifiez que les mouvements de stock sont enregistrés.

### Vérifications utiles

```powershell
cd Backend
dotnet build

cd ../Frontend
npm run build
```

## Compte administrateur par défaut

- Email : `admin@example.com`
- Mot de passe : `Admin123!`

## Résolution des problèmes courants

- Si MySQL refuse la connexion, vérifiez que le serveur est démarré et que la chaîne de connexion est correcte.
- Si le frontend ne parle pas au backend, vérifiez que le backend tourne sur `http://localhost:5172`.
- Si `npm install` échoue, supprimez `node_modules` puis relancez la commande.

## Structure rapide

- `Backend/` : API ASP.NET Core
- `Frontend/` : application React
