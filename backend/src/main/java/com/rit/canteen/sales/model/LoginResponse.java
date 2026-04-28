package com.rit.canteen.sales.model;

public class LoginResponse {

    private boolean success;
    private String message;
    private boolean userExists;
    private UserDto user;
    private String token; // JWT for customer session

    public LoginResponse() {}

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, boolean userExists) {
        this.success = success;
        this.message = message;
        this.userExists = userExists;
    }

    public LoginResponse(boolean success, String message, UserDto user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isUserExists() { return userExists; }
    public void setUserExists(boolean userExists) { this.userExists = userExists; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public static class UserDto {
        private Long id;
        private String mobileNumber;
        private String name;
        private boolean isLoggedIn;
        private boolean isSuspended;
        private java.math.BigDecimal ritzTokenBalance;

        public UserDto() {}

        public UserDto(Long id, String mobileNumber, String name, boolean isLoggedIn, boolean isSuspended, java.math.BigDecimal ritzTokenBalance) {
            this.id = id;
            this.mobileNumber = mobileNumber;
            this.name = name;
            this.isLoggedIn = isLoggedIn;
            this.isSuspended = isSuspended;
            this.ritzTokenBalance = ritzTokenBalance;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public boolean isLoggedIn() { return isLoggedIn; }
        public void setLoggedIn(boolean loggedIn) { this.isLoggedIn = loggedIn; }

        public boolean isSuspended() { return isSuspended; }
        public void setSuspended(boolean suspended) { isSuspended = suspended; }

        public java.math.BigDecimal getRitzTokenBalance() { return ritzTokenBalance; }
        public void setRitzTokenBalance(java.math.BigDecimal ritzTokenBalance) { this.ritzTokenBalance = ritzTokenBalance; }
    }
}
