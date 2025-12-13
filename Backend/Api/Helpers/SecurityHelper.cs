using Microsoft.AspNetCore.Hosting;

namespace Api.Helpers
{
    /// <summary>
    /// Security helper for production-safe error messages
    /// </summary>
    public static class SecurityHelper
    {
        /// <summary>
        /// Returns error message based on environment
        /// In production, returns generic message to prevent information disclosure
        /// </summary>
        public static string GetSafeErrorMessage(string detailedMessage, IWebHostEnvironment? environment = null)
        {
            var isDevelopment = environment?.IsDevelopment() ?? false;
            return isDevelopment ? detailedMessage : "An error occurred while processing your request.";
        }

        /// <summary>
        /// Creates a safe error response object
        /// </summary>
        public static object CreateSafeErrorResponse(string message, int statusCode, IWebHostEnvironment? environment = null, string? detailedError = null)
        {
            var isDevelopment = environment?.IsDevelopment() ?? false;
            
            var response = new
            {
                message,
                statusCode
            };

            if (isDevelopment && !string.IsNullOrEmpty(detailedError))
            {
                return new
                {
                    message,
                    statusCode,
                    error = detailedError
                };
            }

            return response;
        }
    }
}


