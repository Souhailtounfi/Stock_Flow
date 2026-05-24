using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IProductRepository _productRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<StockMovement> _stockMovementRepository;
        private readonly IMapper _mapper;

        public InvoiceService(
            IInvoiceRepository invoiceRepository,
            IProductRepository productRepository,
            IRepository<Customer> customerRepository,
            IRepository<StockMovement> stockMovementRepository,
            IMapper mapper)
        {
            _invoiceRepository = invoiceRepository;
            _productRepository = productRepository;
            _customerRepository = customerRepository;
            _stockMovementRepository = stockMovementRepository;
            _mapper = mapper;
        }

        public async Task<(IEnumerable<InvoiceResponseDto> Invoices, int TotalCount)> GetPagedInvoicesAsync(int page, int pageSize)
        {
            var (invoices, totalCount) = await _invoiceRepository.GetPagedInvoicesAsync(page, pageSize);
            var dtos = _mapper.Map<IEnumerable<InvoiceResponseDto>>(invoices);
            return (dtos, totalCount);
        }

        public async Task<InvoiceResponseDto?> GetInvoiceByIdAsync(int id)
        {
            var invoice = await _invoiceRepository.GetByIdWithItemsAsync(id);
            if (invoice == null) return null;
            return _mapper.Map<InvoiceResponseDto>(invoice);
        }

        public async Task<InvoiceResponseDto> CreateInvoiceAsync(InvoiceCreateDto dto, int userId)
        {
            var customer = await _customerRepository.GetByIdAsync(dto.CustomerId);
            if (customer == null)
                throw new ArgumentException("Invalid Customer ID.");

            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd-HHmmss}";

            var invoice = new Invoice
            {
                InvoiceNumber = invoiceNumber,
                CustomerId = dto.CustomerId,
                UserId = userId,
                IssueDate = DateTime.UtcNow,
                TaxRate = dto.TaxRate
            };

            decimal subTotal = 0;
            var invoiceItems = new List<InvoiceItem>();
            var stockMovements = new List<StockMovement>();

            foreach (var itemDto in dto.Items)
            {
                var product = await _productRepository.GetByIdAsync(itemDto.ProductId);
                if (product == null)
                    throw new ArgumentException($"Product ID {itemDto.ProductId} not found.");

                if (product.QuantityInStock < itemDto.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for product '{product.Name}'. Available: {product.QuantityInStock}, Requested: {itemDto.Quantity}");

                product.QuantityInStock -= itemDto.Quantity;
                _productRepository.Update(product);

                var lineTotal = product.Price * itemDto.Quantity;
                subTotal += lineTotal;

                invoiceItems.Add(new InvoiceItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = product.Price,
                    LineTotal = lineTotal
                });

                stockMovements.Add(new StockMovement
                {
                    ProductId = itemDto.ProductId,
                    Quantity = -itemDto.Quantity,
                    Type = "OUT",
                    Reason = $"Sale Invoice {invoiceNumber}",
                    UserId = userId,
                    Date = DateTime.UtcNow
                });
            }

            invoice.InvoiceItems = invoiceItems;
            invoice.SubTotal = subTotal;
            invoice.TaxAmount = subTotal * dto.TaxRate;
            invoice.TotalAmount = subTotal + invoice.TaxAmount;

            await _invoiceRepository.AddAsync(invoice);
            
            foreach (var sm in stockMovements)
            {
                await _stockMovementRepository.AddAsync(sm);
            }

            await _invoiceRepository.SaveChangesAsync();

            var savedInvoice = await _invoiceRepository.GetByIdWithItemsAsync(invoice.Id);
            return _mapper.Map<InvoiceResponseDto>(savedInvoice!);
        }
    }
}
