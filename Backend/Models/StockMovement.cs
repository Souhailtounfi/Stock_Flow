using System;

namespace Backend.Models
{
    public class StockMovement
    {
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        public int Quantity { get; set; }
        public string Type { get; set; } = string.Empty; // "IN", "OUT", "ADJUST"
        public string Reason { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
