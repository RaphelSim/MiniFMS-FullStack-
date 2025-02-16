<template>
<div class="app-container">
  <AlertDialog v-if="showAlert" :message="alertMessage" @close="showAlert = false" />
  <div class="video-container" @mouseover="playVideo" @mouseleave="slowVideo">
        <video autoplay loop muted playsinline ref="video">
                <source src="@/assets/background.mp4" type="video/mp4">
        </video>
        <h1 class="title">Mini FMS</h1>
  </div>
  <FileManager @show-alert="showAlertDialog"/> <!-- Add the event listener to call showAlertDialog function when FileManager calls show-alert -->
</div>
</template>

<script>
import FileManager from "@/components/FileManager.vue";
import AlertDialog from "@/components/AlertDialog.vue";

export default {
  components: { FileManager, AlertDialog },
  data() {
        return {
            showAlert: false,
            alertMessage: ""
        };
    },
    methods: {
        showAlertDialog(message) {
            this.alertMessage = message;
            this.showAlert = true; // Show the alert
        },
        playVideo() {
            this.$refs.video.playbackRate = 1; // Play video when hovering
        },
        slowVideo() {
            this.$refs.video.playbackRate = 0.2; // Pause video when leaving
        }
    }
};
</script>

<style>
body {
    background-color: #f9f9f9;
}

.video-container {
    position: relative;
    width: 100%;
    height: 400px; /* Adjust height */
    display: flex;
    align-items: center;
    justify-content: left;
    overflow: hidden;
}

.video-container video {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the video fills the background */
    z-index: -1;
}

.title {
    font-family: "Pixelify Sans", serif;
    font-style: normal;
    font-weight: normal;
    font-size: 60px;
    margin-left: 20px;
    color: black;
    position: relative;
    z-index: 1;
}
</style>