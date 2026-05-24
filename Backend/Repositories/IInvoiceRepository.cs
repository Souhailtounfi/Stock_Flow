using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories
{
    public interface IInvoiceRepository : IRepository<Invoice>
    {
        Task<Invoice?> GetByIdWithItemsAsync(int id);
        Task<(IEnumerable<Invoice> Invoices, int TotalCount)> GetPagedInvoicesAsync(int page, int pageSize);
        Task<IEnumerable<Invoice>> GetRecentInvoicesAsync(int count);
        Task<decimal> GetTotalRevenueAsync();
    }
}
