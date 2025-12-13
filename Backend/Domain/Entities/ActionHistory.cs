using Domain.Common;
using Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class ActionHistory : BaseEntity
    {
        public int ActionId { get; set; }
        public ActionStatus StatusFrom { get; set; }
        public ActionStatus StatusTo { get; set; }
        public string? ChangedBy { get; set; } // Username or User ID
        public string? Comment { get; set; }
        
        [ForeignKey("ActionId")]
        public virtual Action Action { get; set; } = null!;
    }
}
