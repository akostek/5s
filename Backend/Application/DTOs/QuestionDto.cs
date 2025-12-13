namespace Application.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string? Sector { get; set; }
        public string? Directorate { get; set; }
        public string? Department { get; set; }
        public string? Area { get; set; }
        public int OrderIndex { get; set; }
        public int PointsHigh { get; set; }
        public int PointsMedium { get; set; }
        public int PointsLow { get; set; }
        public bool IsActive { get; set; }
    }
}


