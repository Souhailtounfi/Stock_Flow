using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IMapper _mapper;

        public UserController(
            IUserRepository userRepository,
            IRepository<Role> roleRepository,
            IMapper mapper)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepository.GetAllWithRolesAsync();
            return Ok(_mapper.Map<IEnumerable<UserResponseDto>>(users));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found." });

            if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
            {
                var existingUsername = await _userRepository.GetByUsernameAsync(dto.Username);
                if (existingUsername != null && existingUsername.Id != id)
                    return BadRequest(new { message = "Username is already taken." });

                user.Username = dto.Username;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
                if (existingEmail != null && existingEmail.Id != id)
                    return BadRequest(new { message = "Email is already registered." });

                user.Email = dto.Email;
            }

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            var updatedUser = await _userRepository.GetByIdWithRoleAsync(user.Id);
            return Ok(_mapper.Map<UserResponseDto>(updatedUser!));
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UserUpdateDto dto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found." });

            var role = await _roleRepository.GetByIdAsync(dto.RoleId);
            if (role == null)
                return BadRequest(new { message = "Invalid Role ID." });

            user.RoleId = dto.RoleId;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            var savedUser = await _userRepository.GetByIdWithRoleAsync(user.Id);
            return Ok(_mapper.Map<UserResponseDto>(savedUser!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found." });

            if (user.Username.ToLower() == "admin")
                return BadRequest(new { message = "Cannot delete the default admin account." });

            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();
            return NoContent();
        }
    }
}
