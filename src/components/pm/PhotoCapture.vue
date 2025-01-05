<template>
  <div>
    <video ref="video" v-show="!capturedImage" width="100%" autoplay></video>
    <canvas ref="canvas" v-show="false"></canvas>
    <img
      v-if="capturedImage"
      :src="capturedImage"
      alt="Captured photo"
      width="100%"
    />
    <div class="mt-3 d-flex justify-content-center">
      <CButton
        v-if="!capturedImage"
        @click="switchCamera"
        color="secondary"
        class="me-2"
      >
        Switch Camera
      </CButton>
      <CButton v-if="!capturedImage" @click="capture" color="primary"
        >Capture Photo</CButton
      >
      <CButton v-else @click="retake" color="secondary" class="me-2"
        >Retake</CButton
      >
      <CButton v-if="capturedImage" @click="save" color="success"
        >Save Photo</CButton
      >
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from "uuid";
export default {
  name: "PhotoCapture",
  data() {
    return {
      capturedImage: null,
      stream: null,
      facingMode: "environment", // Default to rear camera
      hasMultipleCameras: false,
    };
  },
  methods: {
    async checkForMultipleCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        this.hasMultipleCameras = videoDevices.length > 1;
      } catch (error) {
        console.error("Error checking for multiple cameras:", error);
        this.hasMultipleCameras = false;
      }
    },

    async startCamera() {
      try {
        // Stop any existing stream
        if (this.stream) {
          this.stopCamera();
        }

        this.stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: this.facingMode,
          },
        });
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    },

    async switchCamera() {
      // Toggle between front and rear cameras
      this.facingMode =
        this.facingMode === "environment" ? "user" : "environment";
      await this.startCamera();
    },

    capture() {
      const canvas = this.$refs.canvas;
      const video = this.$refs.video;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL("image/jpeg");
    },

    retake() {
      this.capturedImage = null;
      this.startCamera(); // Restart the camera when retaking
    },

    save() {
      const photoId = uuidv4(); // Generate a unique ID for the photo
      this.$emit("photo-saved", {
        id: photoId,
        data: this.capturedImage,
        facingMode: this.facingMode,
      });
      this.capturedImage = null; // Reset the captured image
    },
    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }
    },
  },
  async mounted() {
    await this.checkForMultipleCameras();
    await this.startCamera();
  },
  beforeUnmount() {
    this.stopCamera();
  },
};
</script>
