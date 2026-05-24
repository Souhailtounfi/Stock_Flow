using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<object> _passwordHasher;

        public AuthService(
            IUserRepository userRepository,
            IRepository<Role> roleRepository,
            IMapper mapper,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _mapper = mapper;
            _configuration = configuration;
            _passwordHasher = new PasswordHasher<object>();
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUser != null)
                throw new ArgumentException("Username is already taken.");

            var existingEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingEmail != null)
                throw new ArgumentException("Email is already registered.");

            var role = await _roleRepository.GetByIdAsync(request.RoleId);
            if (role == null)
                throw new ArgumentException("Invalid role selected.");

            var user = _mapper.Map<User>(request);
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            var savedUser = await _userRepository.GetByIdWithRoleAsync(user.Id);
            return await GenerateAuthResponseAsync(savedUser!);
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            if (user == null)
                return null;

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
                return null;

            return await GenerateAuthResponseAsync(user);
        }

        private Task<AuthResponse> GenerateAuthResponseAsync(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _configuration["Jwt:Key"] ?? "super_secret_key_that_is_long_enough_for_sha256_signing_123456";
            var key = Encoding.ASCII.GetBytes(keyString);

            var expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:DurationInMinutes"] ?? "60"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role != null ? user.Role.Name : "Employee")
                }),
                Expires = expires,
                Issuer = _configuration["Jwt:Issuer"] ?? "StockManagerAPI",
                Audience = _configuration["Jwt:Audience"] ?? "StockManagerApp",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var response = _mapper.Map<AuthResponse>(user);
            response.Token = tokenString;
            response.Expiration = expires;

            return Task.FromResult(response);
        }
    }
}
