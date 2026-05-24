using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Repositories
{
    public interface IStockMovementRepository : IRepository<StockMovement>
    {
        Task<IEnumerable<StockMovement>> GetMovementsByProductIdAsync(int productId);
        Task<IEnumerable<StockMovement>> GetRecentMovementsAsync(int count);
    }
}
