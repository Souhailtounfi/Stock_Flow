using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }
        
        public int InvoiceId { get; set; }
        [JsonIgnore]
        public Invoice Invoice { get; set; } = null!;
        
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }
}
