using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories
{
    public interface IProductRepository : IRepository<Product>
    {
        Task<(IEnumerable<Product> Products, int TotalCount)> GetPagedProductsAsync(
            string? searchTerm, int? categoryId, int page, int pageSize);
        Task<Product?> GetByBarcodeAsync(string barcode);
        Task<IEnumerable<Product>> GetLowStockProductsAsync(int threshold);
    }
}
