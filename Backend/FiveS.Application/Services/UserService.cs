using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Domain.Entities;
using FiveS.Domain.Interfaces;
using FiveS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace FiveS.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IRepository<User> userRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync(int? filterSectorId = null, int? filterDirectorateId = null)
        {
            var query = _unitOfWork.Repository<User>()
                .GetQueryable()
                .Include(u => u.Department)
                .Include(u => u.Sector)
                .Include(u => u.Directorate)
                .Include(u => u.Role)
                .AsQueryable();
            
            // Apply filters if provided
            if (filterSectorId.HasValue)
            {
                query = query.Where(u => u.SectorId == filterSectorId.Value);
            }
            
            if (filterDirectorateId.HasValue)
            {
                query = query.Where(u => u.DirectorateId == filterDirectorateId.Value);
            }
            
            var users = await query.ToListAsync();
            return users.Select(MapToUserDto);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _unitOfWork.Repository<User>()
                .GetQueryable()
                .Include(u => u.Department)
                .Include(u => u.Sector)
                .Include(u => u.Directorate)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);
            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            // Check if user with email exists
            var existingUsers = await _userRepository.FindAsync(u => u.Email == createUserDto.Email);
            if (existingUsers.Any())
            {
                throw new InvalidOperationException("User with this email already exists");
            }

            var user = new User
            {
                Email = createUserDto.Email,
                PasswordHash = PasswordHasher.HashPassword(createUserDto.Password),
                Name = createUserDto.Name,
                Username = createUserDto.Username,
                Sicil = createUserDto.Sicil,
                SectorId = createUserDto.SectorId,
                DirectorateId = createUserDto.DirectorateId,
                RoleId = createUserDto.RoleId,
                DepartmentId = createUserDto.DepartmentId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToUserDto(user);
        }

        public async Task<UserDto> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Check if email is taken by another user
            if (!string.IsNullOrEmpty(updateUserDto.Email) && updateUserDto.Email != user.Email)
            {
                var existingUsers = await _userRepository.FindAsync(u => u.Email == updateUserDto.Email && u.Id != id);
                if (existingUsers.Any())
                {
                    throw new InvalidOperationException("Email already taken by another user");
                }
                user.Email = updateUserDto.Email;
            }

            if (!string.IsNullOrEmpty(updateUserDto.Name))
                user.Name = updateUserDto.Name;

            if (updateUserDto.RoleId.HasValue)
                user.RoleId = updateUserDto.RoleId.Value;

            if (updateUserDto.DepartmentId.HasValue)
                user.DepartmentId = updateUserDto.DepartmentId;

            if (updateUserDto.IsActive.HasValue)
                user.IsActive = updateUserDto.IsActive.Value;

            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToUserDto(user);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Soft delete
            user.IsActive = false;
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task ResetPasswordAsync(int id, string newPassword)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            user.PasswordHash = PasswordHasher.HashPassword(newPassword);
            await _userRepository.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
        }

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Username = user.Username,
                Sicil = user.Sicil,
                SectorId = user.SectorId,
                Sector = user.Sector?.Name,
                DirectorateId = user.DirectorateId,
                Directorate = user.Directorate?.Name,
                Role = user.Role?.Ad ?? "",
                RoleId = user.RoleId,
                DepartmentId = user.DepartmentId,
                DepartmentName = user.Department?.Name,
                IsActive = user.IsActive,
                LastLogin = user.LastLogin,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
}

