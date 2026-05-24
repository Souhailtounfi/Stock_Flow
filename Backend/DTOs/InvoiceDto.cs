using System;
using System.Collections.Generic;

namespace Backend.DTOs
{
    public class InvoiceItemCreateDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class InvoiceCreateDto
    {
        public int CustomerId { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public decimal TaxRate { get; set; } = 0;
        public List<InvoiceItemCreateDto> Items { get; set; } = new List<InvoiceItemCreateDto>();
    }

    public class InvoiceStatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class InvoiceItemResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductBarcode { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class InvoiceResponseDto
    {
        public int Id { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public string Status { get; set; } = "Pending";
        public string Notes { get; set; } = string.Empty;

        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;

        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;

        public decimal SubTotal { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }

        public List<InvoiceItemResponseDto> Items { get; set; } = new List<InvoiceItemResponseDto>();
    }
}
