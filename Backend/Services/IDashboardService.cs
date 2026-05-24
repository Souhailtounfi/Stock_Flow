using System.Threading.Tasks;
using Backend.DTOs;

namespace Backend.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(int lowStockThreshold = 5);
    }
}
