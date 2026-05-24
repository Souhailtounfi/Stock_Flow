using System;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FluentValidation;
using Backend.Data;
using Backend.Repositories;
using Backend.Services;
using Backend.Middleware;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// 1. Connection String and DbContext Setup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 31))));

// 2. Repository Registrations
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IStockMovementRepository, StockMovementRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// 3. Service Registrations
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// 4. AutoMapper Setup
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<Backend.Mappings.MappingProfile>());

// 5. FluentValidation Setup
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// 6. Controllers and JSON Serialization Setup
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 7. Swagger Documentation Setup
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Stock & Invoicing Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 8. CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 9. JWT Authentication Configuration
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "super_secret_key_that_is_long_enough_for_sha256_signing_123456");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "StockManagerAPI",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "StockManagerApp",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

var app = builder.Build();

// 10. Database Initialization (Auto-migration/creation & seeding)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.EnsureCreated();
        await SeedDatabaseAsync(dbContext);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error initializing database: {ex.Message}");
    }
}

// 11. Middleware Pipeline Setup
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Stock & Invoicing API v1");
    });
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static async Task SeedDatabaseAsync(ApplicationDbContext dbContext)
{
    var hasher = new PasswordHasher<object>();
    var roles = dbContext.Roles.ToDictionary(r => r.Name, r => r);

    if (!roles.ContainsKey("Admin"))
    {
        dbContext.Roles.Add(new Role { Name = "Admin" });
    }

    if (!roles.ContainsKey("Employee"))
    {
        dbContext.Roles.Add(new Role { Name = "Employee" });
    }

    await dbContext.SaveChangesAsync();

    roles = dbContext.Roles.ToDictionary(r => r.Name, r => r);

    if (!dbContext.Users.Any(u => u.Username == "admin"))
    {
        var admin = new User
        {
            Username = "admin",
            Email = "admin@stockflow.ma",
            RoleId = roles["Admin"].Id,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
        admin.PasswordHash = hasher.HashPassword(admin, "Admin123!");
        dbContext.Users.Add(admin);
    }

    if (!dbContext.Users.Any(u => u.Username == "sara"))
    {
        var employee = new User
        {
            Username = "sara",
            Email = "sara@stockflow.ma",
            RoleId = roles["Employee"].Id,
            CreatedAt = DateTime.UtcNow
        };
        employee.PasswordHash = hasher.HashPassword(employee, "Employee123!");
        dbContext.Users.Add(employee);
    }

    if (!dbContext.Users.Any(u => u.Username == "amine"))
    {
        var manager = new User
        {
            Username = "amine",
            Email = "amine@stockflow.ma",
            RoleId = roles["Employee"].Id,
            CreatedAt = DateTime.UtcNow
        };
        manager.PasswordHash = hasher.HashPassword(manager, "Employee123!");
        dbContext.Users.Add(manager);
    }

    if (!dbContext.Categories.Any())
    {
        dbContext.Categories.AddRange(
            new Category { Name = "Produits laitiers", Description = "Lait, yaourt et fromages marocains" },
            new Category { Name = "Épices et condiments", Description = "Ras el hanout, cumin, saffran" },
            new Category { Name = "Céréales et pains", Description = "Farines, semoule et pains artisanaux" },
            new Category { Name = "Fruits et légumes", Description = "Agrumes, tomates et légumes frais" },
            new Category { Name = "Boissons", Description = "Jus, thé et boissons rafraîchissantes" }
        );
    }

    await dbContext.SaveChangesAsync();

    var categories = dbContext.Categories.ToDictionary(c => c.Name, c => c);

    if (!dbContext.Suppliers.Any())
    {
        dbContext.Suppliers.AddRange(
            new Supplier { Name = "Moujib Hal", Email = "contact@moujibhal.ma", Phone = "+212 5 22 44 55 66", Address = "Rabat, Maroc", ContactName = "Youssef Moujib" },
            new Supplier { Name = "Atlas Fruits", Email = "sales@atlasfruits.ma", Phone = "+212 5 37 88 12 94", Address = "Casablanca, Maroc", ContactName = "Lina El Amrani" },
            new Supplier { Name = "Zahra Spice Co", Email = "info@zahraspice.ma", Phone = "+212 6 61 23 45 67", Address = "Marrakech, Maroc", ContactName = "Amina Zahra" }
        );
    }

    if (!dbContext.Customers.Any())
    {
        dbContext.Customers.AddRange(
            new Customer { Name = "Boutique Al Mouna", Email = "contact@almouna.ma", Phone = "+212 6 12 34 56 78", Address = "Place Mohammed V, Casablanca" },
            new Customer { Name = "Riad Souk", Email = "admin@riadsouk.ma", Phone = "+212 6 43 21 09 87", Address = "Derb Ghalef, Marrakech" },
            new Customer { Name = "Médina Market", Email = "info@medinamarket.ma", Phone = "+212 6 54 65 76 98", Address = "Rue de la Kasbah, Rabat" }
        );
    }

    var productSeedData = new[]
    {
        new Product { Name = "Lait frais Aïoun", Description = "Lait frais pasteurisé du nord du Maroc", Barcode = "MAD-001", Price = 9.50m, QuantityInStock = 120, CategoryId = categories["Produits laitiers"].Id, CreatedAt = DateTime.UtcNow.AddDays(-14) },
        new Product { Name = "Ras el Hanout Maison", Description = "Mélange d’épices traditionnel", Barcode = "MAD-002", Price = 24.90m, QuantityInStock = 65, CategoryId = categories["Épices et condiments"].Id, CreatedAt = DateTime.UtcNow.AddDays(-12) },
        new Product { Name = "Semoule fine", Description = "Semoule de qualité supérieure", Barcode = "MAD-003", Price = 14.20m, QuantityInStock = 90, CategoryId = categories["Céréales et pains"].Id, CreatedAt = DateTime.UtcNow.AddDays(-10) },
        new Product { Name = "Tomates de Souss", Description = "Tomates fraîches sélectionnées", Barcode = "MAD-004", Price = 8.40m, QuantityInStock = 55, CategoryId = categories["Fruits et légumes"].Id, CreatedAt = DateTime.UtcNow.AddDays(-9) },
        new Product { Name = "Jus d’orange naturel", Description = "Jus d’orange pressé", Barcode = "MAD-005", Price = 11.80m, QuantityInStock = 40, CategoryId = categories["Boissons"].Id, CreatedAt = DateTime.UtcNow.AddDays(-7) },
        new Product { Name = "Fromage de chèvre artisanal", Description = "Fromage frais de la région de Tafraout", Barcode = "MAD-006", Price = 18.75m, QuantityInStock = 34, CategoryId = categories["Produits laitiers"].Id, CreatedAt = DateTime.UtcNow.AddDays(-6) },
        new Product { Name = "Pâte de dattes", Description = "Délicieux mélange de dattes et d’amandes", Barcode = "MAD-007", Price = 22.30m, QuantityInStock = 28, CategoryId = categories["Épices et condiments"].Id, CreatedAt = DateTime.UtcNow.AddDays(-5) },
        new Product { Name = "Bissara maison", Description = "Purée de fèves servie fraîche", Barcode = "MAD-008", Price = 12.90m, QuantityInStock = 48, CategoryId = categories["Céréales et pains"].Id, CreatedAt = DateTime.UtcNow.AddDays(-4) },
        new Product { Name = "Aubergines fraîches", Description = "Aubergines marocaines de saison", Barcode = "MAD-009", Price = 7.60m, QuantityInStock = 60, CategoryId = categories["Fruits et légumes"].Id, CreatedAt = DateTime.UtcNow.AddDays(-3) },
        new Product { Name = "Thé vert de Marrakech", Description = "Thé vert parfumé en sachets", Barcode = "MAD-010", Price = 29.90m, QuantityInStock = 25, CategoryId = categories["Boissons"].Id, CreatedAt = DateTime.UtcNow.AddDays(-2) },
        new Product { Name = "Miel arganier", Description = "Miel biologique enrichi en huile d’argan", Barcode = "MAD-011", Price = 35.50m, QuantityInStock = 18, CategoryId = categories["Boissons"].Id, CreatedAt = DateTime.UtcNow.AddDays(-1) },
        new Product { Name = "Harissa forte", Description = "Pâte de piment traditionnelle", Barcode = "MAD-012", Price = 16.20m, QuantityInStock = 37, CategoryId = categories["Épices et condiments"].Id, CreatedAt = DateTime.UtcNow }
    };

    var existingBarcodes = dbContext.Products.Select(p => p.Barcode).ToHashSet();
    var missingProducts = productSeedData.Where(p => !existingBarcodes.Contains(p.Barcode)).ToList();

    if (missingProducts.Count > 0)
    {
        dbContext.Products.AddRange(missingProducts);
    }

    await dbContext.SaveChangesAsync();
}
