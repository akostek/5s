using Domain.Common;

namespace Domain.Entities
{
    /// <summary>
    /// Setting entity for system configuration
    /// </summary>
    public class Setting : BaseEntity
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}


