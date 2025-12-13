using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAnnouncementService
    {
        Task<IEnumerable<AnnouncementDto>> GetAllAnnouncementsAsync(bool? isActive = null);
        Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id);
        Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto createDto, int? createdById = null);
        Task<AnnouncementDto> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto updateDto);
        Task<bool> DeleteAnnouncementAsync(int id);
    }
}



