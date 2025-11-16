using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FiveS.Application.Services
{
    public class ImageUploadService
    {
        private readonly string _uploadPath;
        private readonly IHostEnvironment _environment;
        private readonly ILogger<ImageUploadService> _logger;

        public ImageUploadService(IHostEnvironment environment, ILogger<ImageUploadService> logger)
        {
            _environment = environment;
            _logger = logger;
            _uploadPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "images");
            
            // Create directory if it doesn't exist
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<string> SaveImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"File type {fileExtension} is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxFileSize)
            {
                throw new ArgumentException($"File size exceeds maximum allowed size of 5MB");
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation($"Image saved: {fileName}");
            return fileName;
        }

        public async Task<List<string>> SaveImagesAsync(List<IFormFile> files)
        {
            var savedFileNames = new List<string>();
            
            foreach (var file in files)
            {
                try
                {
                    var fileName = await SaveImageAsync(file);
                    savedFileNames.Add(fileName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error saving image: {file.FileName}");
                    throw;
                }
            }

            return savedFileNames;
        }

        public bool DeleteImage(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return false;
            }

            var filePath = Path.Combine(_uploadPath, fileName);
            
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                    _logger.LogInformation($"Image deleted: {fileName}");
                    return true;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error deleting image: {fileName}");
                    return false;
                }
            }

            return false;
        }

        public string GetImageUrl(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return string.Empty;
            }

            return $"/uploads/images/{fileName}";
        }
    }
}

