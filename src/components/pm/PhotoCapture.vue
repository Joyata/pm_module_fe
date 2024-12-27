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
    };
  },
  methods: {
    async startCamera() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
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
    },
    save() {
      const photoId = uuidv4(); // Generate a unique ID for the photo
      this.$emit("photo-saved", { id: photoId, data: this.capturedImage });
      this.capturedImage = null; // Reset the captured image
    },
    stopCamera() {
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }
    },
  },
  mounted() {
    this.startCamera();
  },
  beforeUnmount() {
    this.stopCamera();
  },
};
</script>
