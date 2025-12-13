using Domain.Enums;

namespace Application.DTOs
{
    public class ChangeStatusDto
    {
        public ActionStatus Status { get; set; }
        public string? Comment { get; set; }
        public string? ImageUrl { get; set; }
    }
}
