namespace TransitOpsBackend.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string JoinedAt { get; set; } = string.Empty;
        public bool NotifEmail { get; set; } = true;
        public bool NotifPush { get; set; } = true;
        public bool NotifSms { get; set; } = false;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public bool NotifEmail { get; set; }
        public bool NotifPush { get; set; }
        public bool NotifSms { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
