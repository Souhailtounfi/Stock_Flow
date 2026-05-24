using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IProductRepository _productRepository;
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IStockMovementRepository _stockMovementRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IMapper _mapper;

        public DashboardService(
            IProductRepository productRepository,
            IInvoiceRepository invoiceRepository,
            IStockMovementRepository stockMovementRepository,
            IRepository<Category> categoryRepository,
            IRepository<Customer> customerRepository,
            IMapper mapper)
        {
            _productRepository = productRepository;
            _invoiceRepository = invoiceRepository;
            _stockMovementRepository = stockMovementRepository;
            _categoryRepository = categoryRepository;
            _customerRepository = customerRepository;
            _mapper = mapper;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int lowStockThreshold = 5)
        {
            var productsList = await _productRepository.GetAllAsync();
            var totalProducts = 0;
            foreach (var p in productsList) totalProducts++;

            var lowStockProducts = await _productRepository.GetLowStockProductsAsync(lowStockThreshold);
            var lowStockAlertsCount = 0;
            foreach (var p in lowStockProducts) lowStockAlertsCount++;

            var invoicesList = await _invoiceRepository.GetAllAsync();
            var totalInvoices = 0;
            decimal totalRevenue = 0;
            decimal monthlyRevenue = 0;
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            foreach (var inv in invoicesList)
            {
                totalInvoices++;
                totalRevenue += inv.TotalAmount;

                if (inv.IssueDate.Year == currentYear && inv.IssueDate.Month == currentMonth)
                {
                    monthlyRevenue += inv.TotalAmount;
                }
            }

            var categoriesList = await _categoryRepository.GetAllAsync();
            var totalCategories = 0;
            foreach (var category in categoriesList) totalCategories++;

            var customersList = await _customerRepository.GetAllAsync();
            var totalCustomers = 0;
            foreach (var customer in customersList) totalCustomers++;

            var recentInvoices = await _invoiceRepository.GetRecentInvoicesAsync(5);
            var recentMovements = await _stockMovementRepository.GetRecentMovementsAsync(5);

            return new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                TotalInvoices = totalInvoices,
                TotalRevenue = totalRevenue,
                MonthlyRevenue = monthlyRevenue,
                LowStockAlertsCount = lowStockAlertsCount,
                LowStockCount = lowStockAlertsCount,
                TotalCategories = totalCategories,
                TotalCustomers = totalCustomers,
                RecentInvoices = _mapper.Map<List<InvoiceResponseDto>>(recentInvoices),
                RecentStockMovements = _mapper.Map<List<StockMovementResponseDto>>(recentMovements),
                LowStockProducts = _mapper.Map<List<ProductResponseDto>>(lowStockProducts)
            };
        }
    }
}
