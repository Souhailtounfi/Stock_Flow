using System.Collections.Generic;

namespace Backend.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int TotalInvoices { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int LowStockAlertsCount { get; set; }
        public int LowStockCount { get; set; }
        public int TotalCategories { get; set; }
        public int TotalCustomers { get; set; }
        public List<InvoiceResponseDto> RecentInvoices { get; set; } = new List<InvoiceResponseDto>();
        public List<StockMovementResponseDto> RecentStockMovements { get; set; } = new List<StockMovementResponseDto>();
        public List<ProductResponseDto> LowStockProducts { get; set; } = new List<ProductResponseDto>();
    }
}
