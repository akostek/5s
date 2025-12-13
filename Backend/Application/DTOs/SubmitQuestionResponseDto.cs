using Domain.Enums;

namespace Application.DTOs
{
    public class SubmitQuestionResponseDto
    {
        public int QuestionId { get; set; }
        public ResponseLevel ResponseLevel { get; set; }
        public string? Notes { get; set; }
    }
}






