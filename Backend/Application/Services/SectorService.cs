using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class SectorService : ISectorService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SectorService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<SectorDto>> GetAllSectorsAsync()
        {
            var sectors = await _unitOfWork.Repository<Sector>()
                .GetQueryable()
                .OrderBy(s => s.Name)
                .ToListAsync();

            return sectors.Select(s => new SectorDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            });
        }

        public async Task<SectorDto?> GetSectorByIdAsync(int id)
        {
            var sector = await _unitOfWork.Repository<Sector>()
                .GetByIdAsync(id);

            if (sector == null)
                return null;

            return new SectorDto
            {
                Id = sector.Id,
                Name = sector.Name,
                Description = sector.Description,
                IsActive = sector.IsActive,
                CreatedAt = sector.CreatedAt,
                UpdatedAt = sector.UpdatedAt
            };
        }

        public async Task<SectorDto> CreateSectorAsync(CreateSectorDto createDto)
        {
            var sector = new Sector
            {
                Name = createDto.Name,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Sector>().AddAsync(sector);
            await _unitOfWork.SaveChangesAsync();

            return new SectorDto
            {
                Id = sector.Id,
                Name = sector.Name,
                Description = sector.Description,
                IsActive = sector.IsActive,
                CreatedAt = sector.CreatedAt,
                UpdatedAt = sector.UpdatedAt
            };
        }

        public async Task<SectorDto> UpdateSectorAsync(int id, UpdateSectorDto updateDto)
        {
            var sector = await _unitOfWork.Repository<Sector>()
                .GetByIdAsync(id);

            if (sector == null)
                throw new KeyNotFoundException($"Sector with ID {id} not found");

            sector.Name = updateDto.Name;
            sector.Description = updateDto.Description;
            sector.IsActive = updateDto.IsActive;
            sector.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Sector>().Update(sector);
            await _unitOfWork.SaveChangesAsync();

            return new SectorDto
            {
                Id = sector.Id,
                Name = sector.Name,
                Description = sector.Description,
                IsActive = sector.IsActive,
                CreatedAt = sector.CreatedAt,
                UpdatedAt = sector.UpdatedAt
            };
        }

        public async Task<bool> DeleteSectorAsync(int id)
        {
            var sector = await _unitOfWork.Repository<Sector>()
                .GetByIdAsync(id);

            if (sector == null)
                return false;

            _unitOfWork.Repository<Sector>().Delete(sector);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}


