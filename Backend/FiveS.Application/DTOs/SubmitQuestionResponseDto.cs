using FiveS.Domain.Enums;

namespace FiveS.Application.DTOs
{
    public class SubmitQuestionResponseDto
    {
        public int QuestionId { get; set; }
        public ResponseLevel ResponseLevel { get; set; }
        public string? Notes { get; set; }
    }
}





