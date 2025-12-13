namespace Domain.Enums
{
    /// <summary>
    /// Action status enumeration
    /// </summary>
    public enum ActionStatus
    {
        /// <summary>
        /// Open - Action needs attention
        /// </summary>
        Open,

        /// <summary>
        /// In Progress - Action is being worked on
        /// </summary>
        InProgress,

        /// <summary>
        /// Pending Approval - Action is waiting for approval
        /// </summary>
        PendingApproval,

        /// <summary>
        /// Closed - Action is completed
        /// </summary>
        Closed
    }
}


