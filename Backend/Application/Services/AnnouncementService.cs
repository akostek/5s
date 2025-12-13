using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AnnouncementService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<AnnouncementDto>> GetAllAnnouncementsAsync(bool? isActive = null)
        {
            var query = _unitOfWork.Repository<Announcement>().GetQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(a => a.IsActive == isActive.Value);
            }

            var announcements = await query
                .OrderByDescending(a => a.AnnouncementDate)
                .ThenByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements.Select(MapToAnnouncementDto);
        }

        public async Task<AnnouncementDto?> GetAnnouncementByIdAsync(int id)
        {
            var announcement = await _unitOfWork.Repository<Announcement>().GetByIdAsync(id);
            return announcement != null ? MapToAnnouncementDto(announcement) : null;
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto createDto, int? createdById = null)
        {
            try
            {
                // Convert AnnouncementDate to UTC if it's not already
                var announcementDate = createDto.AnnouncementDate;
                if (announcementDate.Kind == DateTimeKind.Unspecified)
                {
                    // Assume it's local time and convert to UTC
                    announcementDate = DateTime.SpecifyKind(announcementDate, DateTimeKind.Utc);
                }
                else if (announcementDate.Kind == DateTimeKind.Local)
                {
                    announcementDate = announcementDate.ToUniversalTime();
                }

                var announcement = new Announcement
                {
                    Title = createDto.Title,
                    Content = createDto.Content,
                    AnnouncementDate = announcementDate,
                    IsActive = createDto.IsActive,
                    CreatedById = createdById,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<Announcement>().AddAsync(announcement);
                await _unitOfWork.SaveChangesAsync();

                return MapToAnnouncementDto(announcement);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                var innerMessage = dbEx.InnerException?.Message ?? dbEx.Message;
                throw new Exception($"Database error while creating announcement: {innerMessage}. Make sure 'Duyurular' table exists in the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating announcement: {ex.Message}", ex);
            }
        }

        public async Task<AnnouncementDto> UpdateAnnouncementAsync(int id, UpdateAnnouncementDto updateDto)
        {
            var announcement = await _unitOfWork.Repository<Announcement>().GetByIdAsync(id);
            if (announcement == null)
            {
                throw new KeyNotFoundException("Announcement not found");
            }

            // Convert AnnouncementDate to UTC if it's not already
            var announcementDate = updateDto.AnnouncementDate;
            if (announcementDate.Kind == DateTimeKind.Unspecified)
            {
                // Assume it's local time and convert to UTC
                announcementDate = DateTime.SpecifyKind(announcementDate, DateTimeKind.Utc);
            }
            else if (announcementDate.Kind == DateTimeKind.Local)
            {
                announcementDate = announcementDate.ToUniversalTime();
            }

            announcement.Title = updateDto.Title;
            announcement.Content = updateDto.Content;
            announcement.AnnouncementDate = announcementDate;
            announcement.IsActive = updateDto.IsActive;
            announcement.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<Announcement>().Update(announcement);
            await _unitOfWork.SaveChangesAsync();

            return MapToAnnouncementDto(announcement);
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            var announcement = await _unitOfWork.Repository<Announcement>().GetByIdAsync(id);
            if (announcement == null)
            {
                return false;
            }

            _unitOfWork.Repository<Announcement>().Delete(announcement);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        private static AnnouncementDto MapToAnnouncementDto(Announcement announcement)
        {
            return new AnnouncementDto
            {
                Id = announcement.Id,
                Title = announcement.Title,
                Content = announcement.Content,
                AnnouncementDate = announcement.AnnouncementDate,
                IsActive = announcement.IsActive,
                CreatedById = announcement.CreatedById,
                CreatedAt = announcement.CreatedAt,
                UpdatedAt = announcement.UpdatedAt
            };
        }
    }
}


