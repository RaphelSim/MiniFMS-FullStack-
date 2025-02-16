<template>
    <div class="container">
        <!-- 📤 File Upload -->
        <div class="upload-section">
            <h3 class="pixel-text input-text clickable" @click="triggerFileInput">+ ADD FILES</h3>
        </div>
        <input class="hidden-file-input" type="file" multiple ref="fileInput" @change="handleFileUpload"/>

        <!-- 📂 File List -->
        <table class = "table pixel-text">
        <thead>
            <tr>
                <th style="text-align: left; margin-left: 10px;">Filename</th>
                <th>Size</th>
                <th>Upload Date</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="files.length" v-for="file in files" :key="file._id">
                <!-- Filename column -->
                <td width="60%" style="text-align: left; margin-left: 10px;">
                    <span @dblclick="startEditing(file)" v-if="!editingFileId || editingFileId !== file._id">{{ file.filename }}</span>
                    <input class="pixel-text" v-if="editingFileId === file._id" v-model="newFilename" />
                </td>
                <td width="10%">
                    {{ formatSize(file.size) }}
                </td>
                <td width="20%">
                    {{ formatDate(file.uploadDate) }}
                </td>
                <!-- Actions column -->
                <td width="10%">
                    <!-- <button v-if="editingFileId !== file._id" @click="startEditing(file)">Rename</button> -->
                    <p class="button-text pixel-text" v-if="editingFileId === file._id" @click="renameFile(file._id)"><u>Save</u></p>
                    <p class="button-text pixel-text" v-if="editingFileId === file._id" @click="cancelRename"><u>Cancel</u></p>
                    <img src="@/assets/pixel-download.png" class="clickable" width="25px" height="25px" v-if="editingFileId !== file._id" @click="downloadFile(file._id, file.filename)" />
                    <img :src="getTrashIcon(file._id)" class="clickable" width="25px" height="25px" style="margin-left: 10px;" 
                        v-if="editingFileId != file._id"
                        @click="deleteFile(file._id)"
                        @mouseover="openTrash(file._id)"
                        @mouseleave="closeTrash()" />
                </td>
            </tr>
            <!-- Show message if no files exist -->
            <tr v-else>
                <td colspan="2">No files available.</td>
            </tr>
        </tbody>
    </table>
    </div>
</template>

<script>
import api from "@/service/api.js";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faDownload, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import trashIcon from "@/assets/pixel-trash.png";
import openTrashIcon from "@/assets/pixel-trash-open.png";

//  Add the icon to the library
library.add([faDownload, faTrash, faUpload]);
export default {
    components: {
        FontAwesomeIcon // register the component locally
    },
    data() { 
        return {
            selectedFile: null,
            files: [],
            editingFileId: null,
            newFilename: "",
            hoveredFileId: null,
        };
    },
    methods: {
        // trash can animated logic
        getTrashIcon(fileId) {
        return this.hoveredFileId === fileId ? openTrashIcon : trashIcon;
        },
        openTrash(fileId) {
            this.hoveredFileId = fileId; // Set the hovered file
        },
        closeTrash() {
            this.hoveredFileId = null; // Reset when the cursor leaves
        },

        // To tell parent to trigger the alert dialog
        triggerAlert(message) {
            this.$emit("show-alert", message);
        },
        triggerFileInput() {
            this.$refs.fileInput.click(); // Simulates clicking the hidden input
        },

        // Handle file selection
        handleFileUpload(event) {
            this.selectedFiles = Array.from(event.target.files); // Store all selected files
            this.uploadFiles(); // Call upload method
        },
        async uploadFiles() {
            if (!this.selectedFiles.length) return this.triggerAlert("No files selected!");
            for (const file of this.selectedFiles) {
                try {
                    await api.uploadFile(file);
                    console.log(`✅ ${file.name} uploaded successfully`);
                } catch (error) {
                    this.triggerAlert(`UPLOAD FAILED: ${file.name} - ${error.message}`);
                    console.error(`❌ Upload failed for ${file.name}:`, error);
                    this.selectedFiles = []; // Clear queue if one fails
                    this.$refs.fileInput.value = ""; // Reset file input
                    return; // Stop further uploads
                    }
                }

            this.triggerAlert("ALL FILES UPLOADED SUCCESSFULLY");
            this.selectedFiles = []; // Clear queue after success
            this.getFiles(); // Refresh file list
            this.$refs.fileInput.value = ""; // Reset file input
        },

        async getFiles() {
            try {
                const response = await api.getFiles();
                this.files = response.data;
            } catch (error) {
                console.error("❌ Error fetching files:", error);
            }
        },
        async downloadFile(id, filename) {
            try {
                await api.downloadFile(id, filename);
            } catch (error) {
                console.error("❌ Error downloading file:", error);
            }
        },
        async deleteFile(id) {
            if (confirm("Are you sure you want to delete this file?")) {
                try {
                    await api.deleteFile(id);
                    this.triggerAlert("FILE DELETED SUCCESSFULLY");
                    this.getFiles();
                } catch (error) {
                    this.triggerAlert("ERROR DELETING FILE: " + error.message);
                    console.error("❌ Error deleting file:", error);
                }
            }
        },
        startEditing(file) {
            this.editingFileId = file._id;
            this.newFilename = file.filename;
        },
        cancelRename() {
            this.editingFileId = null;
            this.newFilename = "";
        },
        async renameFile(id) {
            if (!this.newFilename.trim()) {
                this.triggerAlert("FILE NAME CANNOT BE EMPTY");
                return;
            }
            try {
                await api.renameFile(id, this.newFilename);
                this.triggerAlert("FILE RENAMED SUCCESSFULLY");
                this.getFiles();
                this.cancelRename();
            } catch (error) {
                this.triggerAlert("ERROR RENAMING FILE: " + error.message);
                console.error("❌ Error renaming file:", error);
            }
        },
        formatDate(dateString) {
        if (!dateString) return "N/A"; // Handle empty dates

        const date = new Date(dateString);
        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // Use 24-hour format
            });
        },
        formatSize(size){
            if(size < 1024) return size + " B";
            if(size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
            if(size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + " MB";
            return (size / 1024 / 1024 / 1024).toFixed(2) + " GB";
        }
    },
    mounted() {
        this.getFiles();
    }
};
</script>

<style>
.container {
    max-width: 100%;
    margin: 20px;
    text-align: center;
}

.upload-section {
    margin-bottom: 20px;
}

.pixel-text{
    font-family: 'Pixelify Sans', sans-serif;
    font-style: normal;
}

.input-text {
    text-align: left;
    font-size: 30px;
    font-style: normal;
    font-weight: normal;
}

.clickable {
    cursor: pointer;
}

.hidden-file-input {
    display: none;
}

.button-text {
    margin-left: 10px;
    cursor: pointer;
    border: none;
}

table {
    width: 100%;
    /* border: 1px solid #000; */
    border-collapse: collapse;
}

td{
    border-bottom: 2px solid #AAA;
    border-collapse: collapse;
    height: 40px;
}

th{
    border-bottom: 3px solid #000;
    border-collapse: collapse;
    color: black;
    font-size: large;
}
</style>