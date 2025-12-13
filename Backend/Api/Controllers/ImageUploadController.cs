using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/ImageUpload")]
    [Authorize]
    public class ImageUploadController : ControllerBase
    {
        private readonly ImageUploadService _imageUploadService;
        private readonly ILogger<ImageUploadController> _logger;

        public ImageUploadController(ImageUploadService imageUploadService, ILogger<ImageUploadController> logger)
        {
            _imageUploadService = imageUploadService;
            _logger = logger;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Dosya seçilmedi veya dosya boş." });
            }

            try
            {
                var fileName = await _imageUploadService.SaveImageAsync(file);
                var imageUrl = _imageUploadService.GetImageUrl(fileName);
                
                return Ok(new { 
                    fileName, 
                    imageUrl,
                    message = "Resim başarıyla yüklendi." 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image");
                return StatusCode(500, new { 
                    message = "Resim yüklenirken bir hata oluştu.", 
                    error = ex.Message 
                });
            }
        }

        [HttpPost("upload-multiple")]
        [Consumes("multipart/form-data")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = 52428800)] // 50MB
        public async Task<IActionResult> UploadImages()
        {
            var files = Request.Form.Files;
            
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "Dosya seçilmedi veya dosya boş." });
            }

            // Limit to 3 images
            if (files.Count > 3)
            {
                return BadRequest(new { message = "En fazla 3 resim yüklenebilir." });
            }

            try
            {
                var fileList = files.ToList();
                var fileNames = await _imageUploadService.SaveImagesAsync(fileList);
                var imageUrls = fileNames.Select(fn => _imageUploadService.GetImageUrl(fn)).ToList();
                
                return Ok(new { 
                    fileNames,
                    imageUrls,
                    message = $"{fileNames.Count} resim başarıyla yüklendi." 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading images");
                return StatusCode(500, new { 
                    message = "Resimler yüklenirken bir hata oluştu.", 
                    error = ex.Message 
                });
            }
        }

        [HttpDelete("{fileName}")]
        public IActionResult DeleteImage(string fileName)
        {
            try
            {
                var deleted = _imageUploadService.DeleteImage(fileName);
                if (deleted)
                {
                    return Ok(new { message = "Resim başarıyla silindi." });
                }
                else
                {
                    return NotFound(new { message = "Resim bulunamadı." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image");
                return StatusCode(500, new { 
                    message = "Resim silinirken bir hata oluştu.", 
                    error = ex.Message 
                });
            }
        }
    }
}


