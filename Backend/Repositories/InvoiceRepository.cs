using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Repositories
{
    public class InvoiceRepository : Repository<Invoice>, IInvoiceRepository
    {
        public InvoiceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Invoice?> GetByIdWithItemsAsync(int id)
        {
            return await _dbSet
                .Include(i => i.Customer)
                .Include(i => i.User)
                .Include(i => i.InvoiceItems)
                    .ThenInclude(ii => ii.Product)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<(IEnumerable<Invoice> Invoices, int TotalCount)> GetPagedInvoicesAsync(int page, int pageSize)
        {
            var query = _dbSet
                .Include(i => i.Customer)
                .Include(i => i.User)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var invoices = await query
                .OrderByDescending(i => i.IssueDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (invoices, totalCount);
        }

        public async Task<IEnumerable<Invoice>> GetRecentInvoicesAsync(int count)
        {
            return await _dbSet
                .Include(i => i.Customer)
                .Include(i => i.User)
                .OrderByDescending(i => i.IssueDate)
                .Take(count)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _dbSet.SumAsync(i => i.TotalAmount);
        }
    }
}
