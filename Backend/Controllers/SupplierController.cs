using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/suppliers")]
    [Authorize]
    public class SupplierController : ControllerBase
    {
        private readonly IRepository<Supplier> _supplierRepository;
        private readonly IMapper _mapper;

        public SupplierController(IRepository<Supplier> supplierRepository, IMapper mapper)
        {
            _supplierRepository = supplierRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var suppliers = await _supplierRepository.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<SupplierResponseDto>>(suppliers));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null)
                return NotFound(new { message = $"Supplier with ID {id} not found." });
            return Ok(_mapper.Map<SupplierResponseDto>(supplier));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SupplierCreateDto dto)
        {
            var supplier = _mapper.Map<Supplier>(dto);
            await _supplierRepository.AddAsync(supplier);
            await _supplierRepository.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = supplier.Id }, _mapper.Map<SupplierResponseDto>(supplier));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierCreateDto dto)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null)
                return NotFound(new { message = $"Supplier with ID {id} not found." });

            _mapper.Map(dto, supplier);
            _supplierRepository.Update(supplier);
            await _supplierRepository.SaveChangesAsync();
            return Ok(_mapper.Map<SupplierResponseDto>(supplier));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _supplierRepository.GetByIdAsync(id);
            if (supplier == null)
                return NotFound(new { message = $"Supplier with ID {id} not found." });

            _supplierRepository.Delete(supplier);
            await _supplierRepository.SaveChangesAsync();
            return NoContent();
        }
    }
}
