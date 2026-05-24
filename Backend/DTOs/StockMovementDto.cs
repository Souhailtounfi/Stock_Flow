using System;

namespace Backend.DTOs
{
    public class StockMovementResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductBarcode { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }
}
