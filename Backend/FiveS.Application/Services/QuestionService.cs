using FiveS.Application.DTOs;
using FiveS.Domain.Entities;
using FiveS.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FiveS.Application.Services
{
    public class QuestionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public QuestionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<QuestionDto>> GetActiveQuestionsAsync(int? categoryId = null, string? sectorName = null, string? directorateName = null, string? departmentName = null, string? areaName = null)
        {
            try
            {
                IQueryable<Question> query = _unitOfWork.Repository<Question>()
                    .GetQueryable()
                    .Include(q => q.Category)
                    .Where(q => q.IsActive);

                if (categoryId.HasValue)
                {
                    query = query.Where(q => q.CategoryId == categoryId.Value);
                }

                // Filter by audit/user's sector, directorate, department, area
                // If filter value is null/empty, don't filter by that field (show all)
                // If question has no specific value for a field (null or empty), it applies to all (wildcard)
                // If question has a specific value, it must match exactly with audit/user's value
                // All conditions must be satisfied (AND logic)
                query = query.Where(q => 
                    (string.IsNullOrEmpty(sectorName) || string.IsNullOrEmpty(q.Sector) || q.Sector == sectorName) &&
                    (string.IsNullOrEmpty(directorateName) || string.IsNullOrEmpty(q.Directorate) || q.Directorate == directorateName) &&
                    (string.IsNullOrEmpty(departmentName) || string.IsNullOrEmpty(q.Department) || q.Department == departmentName) &&
                    (string.IsNullOrEmpty(areaName) || string.IsNullOrEmpty(q.Area) || q.Area == areaName)
                );

                var questions = await query
                    .OrderBy(q => q.Category.OrderIndex)
                    .ThenBy(q => q.OrderIndex)
                    .ToListAsync();

                // Fetch all sectors, directorates, departments, areas, and level thresholds for lookup
                var sectors = await _unitOfWork.Repository<Sector>()
                    .GetQueryable()
                    .ToListAsync();
                var directorates = await _unitOfWork.Repository<Directorate>()
                    .GetQueryable()
                    .ToListAsync();
                var departments = await _unitOfWork.Repository<Department>()
                    .GetQueryable()
                    .ToListAsync();
                var areas = await _unitOfWork.Repository<Area>()
                    .GetQueryable()
                    .ToListAsync();
                var levelThresholds = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .ToListAsync();

                return questions.Select(q => {
                    // Use CategoryId as LevelThresholdId to get LevelName
                    var levelThreshold = levelThresholds.FirstOrDefault(lt => lt.Id == q.CategoryId);
                    return new QuestionDto
                    {
                        Id = q.Id,
                        CategoryId = q.CategoryId,
                        CategoryName = levelThreshold != null ? levelThreshold.LevelName : q.Category.Name,
                        Text = q.Text,
                    Sector = ResolveName(q.Sector, sectors, s => s.Id, s => s.Name),
                    Directorate = ResolveName(q.Directorate, directorates, d => d.Id, d => d.Name),
                    Department = ResolveName(q.Department, departments, d => d.Id, d => d.Name),
                    Area = ResolveName(q.Area, areas, a => a.Id, a => a.Name),
                    OrderIndex = q.OrderIndex,
                    PointsHigh = q.PointsHigh,
                    PointsMedium = q.PointsMedium,
                    PointsLow = q.PointsLow,
                    IsActive = q.IsActive
                    };
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving questions: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<QuestionDto>> GetAllQuestionsAsync(int? categoryId = null, string? sectorName = null, string? directorateName = null, string? departmentName = null, string? areaName = null)
        {
            try
            {
                IQueryable<Question> query = _unitOfWork.Repository<Question>()
                    .GetQueryable()
                    .Include(q => q.Category);

                if (categoryId.HasValue)
                {
                    query = query.Where(q => q.CategoryId == categoryId.Value);
                }

                // Filter by audit/user's sector, directorate, department, area
                // If filter value is null/empty, don't filter by that field (show all)
                // If question has no specific value for a field (null or empty), it applies to all (wildcard)
                // If question has a specific value, it must match exactly with audit/user's value
                // All conditions must be satisfied (AND logic)
                query = query.Where(q => 
                    (string.IsNullOrEmpty(sectorName) || string.IsNullOrEmpty(q.Sector) || q.Sector == sectorName) &&
                    (string.IsNullOrEmpty(directorateName) || string.IsNullOrEmpty(q.Directorate) || q.Directorate == directorateName) &&
                    (string.IsNullOrEmpty(departmentName) || string.IsNullOrEmpty(q.Department) || q.Department == departmentName) &&
                    (string.IsNullOrEmpty(areaName) || string.IsNullOrEmpty(q.Area) || q.Area == areaName)
                );

                var questions = await query
                    .OrderBy(q => q.Category.OrderIndex)
                    .ThenBy(q => q.OrderIndex)
                    .ToListAsync();

                // Fetch all sectors, directorates, departments, areas, and level thresholds for lookup
                var sectors = await _unitOfWork.Repository<Sector>()
                    .GetQueryable()
                    .ToListAsync();
                var directorates = await _unitOfWork.Repository<Directorate>()
                    .GetQueryable()
                    .ToListAsync();
                var departments = await _unitOfWork.Repository<Department>()
                    .GetQueryable()
                    .ToListAsync();
                var areas = await _unitOfWork.Repository<Area>()
                    .GetQueryable()
                    .ToListAsync();
                var levelThresholds = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .ToListAsync();

                return questions.Select(q => {
                    // Use CategoryId as LevelThresholdId to get LevelName
                    var levelThreshold = levelThresholds.FirstOrDefault(lt => lt.Id == q.CategoryId);
                    return new QuestionDto
                    {
                        Id = q.Id,
                        CategoryId = q.CategoryId,
                        CategoryName = levelThreshold != null ? levelThreshold.LevelName : q.Category.Name,
                        Text = q.Text,
                    Sector = ResolveName(q.Sector, sectors, s => s.Id, s => s.Name),
                    Directorate = ResolveName(q.Directorate, directorates, d => d.Id, d => d.Name),
                    Department = ResolveName(q.Department, departments, d => d.Id, d => d.Name),
                    Area = ResolveName(q.Area, areas, a => a.Id, a => a.Name),
                    OrderIndex = q.OrderIndex,
                    PointsHigh = q.PointsHigh,
                    PointsMedium = q.PointsMedium,
                    PointsLow = q.PointsLow,
                    IsActive = q.IsActive
                    };
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving questions: {ex.Message}", ex);
            }
        }

        private string? ResolveName<T>(string? value, List<T> entities, Func<T, int> getId, Func<T, string> getName)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value;

            // Try to parse as integer ID
            if (int.TryParse(value, out int id))
            {
                var entity = entities.FirstOrDefault(e => getId(e) == id);
                return entity != null ? getName(entity) : value;
            }

            // If not a number, return as-is (might already be a name)
            return value;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _unitOfWork.Repository<Category>()
                    .GetQueryable()
                    .OrderBy(c => c.OrderIndex)
                    .ToListAsync();

                return categories.Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    OrderIndex = c.OrderIndex,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving categories: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<LevelThresholdDto>> GetLevelThresholdsAsync()
        {
            try
            {
                var levelThresholds = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .Include(lt => lt.Sector)
                    .OrderBy(lt => lt.Id)
                    .ToListAsync();

                return levelThresholds.Select(lt => new LevelThresholdDto
                {
                    Id = lt.Id,
                    LevelName = lt.LevelName,
                    MinPercentage = lt.MinPercentage,
                    MaxPercentage = lt.MaxPercentage,
                    SectorId = lt.SectorId,
                    SectorName = lt.Sector?.Name,
                    CreatedAt = lt.CreatedAt,
                    UpdatedAt = lt.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving level thresholds: {ex.Message}", ex);
            }
        }

        public async Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createDto)
        {
            try
            {
                // Verify category exists
                // Frontend now sends Category ID directly from categories table
                if (createDto.CategoryId <= 0)
                {
                    throw new ArgumentException($"Invalid CategoryId: {createDto.CategoryId}. CategoryId must be greater than 0.");
                }

                int actualCategoryId = createDto.CategoryId;
                
                var category = await _unitOfWork.Repository<Category>()
                    .GetByIdAsync(actualCategoryId);
                
                if (category == null)
                {
                    throw new KeyNotFoundException($"Category with ID {actualCategoryId} not found");
                }

                var question = new Question
                {
                    CategoryId = actualCategoryId,
                    Text = createDto.Text.Trim(),
                    Sector = string.IsNullOrWhiteSpace(createDto.Sector) ? null : createDto.Sector.Trim(),
                    Directorate = string.IsNullOrWhiteSpace(createDto.Directorate) ? null : createDto.Directorate.Trim(),
                    Department = string.IsNullOrWhiteSpace(createDto.Department) ? null : createDto.Department.Trim(),
                    Area = string.IsNullOrWhiteSpace(createDto.Area) ? null : createDto.Area.Trim(),
                    OrderIndex = createDto.OrderIndex,
                    PointsHigh = createDto.PointsHigh,
                    PointsMedium = createDto.PointsMedium,
                    PointsLow = createDto.PointsLow,
                    IsActive = createDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<Question>().AddAsync(question);
                await _unitOfWork.SaveChangesAsync();

                // Reload with category
                var created = await _unitOfWork.Repository<Question>()
                    .GetQueryable()
                    .Include(q => q.Category)
                    .FirstAsync(q => q.Id == question.Id);

                return new QuestionDto
                {
                    Id = created.Id,
                    CategoryId = created.CategoryId,
                    CategoryName = created.Category?.Name ?? string.Empty,
                    Text = created.Text,
                    Sector = created.Sector,
                    Directorate = created.Directorate,
                    Department = created.Department,
                    Area = created.Area,
                    OrderIndex = created.OrderIndex,
                    PointsHigh = created.PointsHigh,
                    PointsMedium = created.PointsMedium,
                    PointsLow = created.PointsLow,
                    IsActive = created.IsActive
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating question: {ex.Message}", ex);
            }
        }

        public async Task<QuestionDto> UpdateQuestionAsync(int id, UpdateQuestionDto updateDto)
        {
            try
            {
                var question = await _unitOfWork.Repository<Question>()
                    .GetQueryable()
                    .Include(q => q.Category)
                    .FirstOrDefaultAsync(q => q.Id == id);

                if (question == null)
                {
                    throw new KeyNotFoundException($"Question with ID {id} not found");
                }

                // Verify category exists if provided
                if (updateDto.CategoryId.HasValue)
                {
                    // Frontend now sends Category ID directly from categories table
                    int actualCategoryId = updateDto.CategoryId.Value;
                    
                    var category = await _unitOfWork.Repository<Category>()
                        .GetByIdAsync(actualCategoryId);
                    
                    if (category == null)
                    {
                        throw new KeyNotFoundException($"Category with ID {actualCategoryId} not found");
                    }
                    question.CategoryId = actualCategoryId;
                }

                if (!string.IsNullOrWhiteSpace(updateDto.Text))
                {
                    question.Text = updateDto.Text.Trim();
                }

                if (updateDto.Sector != null)
                {
                    question.Sector = string.IsNullOrWhiteSpace(updateDto.Sector) ? null : updateDto.Sector.Trim();
                }

                if (updateDto.Directorate != null)
                {
                    question.Directorate = string.IsNullOrWhiteSpace(updateDto.Directorate) ? null : updateDto.Directorate.Trim();
                }

                if (updateDto.Department != null)
                {
                    question.Department = string.IsNullOrWhiteSpace(updateDto.Department) ? null : updateDto.Department.Trim();
                }

                if (updateDto.Area != null)
                {
                    question.Area = string.IsNullOrWhiteSpace(updateDto.Area) ? null : updateDto.Area.Trim();
                }

                if (updateDto.OrderIndex.HasValue)
                {
                    question.OrderIndex = updateDto.OrderIndex.Value;
                }

                if (updateDto.PointsHigh.HasValue)
                {
                    question.PointsHigh = updateDto.PointsHigh.Value;
                }

                if (updateDto.PointsMedium.HasValue)
                {
                    question.PointsMedium = updateDto.PointsMedium.Value;
                }

                if (updateDto.PointsLow.HasValue)
                {
                    question.PointsLow = updateDto.PointsLow.Value;
                }

                if (updateDto.IsActive.HasValue)
                {
                    question.IsActive = updateDto.IsActive.Value;
                }

                question.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Repository<Question>().Update(question);
                await _unitOfWork.SaveChangesAsync();

                // Reload with category
                var updated = await _unitOfWork.Repository<Question>()
                    .GetQueryable()
                    .Include(q => q.Category)
                    .FirstAsync(q => q.Id == id);

                // Get level threshold for CategoryName
                var levelThresholds = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .ToListAsync();
                var levelThreshold = levelThresholds.FirstOrDefault(lt => lt.Id == updated.CategoryId);

                return new QuestionDto
                {
                    Id = updated.Id,
                    CategoryId = updated.CategoryId,
                    CategoryName = levelThreshold != null ? levelThreshold.LevelName : updated.Category.Name,
                    Text = updated.Text,
                    Sector = updated.Sector,
                    Directorate = updated.Directorate,
                    Department = updated.Department,
                    Area = updated.Area,
                    OrderIndex = updated.OrderIndex,
                    PointsHigh = updated.PointsHigh,
                    PointsMedium = updated.PointsMedium,
                    PointsLow = updated.PointsLow,
                    IsActive = updated.IsActive
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating question: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteQuestionAsync(int id)
        {
            try
            {
                var question = await _unitOfWork.Repository<Question>().GetByIdAsync(id);
                if (question == null)
                {
                    return false;
                }

                _unitOfWork.Repository<Question>().Delete(question);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting question: {ex.Message}", ex);
            }
        }

        public async Task<LevelThresholdDto> CreateLevelThresholdAsync(CreateLevelThresholdDto createDto)
        {
            try
            {
                var levelThreshold = new LevelThreshold
                {
                    LevelName = createDto.LevelName.Trim(),
                    MinPercentage = createDto.MinPercentage,
                    MaxPercentage = createDto.MaxPercentage,
                    SectorId = createDto.SectorId,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<LevelThreshold>().AddAsync(levelThreshold);
                await _unitOfWork.SaveChangesAsync();

                // Reload with sector
                var created = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .Include(lt => lt.Sector)
                    .FirstAsync(lt => lt.Id == levelThreshold.Id);

                return new LevelThresholdDto
                {
                    Id = created.Id,
                    LevelName = created.LevelName,
                    MinPercentage = created.MinPercentage,
                    MaxPercentage = created.MaxPercentage,
                    SectorId = created.SectorId,
                    SectorName = created.Sector?.Name,
                    CreatedAt = created.CreatedAt,
                    UpdatedAt = created.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating level threshold: {ex.Message}", ex);
            }
        }

        public async Task<LevelThresholdDto> UpdateLevelThresholdAsync(int id, UpdateLevelThresholdDto updateDto)
        {
            try
            {
                var levelThreshold = await _unitOfWork.Repository<LevelThreshold>().GetByIdAsync(id);
                if (levelThreshold == null)
                {
                    throw new KeyNotFoundException($"Level threshold with ID {id} not found");
                }

                if (!string.IsNullOrWhiteSpace(updateDto.LevelName))
                {
                    levelThreshold.LevelName = updateDto.LevelName.Trim();
                }

                if (updateDto.MinPercentage.HasValue)
                {
                    levelThreshold.MinPercentage = updateDto.MinPercentage.Value;
                }

                if (updateDto.MaxPercentage.HasValue)
                {
                    levelThreshold.MaxPercentage = updateDto.MaxPercentage.Value;
                }

                if (updateDto.SectorId.HasValue)
                {
                    levelThreshold.SectorId = updateDto.SectorId.Value;
                }

                levelThreshold.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Repository<LevelThreshold>().Update(levelThreshold);
                await _unitOfWork.SaveChangesAsync();

                // Reload with sector
                var updated = await _unitOfWork.Repository<LevelThreshold>()
                    .GetQueryable()
                    .Include(lt => lt.Sector)
                    .FirstAsync(lt => lt.Id == id);

                return new LevelThresholdDto
                {
                    Id = updated.Id,
                    LevelName = updated.LevelName,
                    MinPercentage = updated.MinPercentage,
                    MaxPercentage = updated.MaxPercentage,
                    SectorId = updated.SectorId,
                    SectorName = updated.Sector?.Name,
                    CreatedAt = updated.CreatedAt,
                    UpdatedAt = updated.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating level threshold: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteLevelThresholdAsync(int id)
        {
            try
            {
                var levelThreshold = await _unitOfWork.Repository<LevelThreshold>().GetByIdAsync(id);
                if (levelThreshold == null)
                {
                    return false;
                }

                _unitOfWork.Repository<LevelThreshold>().Delete(levelThreshold);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting level threshold: {ex.Message}", ex);
            }
        }
    }
}

