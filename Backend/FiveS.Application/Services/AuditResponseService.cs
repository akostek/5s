using FiveS.Application.DTOs;
using FiveS.Domain.Entities;
using FiveS.Domain.Enums;
using FiveS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FiveS.Application.Services
{
    public class AuditResponseService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuditResponseService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task SaveAuditResponseAsync(SubmitAuditResponseDto dto)
        {
            try
            {
                // Check if audit exists
                var audit = await _unitOfWork.Repository<Audit>()
                    .GetByIdAsync(dto.AuditId);
                if (audit == null)
                {
                    throw new Exception($"Audit with ID {dto.AuditId} not found");
                }

                // Check if question exists
                var question = await _unitOfWork.Repository<Question>()
                    .GetByIdAsync(dto.QuestionId);
                if (question == null)
                {
                    throw new Exception($"Question with ID {dto.QuestionId} not found");
                }

                // Calculate points based on response level
                int points = dto.Response switch
                {
                    ResponseLevel.High => question.PointsHigh,
                    ResponseLevel.Medium => question.PointsMedium,
                    ResponseLevel.Low => question.PointsLow,
                    _ => 0
                };

                // Check if response already exists
                var existingResponse = await _unitOfWork.Repository<AuditResponse>()
                    .GetQueryable()
                    .FirstOrDefaultAsync(r => r.AuditId == dto.AuditId && r.QuestionId == dto.QuestionId);

                // Store image file names as comma-separated string
                string? imageFileNames = null;
                if (dto.ImageUrls != null && dto.ImageUrls.Count > 0)
                {
                    // Extract file names from URLs (format: /uploads/images/filename.jpg)
                    var fileNames = dto.ImageUrls
                        .Select(url => 
                        {
                            // Extract filename from URL
                            if (url.Contains("/uploads/images/"))
                            {
                                return url.Split("/uploads/images/").LastOrDefault() ?? url;
                            }
                            // If it's already a filename, use it directly
                            return url;
                        })
                        .Where(fn => !string.IsNullOrEmpty(fn))
                        .ToList();
                    
                    if (fileNames.Count > 0)
                    {
                        imageFileNames = string.Join(",", fileNames);
                    }
                }

                if (existingResponse != null)
                {
                    // Update existing response
                    existingResponse.Response = dto.Response;
                    existingResponse.PointsAwarded = points;
                    existingResponse.ImageUrls = imageFileNames;
                    existingResponse.UpdatedAt = DateTime.UtcNow;
                    await _unitOfWork.Repository<AuditResponse>().UpdateAsync(existingResponse);
                }
                else
                {
                    // Create new response
                    var response = new AuditResponse
                    {
                        AuditId = dto.AuditId,
                        QuestionId = dto.QuestionId,
                        Response = dto.Response,
                        PointsAwarded = points,
                        ImageUrls = imageFileNames,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Repository<AuditResponse>().AddAsync(response);
                }

                await _unitOfWork.SaveChangesAsync();

                // Update audit scores and status
                await UpdateAuditScoresAndStatusAsync(dto.AuditId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error saving audit response: {ex.Message}", ex);
            }
        }

        private async Task UpdateAuditScoresAndStatusAsync(int auditId)
        {
            var audit = await _unitOfWork.Repository<Audit>()
                .GetQueryable()
                .Include(a => a.Department)
                .Include(a => a.Sector)
                .Include(a => a.Directorate)
                .Include(a => a.Area)
                .FirstOrDefaultAsync(a => a.Id == auditId);
            if (audit == null) return;

            // Get all responses for this audit with question information
            var responses = await _unitOfWork.Repository<AuditResponse>()
                .GetQueryable()
                .Where(r => r.AuditId == auditId)
                .Include(r => r.Question)
                    .ThenInclude(q => q.Category)
                .ToListAsync();

            // Get audit's sector, directorate, department, area names for filtering questions
            string? sectorName = audit.Sector?.Name;
            string? directorateName = audit.Directorate?.Name;
            string? departmentName = audit.Department?.Name;
            string? areaName = audit.Area?.Name;

            // Get all active questions that apply to this audit
            // Filter by audit's sector, directorate, department, area
            // If filter value is null/empty, don't filter by that field (show all)
            // If question has no specific value for a field (null or empty), it applies to all (wildcard)
            // If question has a specific value, it must match exactly with audit's value
            var applicableQuestions = await _unitOfWork.Repository<Question>()
                .GetQueryable()
                .Include(q => q.Category)
                .Where(q => q.IsActive &&
                    (string.IsNullOrEmpty(sectorName) || string.IsNullOrEmpty(q.Sector) || q.Sector == sectorName) &&
                    (string.IsNullOrEmpty(directorateName) || string.IsNullOrEmpty(q.Directorate) || q.Directorate == directorateName) &&
                    (string.IsNullOrEmpty(departmentName) || string.IsNullOrEmpty(q.Department) || q.Department == departmentName) &&
                    (string.IsNullOrEmpty(areaName) || string.IsNullOrEmpty(q.Area) || q.Area == areaName)
                )
                .ToListAsync();

            // Calculate total score: sum of all points awarded in responses
            int totalScore = responses.Sum(r => r.PointsAwarded);

            // Calculate max possible score: sum of all High points for all applicable questions
            int maxPossibleScore = applicableQuestions.Sum(q => q.PointsHigh);

            // Determine 5S level based on percentage using LevelThreshold table
            string? levelAchieved = null;
            if (maxPossibleScore > 0)
            {
                double percentage = (double)totalScore / maxPossibleScore * 100;
                
                // Get audit's sector to filter level thresholds
                int? sectorId = audit.SectorId;
                
                // Get level thresholds from database, ordered by MinPercentage descending
                var levelThresholds = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .Where(lt => lt.SectorId == null || lt.SectorId == sectorId)
                    .OrderByDescending(lt => lt.MinPercentage)
                    .ToListAsync();
                
                // Find the matching level threshold
                foreach (var threshold in levelThresholds)
                {
                    if (percentage >= (double)threshold.MinPercentage && percentage <= (double)threshold.MaxPercentage)
                    {
                        levelAchieved = threshold.LevelName;
                        break;
                    }
                }
                
                // If no match found, default to "Başlangıç S" or "1S"
                if (string.IsNullOrEmpty(levelAchieved))
                {
                    levelAchieved = percentage > 0 ? "1S" : "Başlangıç S";
                }
            }

            // Update audit
            audit.TotalScore = totalScore;
            audit.MaxPossibleScore = maxPossibleScore;
            audit.LevelAchieved = levelAchieved;

            // Update status based on completion
            // Get total number of applicable questions
            int totalQuestions = applicableQuestions.Count;
            int answeredQuestions = responses.Count;

            if (answeredQuestions == 0)
            {
                audit.Status = "planlandı";
            }
            else if (answeredQuestions < totalQuestions)
            {
                audit.Status = "devam";
            }
            else
            {
                // All questions answered, but not published yet
                if (audit.Status != "denetlendi" && audit.Status != "yayınlandı")
                {
                    audit.Status = "tamamlandı";
                }
            }

            audit.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Repository<Audit>().UpdateAsync(audit);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditResponseDto>> GetAuditResponsesByAuditIdAsync(int auditId)
        {
            try
            {
                var responses = await _unitOfWork.Repository<AuditResponse>()
                    .GetQueryable()
                    .Where(r => r.AuditId == auditId)
                    .Include(r => r.Question)
                        .ThenInclude(q => q.Category)
                    .ToListAsync();

                return responses.Select(r => 
                {
                    // Parse comma-separated image file names and convert to URLs
                    List<string>? imageUrls = null;
                    if (!string.IsNullOrEmpty(r.ImageUrls))
                    {
                        // Split by comma and convert to full URLs
                        var fileNames = r.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(fn => fn.Trim())
                            .Where(fn => !string.IsNullOrEmpty(fn))
                            .ToList();
                        
                        if (fileNames.Count > 0)
                        {
                            imageUrls = fileNames.Select(fn => $"/uploads/images/{fn}").ToList();
                        }
                    }

                    return new AuditResponseDto
                    {
                        Id = r.Id,
                        AuditId = r.AuditId,
                        QuestionId = r.QuestionId,
                        QuestionText = r.Question?.Text,
                        CategoryName = r.Question?.Category?.Name,
                        Response = r.Response,
                        PointsAwarded = r.PointsAwarded,
                        ImageUrls = imageUrls,
                        CreatedAt = r.CreatedAt,
                        UpdatedAt = r.UpdatedAt
                    };
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error loading audit responses: {ex.Message}", ex);
            }
        }
    }
}

