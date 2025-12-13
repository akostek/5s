namespace Application.DTOs
{
    public class ActionImageDto
    {
        public int Id { get; set; }
        public int ActionId { get; set; }
        public string ImagePath { get; set; } = null!;
        public string ImageType { get; set; } = null!; // "Aksiyon" or "Kanit"
        public DateTime CreatedAt { get; set; }
    }
}
