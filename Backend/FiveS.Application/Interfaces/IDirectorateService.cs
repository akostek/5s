using FiveS.Application.DTOs;

namespace FiveS.Application.Interfaces
{
    public interface IDirectorateService
    {
        Task<IEnumerable<DirectorateDto>> GetAllDirectoratesAsync();
        Task<DirectorateDto?> GetDirectorateByIdAsync(int id);
        Task<DirectorateDto> CreateDirectorateAsync(CreateDirectorateDto createDto);
        Task<DirectorateDto> UpdateDirectorateAsync(int id, UpdateDirectorateDto updateDto);
        Task<bool> DeleteDirectorateAsync(int id);
    }
}

