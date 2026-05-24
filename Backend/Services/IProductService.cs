using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Services
{
    public interface IProductService
    {
        Task<(IEnumerable<ProductResponseDto> Products, int TotalCount)> GetPagedProductsAsync(
            string? searchTerm, int? categoryId, int page, int pageSize);
        Task<ProductResponseDto?> GetProductByIdAsync(int id);
        Task<ProductResponseDto> CreateProductAsync(ProductCreateDto dto, int userId);
        Task<ProductResponseDto?> UpdateProductAsync(int id, ProductUpdateDto dto);
        Task<bool> DeleteProductAsync(int id);
        Task<ProductResponseDto?> AdjustStockAsync(int id, StockAdjustDto dto, int userId);
        Task<IEnumerable<StockMovementResponseDto>> GetProductMovementHistoryAsync(int id);
    }
}
