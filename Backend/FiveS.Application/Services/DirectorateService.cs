using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Domain.Entities;
using FiveS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FiveS.Application.Services
{
    public class DirectorateService : IDirectorateService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DirectorateService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<DirectorateDto>> GetAllDirectoratesAsync()
        {
            var directorates = await _unitOfWork.Repository<Directorate>()
                .GetQueryable()
                .Include(d => d.Sector)
                .OrderBy(d => d.Name)
                .ToListAsync();

            return directorates.Select(d => new DirectorateDto
            {
                Id = d.Id,
                Name = d.Name,
                SectorId = d.SectorId,
                SectorName = d.Sector?.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            });
        }

        public async Task<DirectorateDto?> GetDirectorateByIdAsync(int id)
        {
            var directorate = await _unitOfWork.Repository<Directorate>()
                .GetQueryable()
                .Include(d => d.Sector)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (directorate == null)
                return null;

            return new DirectorateDto
            {
                Id = directorate.Id,
                Name = directorate.Name,
                SectorId = directorate.SectorId,
                SectorName = directorate.Sector?.Name,
                Description = directorate.Description,
                IsActive = directorate.IsActive,
                CreatedAt = directorate.CreatedAt,
                UpdatedAt = directorate.UpdatedAt
            };
        }

        public async Task<DirectorateDto> CreateDirectorateAsync(CreateDirectorateDto createDto)
        {
            var directorate = new Directorate
            {
                Name = createDto.Name,
                SectorId = createDto.SectorId,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Directorate>().AddAsync(directorate);
            await _unitOfWork.SaveChangesAsync();

            // Reload with sector
            var created = await _unitOfWork.Repository<Directorate>()
                .GetQueryable()
                .Include(d => d.Sector)
                .FirstAsync(d => d.Id == directorate.Id);

            return new DirectorateDto
            {
                Id = created.Id,
                Name = created.Name,
                SectorId = created.SectorId,
                SectorName = created.Sector?.Name,
                Description = created.Description,
                IsActive = created.IsActive,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt
            };
        }

        public async Task<DirectorateDto> UpdateDirectorateAsync(int id, UpdateDirectorateDto updateDto)
        {
            var directorate = await _unitOfWork.Repository<Directorate>()
                .GetByIdAsync(id);

            if (directorate == null)
                throw new KeyNotFoundException($"Directorate with ID {id} not found");

            directorate.Name = updateDto.Name;
            directorate.SectorId = updateDto.SectorId;
            directorate.Description = updateDto.Description;
            directorate.IsActive = updateDto.IsActive;
            directorate.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Directorate>().Update(directorate);
            await _unitOfWork.SaveChangesAsync();

            // Reload with sector
            var updated = await _unitOfWork.Repository<Directorate>()
                .GetQueryable()
                .Include(d => d.Sector)
                .FirstAsync(d => d.Id == id);

            return new DirectorateDto
            {
                Id = updated.Id,
                Name = updated.Name,
                SectorId = updated.SectorId,
                SectorName = updated.Sector?.Name,
                Description = updated.Description,
                IsActive = updated.IsActive,
                CreatedAt = updated.CreatedAt,
                UpdatedAt = updated.UpdatedAt
            };
        }

        public async Task<bool> DeleteDirectorateAsync(int id)
        {
            var directorate = await _unitOfWork.Repository<Directorate>()
                .GetByIdAsync(id);

            if (directorate == null)
                return false;

            _unitOfWork.Repository<Directorate>().Delete(directorate);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}

