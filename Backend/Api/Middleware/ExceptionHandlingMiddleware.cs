using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;

namespace Api.Middleware
{
    /// <summary>
    /// Global exception handling middleware
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = exception switch
            {
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            // In production, don't expose detailed error messages
            var isDevelopment = context.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment() ?? false;
            
            var response = new
            {
                message = isDevelopment ? exception.Message : "An error occurred while processing your request.",
                statusCode = context.Response.StatusCode,
                // Only include stack trace in development
                stackTrace = isDevelopment ? exception.StackTrace : null
            };

            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}


