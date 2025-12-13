namespace Domain.Enums
{
    /// <summary>
    /// User role enumeration
    /// </summary>
    public enum UserRole
    {
        /// <summary>
        /// Admin - Full system access
        /// </summary>
        Admin,

        /// <summary>
        /// Auditor - Can create and manage audits
        /// </summary>
        Denetci,

        /// <summary>
        /// Area Manager - Can manage specific areas
        /// </summary>
        AlanSorumlusu,

        /// <summary>
        /// Department Manager - Can view department audits
        /// </summary>
        BolumSorumlusu
    }
}


