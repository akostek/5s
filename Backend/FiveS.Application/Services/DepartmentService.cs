using System;
using FiveS.Application.DTOs;
using FiveS.Application.Interfaces;
using FiveS.Domain.Entities;
using FiveS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FiveS.Application.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DepartmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        private async Task<int?> ResolveSectorIdAsync(int? sectorId, string? sectorName)
        {
            if (sectorId.HasValue)
                return sectorId.Value;

            if (string.IsNullOrWhiteSpace(sectorName))
                return null;

            var trimmedName = sectorName.Trim();
            var sectorRepository = _unitOfWork.Repository<Sector>();
            var existingSector = await sectorRepository
                .GetQueryable()
                .FirstOrDefaultAsync(s => s.Name.Equals(trimmedName, StringComparison.OrdinalIgnoreCase));

            if (existingSector != null)
                return existingSector.Id;

            var newSector = new Sector
            {
                Name = trimmedName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await sectorRepository.AddAsync(newSector);
            await _unitOfWork.SaveChangesAsync();

            return newSector.Id;
        }

        private async Task<int?> ResolveDirectorateIdAsync(int? directorateId, string? directorateName)
        {
            if (directorateId.HasValue)
                return directorateId.Value;

            if (string.IsNullOrWhiteSpace(directorateName))
                return null;

            var trimmedName = directorateName.Trim();
            var directorateRepository = _unitOfWork.Repository<Directorate>();
            var existingDirectorate = await directorateRepository
                .GetQueryable()
                .FirstOrDefaultAsync(d => d.Name.Equals(trimmedName, StringComparison.OrdinalIgnoreCase));

            if (existingDirectorate != null)
                return existingDirectorate.Id;

            var newDirectorate = new Directorate
            {
                Name = trimmedName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await directorateRepository.AddAsync(newDirectorate);
            await _unitOfWork.SaveChangesAsync();

            return newDirectorate.Id;
        }

        public async Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync()
        {
            var departments = await _unitOfWork.Repository<Department>()
                .GetQueryable()
                .Include(d => d.Users)
                .Include(d => d.Sector)
                .Include(d => d.Directorate)
                .ToListAsync(); // Get all departments (including inactive)

            return departments.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                SectorId = d.SectorId,
                Sector = d.Sector?.Name,
                DirectorateId = d.DirectorateId,
                Directorate = d.Directorate?.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                UserCount = d.Users.Count,
                AuditCount = 0,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            });
        }

        public async Task<IEnumerable<DepartmentDto>> GetDepartmentsBySectorAsync(int? sectorId)
        {
            var query = _unitOfWork.Repository<Department>()
                .GetQueryable()
                .Include(d => d.Users)
                .Include(d => d.Sector)
                .Include(d => d.Directorate)
                .AsQueryable();

            // If sectorId is provided, filter by it
            // If null, return all (for Admin)
            if (sectorId.HasValue)
            {
                query = query.Where(d => d.SectorId == sectorId.Value);
            }

            var departments = await query.ToListAsync();

            return departments.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                SectorId = d.SectorId,
                Sector = d.Sector?.Name,
                DirectorateId = d.DirectorateId,
                Directorate = d.Directorate?.Name,
                Description = d.Description,
                IsActive = d.IsActive,
                UserCount = d.Users.Count,
                AuditCount = 0,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            });
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id)
        {
            var department = await _unitOfWork.Repository<Department>()
                .GetQueryable()
                .Include(d => d.Users)
                .Include(d => d.Sector)
                .Include(d => d.Directorate)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
                return null;

            return new DepartmentDto
            {
                Id = department.Id,
                Name = department.Name,
                SectorId = department.SectorId,
                Sector = department.Sector?.Name,
                DirectorateId = department.DirectorateId,
                Directorate = department.Directorate?.Name,
                Description = department.Description,
                IsActive = department.IsActive,
                UserCount = department.Users.Count,
                AuditCount = 0,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt
            };
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto createDto)
        {
            var sectorId = await ResolveSectorIdAsync(createDto.SectorId, createDto.Sector);
            var directorateId = await ResolveDirectorateIdAsync(createDto.DirectorateId, createDto.Directorate);

            var department = new Department
            {
                Name = createDto.Name,
                SectorId = sectorId,
                DirectorateId = directorateId,
                Description = createDto.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<Department>().AddAsync(department);
            await _unitOfWork.SaveChangesAsync();

            var createdDepartment = await _unitOfWork.Repository<Department>()
                .GetQueryable()
                .Include(d => d.Users)
                .Include(d => d.Sector)
                .Include(d => d.Directorate)
                .FirstAsync(d => d.Id == department.Id);

            return new DepartmentDto
            {
                Id = createdDepartment.Id,
                Name = createdDepartment.Name,
                SectorId = createdDepartment.SectorId,
                Sector = createdDepartment.Sector?.Name,
                DirectorateId = createdDepartment.DirectorateId,
                Directorate = createdDepartment.Directorate?.Name,
                Description = createdDepartment.Description,
                IsActive = createdDepartment.IsActive,
                UserCount = createdDepartment.Users.Count,
                AuditCount = 0,
                CreatedAt = createdDepartment.CreatedAt,
                UpdatedAt = createdDepartment.UpdatedAt
            };
        }

        public async Task<DepartmentDto> UpdateDepartmentAsync(int id, UpdateDepartmentDto updateDto)
        {
            var department = await _unitOfWork.Repository<Department>().GetByIdAsync(id);
            if (department == null)
                throw new KeyNotFoundException($"Department with ID {id} not found");

            if (!string.IsNullOrWhiteSpace(updateDto.Name))
                department.Name = updateDto.Name;
            
            var resolvedSectorId = await ResolveSectorIdAsync(updateDto.SectorId, updateDto.Sector);
            if (updateDto.SectorId.HasValue || updateDto.Sector != null)
                department.SectorId = resolvedSectorId;

            var resolvedDirectorateId = await ResolveDirectorateIdAsync(updateDto.DirectorateId, updateDto.Directorate);
            if (updateDto.DirectorateId.HasValue || updateDto.Directorate != null)
                department.DirectorateId = resolvedDirectorateId;

            if (updateDto.Description != null)
                department.Description = updateDto.Description;

            if (updateDto.IsActive.HasValue)
                department.IsActive = updateDto.IsActive.Value;

            department.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Department>().Update(department);
            await _unitOfWork.SaveChangesAsync();

            // Reload with navigation properties
            var updatedDepartment = await _unitOfWork.Repository<Department>()
                .GetQueryable()
                .Include(d => d.Users)
                .Include(d => d.Sector)
                .Include(d => d.Directorate)
                .FirstAsync(d => d.Id == id);

            return new DepartmentDto
            {
                Id = updatedDepartment.Id,
                Name = updatedDepartment.Name,
                SectorId = updatedDepartment.SectorId,
                Sector = updatedDepartment.Sector?.Name,
                DirectorateId = updatedDepartment.DirectorateId,
                Directorate = updatedDepartment.Directorate?.Name,
                Description = updatedDepartment.Description,
                IsActive = updatedDepartment.IsActive,
                UserCount = updatedDepartment.Users.Count,
                AuditCount = 0,
                CreatedAt = updatedDepartment.CreatedAt,
                UpdatedAt = updatedDepartment.UpdatedAt
            };
        }

        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            var department = await _unitOfWork.Repository<Department>().GetByIdAsync(id);
            if (department == null)
                return false;

            // Soft delete
            department.IsActive = false;
            department.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Department>().Update(department);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}

