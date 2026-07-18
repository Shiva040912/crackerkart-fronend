import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [emailLoading, setEmailLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [phoneLoading, setPhoneLoading] =
    useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveLoginData = (data) => {
    localStorage.setItem(
      "token",
      data.access_token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    window.dispatchEvent(
      new Event("authUpdated")
    );
  };

  const completeLogin = (
    data,
    message
  ) => {
    saveLoginData(data);

    toast.success(message);

    setTimeout(() => {
      navigate("/");
    }, 600);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const cleanedEmail =
      form.email.trim().toLowerCase();

    if (!cleanedEmail) {
      return toast.error(
        "Email is required"
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanedEmail
      )
    ) {
      return toast.error(
        "Enter a valid email address"
      );
    }

    if (!form.password.trim()) {
      return toast.error(
        "Password is required"
      );
    }

    try {
      setEmailLoading(true);

      const response = await api.post(
        "/auth/login",
        {
          email: cleanedEmail,
          password: form.password,
        }
      );

      completeLogin(
        response.data,
        response.data?.message ||
          "Login successful"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to login"
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSuccess =
    async (credentialResponse) => {
      if (
        !credentialResponse.credential
      ) {
        return toast.error(
          "Google credential was not received"
        );
      }

      try {
        setGoogleLoading(true);

        const response = await api.post(
          "/auth/google",
          {
            credential:
              credentialResponse.credential,
          }
        );

        completeLogin(
          response.data,
          response.data?.message ||
            "Google login successful"
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Google login failed"
        );
      } finally {
        setGoogleLoading(false);
      }
    };

  const handleGoogleError = () => {
    toast.error(
      "Google login was cancelled or failed"
    );
  };

  const getCleanPhone = () => {
    return phone.replace(/\D/g, "");
  };

  const handleSendOtp = async () => {
    const cleanedPhone =
      getCleanPhone();

    if (
      !/^[6-9]\d{9}$/.test(
        cleanedPhone
      )
    ) {
      return toast.error(
        "Enter a valid 10 digit mobile number"
      );
    }

    try {
      setPhoneLoading(true);

      const response = await api.post(
        "/auth/phone/send-otp",
        {
          phone: cleanedPhone,
        }
      );

      setOtp("");
      setOtpSent(true);

      toast.success(
        response.data?.message ||
          "OTP sent successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to send OTP"
      );
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanedPhone =
      getCleanPhone();

    const cleanedOtp =
      otp.replace(/\D/g, "");

    if (
      !/^[6-9]\d{9}$/.test(
        cleanedPhone
      )
    ) {
      return toast.error(
        "Enter a valid mobile number"
      );
    }

    if (
      !/^\d{4,8}$/.test(cleanedOtp)
    ) {
      return toast.error(
        "Enter the OTP received by SMS"
      );
    }

    try {
      setPhoneLoading(true);

      const response = await api.post(
        "/auth/phone/verify-otp",
        {
          phone: cleanedPhone,
          otp: cleanedOtp,
        }
      );

      completeLogin(
        response.data,
        response.data?.message ||
          "Phone login successful"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleChangePhone = () => {
    setOtp("");
    setOtpSent(false);
  };

  return (
    <main className="auth-container">
      <section className="auth-shell">
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-mark">
              JP
            </div>

            <p className="auth-brand-label">
              JAPAN PATTASU
            </p>

            <h1>
              Secure access to your
              shopping account
            </h1>

            <p className="auth-brand-description">
              Login securely using your
              email, Google account, or
              mobile number.
            </p>

            <div className="auth-security-list">
              <div>
                <FiShield />
                <span>
                  Secure OTP verification
                </span>
              </div>

              <div>
                <FiLock />
                <span>
                  Protected account access
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <p className="auth-eyebrow">
                CUSTOMER LOGIN
              </p>

              <h2>Welcome back</h2>

              <p>
                Choose your preferred
                login method to continue.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <label
                className="auth-field-label"
                htmlFor="email"
              >
                Email address
              </label>

              <div className="auth-input-group">
                <FiMail />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <label
                className="auth-field-label"
                htmlFor="password"
              >
                Password
              </label>

              <div className="auth-input-group password-field">
                <FiLock />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="auth-primary-btn"
                disabled={emailLoading}
              >
                {emailLoading
                  ? "Signing in..."
                  : "Login"}
              </button>
            </form>

            <div className="auth-divider">
              <span>
                or continue with
              </span>
            </div>

            <div className="google-login-wrapper">
              {googleLoading ? (
                <button
                  type="button"
                  className="google-loading-btn"
                  disabled
                >
                  Connecting to Google...
                </button>
              ) : (
                <GoogleLogin
                  onSuccess={
                    handleGoogleSuccess
                  }
                  onError={
                    handleGoogleError
                  }
                  text="continue_with"
                  shape="rectangular"
                  size="large"
                  width="340"
                  theme="outline"
                />
              )}
            </div>

            <div className="auth-divider">
              <span>
                mobile number
              </span>
            </div>

            <div className="phone-login-box">
              {!otpSent ? (
                <>
                  <label
                    className="auth-field-label"
                    htmlFor="phone"
                  >
                    Mobile number
                  </label>

                  <div className="phone-input-row">
                    <div className="country-code">
                      +91
                    </div>

                    <div className="auth-input-group phone-field">
                      <FiPhone />

                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Enter mobile number"
                        maxLength="10"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) =>
                          setPhone(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="phone-login-btn"
                    disabled={phoneLoading}
                    onClick={handleSendOtp}
                  >
                    <FiPhone />

                    {phoneLoading
                      ? "Sending OTP..."
                      : "Send OTP"}
                  </button>
                </>
              ) : (
                <div className="otp-verification-box">
                  <div className="otp-status">
                    <div className="otp-status-icon">
                      <FiShield />
                    </div>

                    <div>
                      <strong>
                        OTP sent successfully
                      </strong>

                      <p>
                        Enter the code sent
                        to +91{" "}
                        {phone.replace(
                          /(\d{2})\d{6}(\d{2})/,
                          "$1******$2"
                        )}
                      </p>
                    </div>
                  </div>

                  <label
                    className="auth-field-label"
                    htmlFor="otp"
                  >
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    placeholder="Enter OTP"
                    maxLength="8"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />

                  <button
                    type="button"
                    className="phone-login-btn"
                    disabled={
                      phoneLoading ||
                      !otp.trim()
                    }
                    onClick={
                      handleVerifyOtp
                    }
                  >
                    <FiShield />

                    {phoneLoading
                      ? "Verifying OTP..."
                      : "Verify OTP and Login"}
                  </button>

                  <div className="phone-secondary-actions">
                    <button
                      type="button"
                      className="change-phone-btn"
                      disabled={phoneLoading}
                      onClick={
                        handleChangePhone
                      }
                    >
                      Change number
                    </button>

                    <button
                      type="button"
                      className="resend-otp-btn"
                      disabled={phoneLoading}
                      onClick={handleSendOtp}
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="auth-register-text">
              Don't have an account?
              <Link to="/register">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;