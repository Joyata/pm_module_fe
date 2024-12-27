<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-form">
        <h1>Register</h1>
        <p class="text-medium-emphasis">Create your account</p>
        <CForm @submit="handleSubmit">
          <CInputGroup class="mb-3">
            <CInputGroupText>
              <CIcon icon="cil-user"></CIcon>
            </CInputGroupText>
            <CFormInput
              type="text"
              id="username"
              v-model="form.username"
              placeholder="Username"
              required
            />
          </CInputGroup>
          <!-- <CInputGroup class="mb-3">
            <CInputGroupText>
              <CIcon icon="cil-envelope-open"></CIcon>
            </CInputGroupText>
            <CFormInput
              type="email"
              id="email"
              v-model="form.email"
              placeholder="Email"
              required
            />
          </CInputGroup> -->
          <CInputGroup class="mb-3">
            <CInputGroupText>
              <CIcon icon="cil-lock-locked"></CIcon>
            </CInputGroupText>
            <CFormInput
              :type="passwordFieldType"
              id="password"
              v-model="form.password"
              placeholder="Password"
              required
            />
            <CInputGroupText
              @click="togglePasswordVisibility"
              style="cursor: pointer"
            >
              <font-awesome-icon :icon="passwordVisibilityIcon" />
            </CInputGroupText>
          </CInputGroup>
          <CInputGroup class="mb-4">
            <CInputGroupText>
              <CIcon icon="cil-lock-locked"></CIcon>
            </CInputGroupText>
            <CFormInput
              :type="passwordConfirmFieldType"
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              placeholder="Confirm Password"
              required
            />
            <CInputGroupText
              @click="togglePasswordConfirmVisibility"
              style="cursor: pointer"
            >
              <font-awesome-icon :icon="passwordConfirmVisibilityIcon" />
            </CInputGroupText>
          </CInputGroup>
          <button
            type="submit"
            class="btn btn-primary register-button"
            :disabled="loading"
          >
            <span v-if="loading">
              <CSpinner size="sm">Loading...</CSpinner>
            </span>
            <span v-else> Create Account</span>
          </button>
        </CForm>
        <div class="register-link">
          <p>Already have an account? <a @click="goToLogin">Login</a></p>
        </div>
      </div>
      <div class="register-brand">
        <div>
          <img
            src="@/assets/brand/Toyota_logo_01.png"
            alt="Toyota Logo"
            class="toyota-logo mb-3 fluid"
          />
          <h5>Maintenance Information System</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import api from "../../apis/CommonAPI";
import { mapActions } from "vuex";

export default {
  name: "Register",
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      form: {
        username: "",
        // email: "",
        password: "",
        passwordConfirm: "",
        role: "team_member",
        assignments: {
          plant: null,
          shop: null,
          line: null,
          station: null,
        },
        is_active: true,
      },
      showPassword: false,
      showPasswordConfirm: false,
      loading: false,
    };
  },
  computed: {
    passwordFieldType() {
      return this.showPassword ? "text" : "password";
    },
    passwordConfirmFieldType() {
      return this.showPasswordConfirm ? "text" : "password";
    },
    passwordVisibilityIcon() {
      return this.showPassword ? faEye : faEyeSlash;
    },
    passwordConfirmVisibilityIcon() {
      return this.showPasswordConfirm ? faEye : faEyeSlash;
    },
  },
  methods: {
    validatePassword(password) {
      const minLength = 8;
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password
      );

      const errors = [];
      if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
      }
      if (!hasUppercase) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!hasLowercase) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!hasNumber) {
        errors.push("Password must contain at least one number");
      }
      if (!hasSpecialChar) {
        errors.push("Password must contain at least one special character");
      }

      return {
        isValid: errors.length === 0,
        errors: errors.join("<br>"),
      };
    },

    async handleSubmit(event) {
      event.preventDefault();
      this.loading = true;

      try {
        console.log("Form data:", this.form);

        // Validate password match
        if (this.form.password !== this.form.passwordConfirm) {
          throw new Error("Passwords do not match");
        }

        // Validate password requirements
        const passwordValidation = this.validatePassword(this.form.password);
        if (!passwordValidation.isValid) {
          await Swal.fire({
            icon: "error",
            title: "Registration Failed",
            html: passwordValidation.errors,
            confirmButtonText: "OK",
          });
          return;
        }

        // Create request payload
        const userData = {
          username: this.form.username,
          password: this.form.password,
          role: this.form.role,
          assignments: {
            plant: null,
            shop: null,
            line: null,
            station: null,
          },
          is_active: this.form.is_active,
        };

        console.log("Sending registration request with data:", userData);

        // Create new user
        const response = await api.register(`/user/new-user`, userData);
        console.log("Registration response:", response);

        if (response.data?.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "Registration Successful",
            text: "Your account has been created. Please login to continue.",
            confirmButtonText: "OK",
          });
          this.$router.push("/login");
        } else {
          console.log("Registration response details:", response.data);
          throw new Error(response.data?.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error details:", error);
        console.error("Error response:", error.response?.data);

        await Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text:
            error.response?.data?.message ||
            error.message ||
            "Failed to create account",
          confirmButtonText: "OK",
        });
      } finally {
        this.loading = false;
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    togglePasswordConfirmVisibility() {
      this.showPasswordConfirm = !this.showPasswordConfirm;
    },
    goToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="scss" scoped>
/* Extra Small devices (max 575px) */
@media (max-width: 575.98px) {
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 100vh;
    padding: 15px;
    background: {
      image: url("@/assets/images/bg-blurred_06.jpg");
      size: cover;
      position: center center;
      attachment: fixed;
    }

    .register-card {
      display: flex;
      overflow: hidden;
      backdrop-filter: blur(15px);
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      border-radius: 10px;
      box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.7),
        rgba(255, 255, 255, 0.2)
      );
      flex-direction: column-reverse;
      padding: 15px;

      .register-brand {
        text-align: center;
        margin-bottom: 12px;
        padding: 12px;
        width: 100%;
        margin: 0 auto;
      }

      .register-form {
        padding: 12px;
        width: 100%;
        margin: 0 auto;

        h1 {
          margin-bottom: 8px;
          color: #333;
          font-size: 20px;
          text-align: center;
        }

        p {
          margin-bottom: 12px;
          color: #666;
          font-size: 14px;
          text-align: center;
          line-height: 1.3;
        }

        .input-group {
          position: relative;
          margin-bottom: 12px;

          input {
            width: 100%;
            padding: 8px 8px 8px 32px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            background-color: rgba(255, 255, 255, 0.85);
          }

          label {
            position: absolute;
            left: 8px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
          }
        }

        .toggle-password {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .register-button {
          width: 100%;
          padding: 8px;
          background-color: #c41e3a;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #8b0000;
          }
        }

        .register-link {
          text-align: center;
          margin-top: 12px;

          a {
            color: #e50000;
            text-decoration: none;
            cursor: pointer;
            font-size: 13px;
          }
        }
      }

      .toyota-logo {
        width: 140px;
        margin-bottom: 12px;
      }

      h3 {
        color: #eb0a1e;
        margin-bottom: 6px;
        font-size: 16px;
      }

      h5 {
        font-size: 14px;
        margin-bottom: 6px;
      }

      p {
        color: #666;
        font-size: 13px;
      }
    }
  }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 100vh;
    padding: 20px;
    background: {
      image: url("@/assets/images/bg-blurred_06.jpg");
      size: cover;
      position: center center;
      attachment: fixed;
    }

    .register-card {
      display: flex;
      overflow: hidden;
      backdrop-filter: blur(15px);
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      border-radius: 12px;
      box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.7),
        rgba(255, 255, 255, 0.2)
      );
      flex-direction: column-reverse;
      padding: 20px;

      .register-brand {
        text-align: center;
        margin-bottom: 15px;
        padding: 15px;
        width: 100%;
        margin: 0 auto;
        max-width: 440px;
      }

      .register-form {
        padding: 15px;
        width: 100%;
        margin: 0 auto;
        max-width: 440px;

        h1 {
          margin-bottom: 10px;
          color: #333;
          font-size: 22px;
          text-align: center;
        }

        p {
          margin-bottom: 15px;
          color: #666;
          font-size: 15px;
          text-align: center;
          line-height: 1.4;
        }

        .input-group {
          position: relative;
          margin-bottom: 15px;

          input {
            width: 100%;
            padding: 10px 10px 10px 35px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            background-color: rgba(255, 255, 255, 0.85);
          }

          label {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
          }
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .register-button {
          width: 100%;
          padding: 10px;
          background-color: #c41e3a;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #8b0000;
          }
        }

        .register-link {
          text-align: center;
          margin-top: 15px;

          a {
            color: #e50000;
            text-decoration: none;
            cursor: pointer;
            font-size: 14px;
          }
        }
      }

      .toyota-logo {
        width: 160px;
        margin-bottom: 15px;
      }

      h3 {
        color: #eb0a1e;
        margin-bottom: 8px;
        font-size: 18px;
      }

      h5 {
        font-size: 15px;
        margin-bottom: 8px;
      }

      p {
        color: #666;
        font-size: 14px;
      }
    }
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 991.98px) {
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 100vh;
    padding: 25px;
    background: {
      image: url("@/assets/images/bg-blurred_06.jpg");
      size: cover;
      position: center center;
      attachment: fixed;
    }

    .register-card {
      display: flex;
      overflow: hidden;
      backdrop-filter: blur(15px);
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
      border-radius: 12px;
      box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.7),
        rgba(255, 255, 255, 0.2)
      );
      flex-direction: column-reverse;
      padding: 25px;

      .register-brand {
        text-align: center;
        margin-bottom: 20px;
        padding: 20px;
        width: 100%;
        margin: 0 auto;
        max-width: 480px;
      }

      .register-form {
        padding: 20px;
        width: 100%;
        margin: 0 auto;
        max-width: 480px;

        h1 {
          margin-bottom: 10px;
          color: #333;
          font-size: 24px;
          text-align: center;
        }

        p {
          margin-bottom: 20px;
          color: #666;
          font-size: 16px;
          text-align: center;
          line-height: 1.5;
        }

        .input-group {
          position: relative;
          margin-bottom: 18px; // Slightly reduced margin for tablets

          input {
            width: 100%;
            padding: 10px 10px 10px 35px; // Slightly adjusted padding
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 15px; // Slightly smaller font for tablets
            background-color: rgba(255, 255, 255, 0.85);
          }

          label {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
          }
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .register-button {
          width: 100%;
          padding: 10px;
          background-color: #c41e3a;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 15px; // Slightly smaller font for tablets
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #8b0000;
          }
        }

        .register-link {
          text-align: center;
          margin-top: 18px; // Slightly reduced margin for tablets

          a {
            color: #e50000;
            text-decoration: none;
            cursor: pointer;
            font-size: 14px; // Slightly smaller font for tablets
          }
        }
      }
      .toyota-logo {
        width: 180px; // Slightly smaller logo for tablets
        margin-bottom: 18px;
      }

      h3 {
        color: #eb0a1e;
        margin-bottom: 8px;
        font-size: 20px; // Slightly smaller font for tablets
      }

      h5 {
        font-size: 16px; // Added specific size for h5
        margin-bottom: 10px;
      }

      p {
        color: #666;
        font-size: 14px;
      }
    }
  }
}

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 100vh;
    padding: 30px;
    background: {
      image: url("@/assets/images/bg-blurred_06.jpg");
      size: cover;
      position: center center;
      attachment: fixed;
    }

    .register-card {
      display: flex;
      overflow: hidden;
      backdrop-filter: blur(15px);
      width: 100%;
      max-width: 800px;
      border-radius: 10px;
      box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.7),
        rgba(255, 255, 255, 0.2)
      );

      .register-form,
      .register-brand {
        padding: 40px;
        width: 50%;
      }

      .register-form {
        h1 {
          margin-bottom: 10px;
          color: #333;
        }

        p {
          margin-bottom: 20px;
          color: #666;
        }

        .input-group {
          position: relative;
          margin-bottom: 20px;

          input {
            width: 100%;
            padding: 10px 10px 10px 40px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            background-color: rgba(255, 255, 255, 0.85);
          }

          label {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
          }
        }

        .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .register-button {
          width: 100%;
          padding: 10px;
          background-color: #c41e3a;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #8b0000;
          }
        }

        .register-link {
          text-align: center;
          margin-top: 20px;

          a {
            color: #e50000;
            text-decoration: none;
            cursor: pointer;
          }
        }
      }

      .register-brand {
        background-color: rgba(255, 255, 255, 0.35);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;

        .toyota-logo {
          width: 200px;
          margin-bottom: 20px;
        }

        h3 {
          color: #eb0a1e;
          margin-bottom: 10px;
        }

        p {
          color: #666;
        }
      }
    }
  }
}

/* X-Large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) and (max-width: 1399.98px) {
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url("@/assets/images/bg-blurred_06.jpg"); /* Replace with your actual background image */
    background-size: cover;
    background-position: center;
  }
  .register-card {
    display: flex;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.7),
      rgba(255, 255, 255, 0.2)
    );
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(15px);
    width: 800px;
  }
  .register-form,
  .register-brand {
    padding: 40px;
    width: 50%;
  }
  .register-form h1 {
    margin-bottom: 10px;
    color: #333;
  }

  .register-form p {
    margin-bottom: 20px;
    color: #666;
  }
  .input-group {
    position: relative;
    margin-bottom: 20px;
  }

  .input-group input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    background-color: rgba(255, 255, 255, 0.85);
  }

  .input-group label {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
  }

  .register-button {
    width: 100%;
    padding: 10px;
    background-color: #c41e3a;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .register-button:hover {
    background-color: #8b0000;
  }

  .register-link {
    text-align: center;
    margin-top: 20px;
  }

  .register-link a {
    color: #e50000;
    text-decoration: none;
    cursor: pointer;
  }

  .register-brand {
    background-color: rgba(255, 255, 255, 0.35);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .toyota-logo {
    width: 200px;
    margin-bottom: 20px;
  }

  .register-brand h3 {
    color: #eb0a1e;
    margin-bottom: 10px;
  }

  .register-brand p {
    color: #666;
  }
}

/* XX-Large devices (larger desktops, 1400px and up) */
@media (min-width: 1400px) {
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url("@/assets/images/bg-blurred_06.jpg"); /* Replace with your actual background image */
    background-size: cover;
    background-position: center;
  }
  .register-card {
    display: flex;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.7),
      rgba(255, 255, 255, 0.2)
    );
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(15px);
    width: 800px;
  }
  .register-form,
  .register-brand {
    padding: 40px;
    width: 50%;
  }
  .register-form h1 {
    margin-bottom: 10px;
    color: #333;
  }

  .register-form p {
    margin-bottom: 20px;
    color: #666;
  }
  .input-group {
    position: relative;
    margin-bottom: 20px;
  }

  .input-group input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    background-color: rgba(255, 255, 255, 0.85);
  }

  .input-group label {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
  .toggle-password {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
  }

  .register-button {
    width: 100%;
    padding: 10px;
    background-color: #c41e3a;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .register-button:hover {
    background-color: #8b0000;
  }

  .register-link {
    text-align: center;
    margin-top: 20px;
  }

  .register-link a {
    color: #e50000;
    text-decoration: none;
    cursor: pointer;
  }

  .register-brand {
    background-color: rgba(255, 255, 255, 0.35);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .toyota-logo {
    width: 200px;
    margin-bottom: 20px;
  }

  .register-brand h3 {
    color: #eb0a1e;
    margin-bottom: 10px;
  }

  .register-brand p {
    color: #666;
  }
}
</style>
