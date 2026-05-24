# Quick Commands Reference

## Backend Setup & Migration (.NET 8)

### Initial Setup
```powershell
cd Backend
dotnet clean
dotnet restore
```

### Database Migrations
```powershell
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migrations to database
dotnet ef database update

# If needed: Remove last migration
dotnet ef migrations remove

# If needed: Drop entire database
dotnet ef database drop --force
```

### Run Backend Server
```powershell
# Standard run
dotnet run

# With hot reload (watch mode)
dotnet watch run

# Swagger UI: https://localhost:7119/swagger
```

---

## Frontend Setup & Development

### Initial Setup
```powershell
cd Frontend
npm install
```

### Development
```powershell
# Start development server
npm run dev
# Opens at: http://localhost:5173
```

### Production Build
```powershell
npm run build
npm run preview
```

---

## Complete Startup Sequence

### Terminal 1 - Backend
```powershell
cd Backend
dotnet run
# Backend starts on https://localhost:7119
# Swagger at: https://localhost:7119/swagger
```

### Terminal 2 - Frontend
```powershell
cd Frontend
npm run dev
# Frontend starts on http://localhost:5173
# Default Admin: admin@stockmanager.com / Admin@123
```

---

## .NET 8 Package Versions

✅ **Verified Compatibility**
- AutoMapper: 13.0.1
- FluentValidation: 11.9.2
- Microsoft.AspNetCore.Authentication.JwtBearer: 8.0.10
- Microsoft.EntityFrameworkCore: 8.0.10
- Microsoft.EntityFrameworkCore.Design: 8.0.10
- Microsoft.EntityFrameworkCore.Relational: 8.0.10
- Pomelo.EntityFrameworkCore.MySql: 8.0.2
- Swashbuckle.AspNetCore: 6.5.0

---

## MySQL Configuration

**Default Connection String** (in `Backend/appsettings.json`):
```
server=localhost;port=3306;database=stock_invoice_db;user=root;password=
```

**Custom Configuration**:
If your MySQL has different credentials, update:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=YOUR_HOST;port=3306;database=stock_invoice_db;user=YOUR_USER;password=YOUR_PASSWORD"
  }
}
```

---

## Default Credentials

- **Email**: admin@stockmanager.com
- **Password**: Admin@123

⚠️ Change in production!

---

## Project Status

✅ Backend: ASP.NET Core 8 (.NET 8.0)
✅ Database: MySQL with EF Core
✅ Frontend: React 19 with Vite
✅ All packages: Updated for .NET 8 compatibility
✅ Migrations: Ready to apply
✅ API: Fully functional with Swagger documentation

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| MySQL connection error | Verify MySQL running, check connection string |
| Port already in use | Change port in launchSettings.json (Backend) or vite.config.js (Frontend) |
| NuGet restore fails | Run `dotnet restore --no-cache` |
| EF migrations error | Run `dotnet ef database drop --force` then re-apply migrations |
| npm packages not found | Run `npm cache clean --force` then `npm install` |
| CORS errors | Ensure backend is running on http://localhost:5119 |

---

## API Base URL

- **Development**: `http://localhost:5119`
- **Swagger**: `https://localhost:7119/swagger`

All API requests (except login/register) require Bearer token in Authorization header.
