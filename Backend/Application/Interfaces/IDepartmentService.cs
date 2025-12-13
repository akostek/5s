using Application.DTOs;

namespace Application.Interfaces
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentDto>> GetAllDepartmentsAsync();
        Task<IEnumerable<DepartmentDto>> GetDepartmentsBySectorAsync(int? sectorId);
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id);
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto createDto);
        Task<DepartmentDto> UpdateDepartmentAsync(int id, UpdateDepartmentDto updateDto);
        Task<bool> DeleteDepartmentAsync(int id);
    }
}



