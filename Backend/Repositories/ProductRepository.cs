using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Repositories
{
    public class ProductRepository : Repository<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Product> Products, int TotalCount)> GetPagedProductsAsync(
            string? searchTerm, int? categoryId, int page, int pageSize)
        {
            var query = _dbSet.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(lowerSearch) || 
                                         p.Barcode.ToLower().Contains(lowerSearch) ||
                                         p.Description.ToLower().Contains(lowerSearch));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            var totalCount = await query.CountAsync();
            var products = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<Product?> GetByBarcodeAsync(string barcode)
        {
            return await _dbSet.Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Barcode == barcode);
        }

        public async Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold)
        {
            return await _dbSet.Include(p => p.Category)
                .Where(p => p.QuantityInStock <= threshold)
                .ToListAsync();
        }

        public override async Task<Product?> GetByIdAsync(int id)
        {
            return await _dbSet.Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
