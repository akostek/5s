using FiveS.Application.DTOs;

namespace FiveS.Application.Interfaces
{
    public interface IAreaService
    {
        Task<IEnumerable<AreaDto>> GetAllAreasAsync();
        Task<IEnumerable<AreaDto>> GetAreasByDepartmentAsync(int departmentId);
        Task<AreaDto?> GetAreaByIdAsync(int id);
        Task<AreaDto> CreateAreaAsync(CreateAreaDto createDto);
        Task<AreaDto> UpdateAreaAsync(int id, UpdateAreaDto updateDto);
        Task<bool> DeleteAreaAsync(int id);
    }
}


