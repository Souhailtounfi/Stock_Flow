using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Repositories
{
    public class StockMovementRepository : Repository<StockMovement>, IStockMovementRepository
    {
        public StockMovementRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<StockMovement>> GetMovementsByProductIdAsync(int productId)
        {
            return await _dbSet
                .Include(sm => sm.User)
                .Where(sm => sm.ProductId == productId)
                .OrderByDescending(sm => sm.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<StockMovement>> GetRecentMovementsAsync(int count)
        {
            return await _dbSet
                .Include(sm => sm.Product)
                .Include(sm => sm.User)
                .OrderByDescending(sm => sm.Date)
                .Take(count)
                .ToListAsync();
        }
    }
}
