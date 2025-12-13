using Application.DTOs;

namespace Application.Interfaces
{
    public interface ISectorService
    {
        Task<IEnumerable<SectorDto>> GetAllSectorsAsync();
        Task<SectorDto?> GetSectorByIdAsync(int id);
        Task<SectorDto> CreateSectorAsync(CreateSectorDto createDto);
        Task<SectorDto> UpdateSectorAsync(int id, UpdateSectorDto updateDto);
        Task<bool> DeleteSectorAsync(int id);
    }
}


