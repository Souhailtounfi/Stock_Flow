using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;
using Backend.Services;
using System.Security.Claims;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/products")]
    [Authorize]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int? categoryId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (products, totalCount) = await _productService.GetPagedProductsAsync(searchTerm, categoryId, page, pageSize);
            return Ok(new { products, totalCount, page, pageSize });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = $"Product with ID {id} not found." });
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = int.TryParse(userIdClaim, out var id) ? id : 1;

            var product = await _productService.CreateProductAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productService.UpdateProductAsync(id, dto);
            if (product == null)
                return NotFound(new { message = $"Product with ID {id} not found." });
            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _productService.DeleteProductAsync(id);
            if (!success)
                return NotFound(new { message = $"Product with ID {id} not found." });
            return NoContent();
        }

        [HttpPost("{id}/stock")]
        public async Task<IActionResult> AdjustStock(int id, [FromBody] StockAdjustDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userId = int.TryParse(userIdClaim, out var parsedId) ? parsedId : 1;

            var product = await _productService.AdjustStockAsync(id, dto, userId);
            if (product == null)
                return NotFound(new { message = $"Product with ID {id} not found." });
            return Ok(product);
        }

        [HttpGet("{id}/movements")]
        public async Task<IActionResult> GetMovementHistory(int id)
        {
            var history = await _productService.GetProductMovementHistoryAsync(id);
            return Ok(history);
        }
    }
}
