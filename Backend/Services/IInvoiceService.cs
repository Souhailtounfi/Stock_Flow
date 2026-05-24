using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Services
{
    public interface IInvoiceService
    {
        Task<(IEnumerable<InvoiceResponseDto> Invoices, int TotalCount)> GetPagedInvoicesAsync(int page, int pageSize);
        Task<InvoiceResponseDto?> GetInvoiceByIdAsync(int id);
        Task<InvoiceResponseDto> CreateInvoiceAsync(InvoiceCreateDto dto, int userId);
    }
}
