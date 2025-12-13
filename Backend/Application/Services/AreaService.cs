using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class AreaService : IAreaService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AreaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<AreaDto>> GetAllAreasAsync()
        {
            var areas = await _unitOfWork.Repository<Area>()
                .GetQueryable()
                .Include(a => a.Department)
                .Include(a => a.Sector)
                .Include(a => a.Directorate)
                .Where(a => a.IsActive) // Only get active areas
                .ToListAsync();

            return areas.Select(a => new AreaDto
            {
                Id = a.Id,
                DepartmentId = a.DepartmentId,
                DepartmentName = a.Department.Name,
                SectorId = a.SectorId,
                SectorName = a.Sector?.Name,
                DirectorateId = a.DirectorateId,
                DirectorateName = a.Directorate?.Name,
                Name = a.Name,
                Description = a.Description,
                ImageUrl = a.ImageUrl,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            });
        }

        public async Task<IEnumerable<AreaDto>> GetAreasByDepartmentAsync(int departmentId)
        {
            var areas = await _unitOfWork.Repository<Area>()
                .GetQueryable()
                .Include(a => a.Department)
                .Include(a => a.Sector)
                .Include(a => a.Directorate)
                .Where(a => a.DepartmentId == departmentId && a.IsActive) // Only get active areas
                .ToListAsync();

            return areas.Select(a => new AreaDto
            {
                Id = a.Id,
                DepartmentId = a.DepartmentId,
                DepartmentName = a.Department.Name,
                SectorId = a.SectorId,
                SectorName = a.Sector?.Name,
                DirectorateId = a.DirectorateId,
                DirectorateName = a.Directorate?.Name,
                Name = a.Name,
                Description = a.Description,
                ImageUrl = a.ImageUrl,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            });
        }

        public async Task<AreaDto?> GetAreaByIdAsync(int id)
        {
            var area = await _unitOfWork.Repository<Area>()
                .GetQueryable()
                .Include(a => a.Department)
                .Include(a => a.Sector)
                .Include(a => a.Directorate)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (area == null)
                return null;

            return new AreaDto
            {
                Id = area.Id,
                DepartmentId = area.DepartmentId,
                DepartmentName = area.Department.Name,
                SectorId = area.SectorId,
                SectorName = area.Sector?.Name,
                DirectorateId = area.DirectorateId,
                DirectorateName = area.Directorate?.Name,
                Name = area.Name,
                Description = area.Description,
                ImageUrl = area.ImageUrl,
                IsActive = area.IsActive,
                CreatedAt = area.CreatedAt,
                UpdatedAt = area.UpdatedAt
            };
        }

        public async Task<AreaDto> CreateAreaAsync(CreateAreaDto createDto)
        {
            var department = await _unitOfWork.Repository<Department>().GetByIdAsync(createDto.DepartmentId);
            if (department == null)
                throw new KeyNotFoundException($"Department with ID {createDto.DepartmentId} not found");

            if (string.IsNullOrWhiteSpace(createDto.ImageUrl))
                throw new ArgumentException("Alan görseli zorunludur", nameof(createDto.ImageUrl));

            var area = new Area
            {
                DepartmentId = createDto.DepartmentId,
                Name = createDto.Name,
                Description = createDto.Description,
                ImageUrl = createDto.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Area>().AddAsync(area);
            await _unitOfWork.SaveChangesAsync();

            return new AreaDto
            {
                Id = area.Id,
                DepartmentId = area.DepartmentId,
                DepartmentName = department.Name,
                Name = area.Name,
                Description = area.Description,
                ImageUrl = area.ImageUrl,
                IsActive = area.IsActive,
                CreatedAt = area.CreatedAt,
                UpdatedAt = area.UpdatedAt
            };
        }

        public async Task<AreaDto> UpdateAreaAsync(int id, UpdateAreaDto updateDto)
        {
            var area = await _unitOfWork.Repository<Area>()
                .GetQueryable()
                .Include(a => a.Department)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (area == null)
                throw new KeyNotFoundException($"Area with ID {id} not found");

            if (updateDto.DepartmentId.HasValue && updateDto.DepartmentId.Value != area.DepartmentId)
            {
                var department = await _unitOfWork.Repository<Department>().GetByIdAsync(updateDto.DepartmentId.Value);
                if (department == null)
                    throw new KeyNotFoundException($"Department with ID {updateDto.DepartmentId.Value} not found");

                area.DepartmentId = updateDto.DepartmentId.Value;
            }

            if (!string.IsNullOrWhiteSpace(updateDto.Name))
                area.Name = updateDto.Name;

            if (updateDto.Description != null)
                area.Description = updateDto.Description;

            if (!string.IsNullOrWhiteSpace(updateDto.ImageUrl))
                area.ImageUrl = updateDto.ImageUrl;

            if (updateDto.IsActive.HasValue)
                area.IsActive = updateDto.IsActive.Value;

            area.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Area>().Update(area);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties
            var updatedArea = await _unitOfWork.Repository<Area>()
                .GetQueryable()
                .Include(a => a.Department)
                .Include(a => a.Sector)
                .Include(a => a.Directorate)
                .FirstAsync(a => a.Id == id);

            return new AreaDto
            {
                Id = updatedArea.Id,
                DepartmentId = updatedArea.DepartmentId,
                DepartmentName = updatedArea.Department.Name,
                SectorId = updatedArea.SectorId,
                SectorName = updatedArea.Sector?.Name,
                DirectorateId = updatedArea.DirectorateId,
                DirectorateName = updatedArea.Directorate?.Name,
                Name = updatedArea.Name,
                Description = updatedArea.Description,
                ImageUrl = updatedArea.ImageUrl,
                IsActive = updatedArea.IsActive,
                CreatedAt = updatedArea.CreatedAt,
                UpdatedAt = updatedArea.UpdatedAt
            };
        }

        public async Task<bool> DeleteAreaAsync(int id)
        {
            var area = await _unitOfWork.Repository<Area>().GetByIdAsync(id);
            if (area == null)
                return false;

            // Soft delete
            area.IsActive = false;
            area.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Area>().Update(area);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}


