using AutoMapper;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<RegisterRequest, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.Ignore());

            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty));

            CreateMap<User, AuthResponse>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : string.Empty))
                .ForMember(dest => dest.Token, opt => opt.Ignore())
                .ForMember(dest => dest.Expiration, opt => opt.Ignore());

            // Product mappings
            CreateMap<ProductCreateDto, Product>();
            CreateMap<ProductUpdateDto, Product>();
            CreateMap<Product, ProductResponseDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty));

            // Category mappings
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<Category, CategoryResponseDto>();

            // Supplier mappings
            CreateMap<SupplierCreateDto, Supplier>();
            CreateMap<Supplier, SupplierResponseDto>();

            // Customer mappings
            CreateMap<CustomerCreateDto, Customer>();
            CreateMap<Customer, CustomerResponseDto>();

            // Invoice Item mappings
            CreateMap<InvoiceItem, InvoiceItemResponseDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
                .ForMember(dest => dest.ProductBarcode, opt => opt.MapFrom(src => src.Product != null ? src.Product.Barcode : string.Empty));

            // Invoice mappings
            CreateMap<Invoice, InvoiceResponseDto>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Name : string.Empty))
                .ForMember(dest => dest.CustomerEmail, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Email : string.Empty))
                .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Phone : string.Empty))
                .ForMember(dest => dest.CustomerAddress, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Address : string.Empty))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty));

            // Stock Movement mappings
            CreateMap<StockMovement, StockMovementResponseDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
                .ForMember(dest => dest.ProductBarcode, opt => opt.MapFrom(src => src.Product != null ? src.Product.Barcode : string.Empty))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty));
        }
    }
}
