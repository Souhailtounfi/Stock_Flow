using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IMapper _mapper;

        public ProductService(
            IProductRepository productRepository,
            IStockMovementRepository stockMovementRepository,
            IRepository<Category> categoryRepository,
            IMapper mapper)
        {
            _productRepository = productRepository;
            _stockMovementRepository = stockMovementRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<(IEnumerable<ProductResponseDto> Products, int TotalCount)> GetPagedProductsAsync(
            string? searchTerm, int? categoryId, int page, int pageSize)
        {
            var (products, totalCount) = await _productRepository.GetPagedProductsAsync(searchTerm, categoryId, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<ProductResponseDto>>(products);
            return (dtos, totalCount);
        }

        public async Task<ProductResponseDto?> GetProductByIdAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return null;
            return _mapper.Map<ProductResponseDto>(product);
        }

        public async Task<ProductResponseDto> CreateProductAsync(ProductCreateDto dto, int userId)
        {
            var existing = await _productRepository.GetByBarcodeAsync(dto.Barcode);
            if (existing != null)
                throw new ArgumentException($"A product with barcode '{dto.Barcode}' already exists.");

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                throw new ArgumentException("Invalid Category ID.");

            var product = _mapper.Map<Product>(dto);
            await _productRepository.AddAsync(product);
            await _productRepository.SaveChangesAsync();

            if (product.QuantityInStock > 0)
            {
                var movement = new StockMovement
                {
                    ProductId = product.Id,
                    Quantity = product.QuantityInStock,
                    Type = "IN",
                    Reason = "Initial stock upload",
                    UserId = userId,
                    Date = DateTime.UtcNow
                };
                await _stockMovementRepository.AddAsync(movement);
                await _stockMovementRepository.SaveChangesAsync();
            }

            var savedProduct = await _productRepository.GetByIdAsync(product.Id);
            return _mapper.Map<ProductResponseDto>(savedProduct!);
        }

        public async Task<ProductResponseDto?> UpdateProductAsync(int id, ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return null;

            var existing = await _productRepository.GetByBarcodeAsync(dto.Barcode);
            if (existing != null && existing.Id != id)
                throw new ArgumentException($"A product with barcode '{dto.Barcode}' already exists.");

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null)
                throw new ArgumentException("Invalid Category ID.");

            _mapper.Map(dto, product);
            _productRepository.Update(product);
            await _productRepository.SaveChangesAsync();

            var savedProduct = await _productRepository.GetByIdAsync(product.Id);
            return _mapper.Map<ProductResponseDto>(savedProduct!);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return false;

            _productRepository.Delete(product);
            return await _productRepository.SaveChangesAsync();
        }

        public async Task<ProductResponseDto?> AdjustStockAsync(int id, StockAdjustDto dto, int userId)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return null;

            if (product.QuantityInStock + dto.Quantity < 0)
                throw new InvalidOperationException("Stock levels cannot drop below 0.");

            product.QuantityInStock += dto.Quantity;
            _productRepository.Update(product);

            var movement = new StockMovement
            {
                ProductId = product.Id,
                Quantity = dto.Quantity,
                Type = dto.Quantity >= 0 ? "IN" : "OUT",
                Reason = string.IsNullOrWhiteSpace(dto.Reason) ? "Manual stock adjustment" : dto.Reason,
                UserId = userId,
                Date = DateTime.UtcNow
            };
            await _stockMovementRepository.AddAsync(movement);
            
            await _productRepository.SaveChangesAsync();
            await _stockMovementRepository.SaveChangesAsync();

            var savedProduct = await _productRepository.GetByIdAsync(product.Id);
            return _mapper.Map<ProductResponseDto>(savedProduct!);
        }

        public async Task<IEnumerable<StockMovementResponseDto>> GetProductMovementHistoryAsync(int id)
        {
            var movements = await _stockMovementRepository.GetMovementsByProductIdAsync(id);
            return _mapper.Map<IEnumerable<StockMovementResponseDto>>(movements);
        }
    }
}
