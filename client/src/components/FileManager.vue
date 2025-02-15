<template>
    <div class="container">
        <h1>📂 File Management System</h1>

        <!-- 📤 File Upload -->
        <div class="upload-section">
            <input type="file" ref="fileInput" @change="handleFileUpload" />
        </div>

        <!-- 📂 File List -->
        <table class = "table">
        <thead>
            <tr>
                <th style="text-align: left; margin-left: 10px;">Filename</th>
                <th>Upload Date</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="files.length" v-for="file in files" :key="file._id">
                <!-- Filename column -->
                <td width="60%" style="text-align: left; margin-left: 10px;">
                    <span @dblclick="startEditing(file)" v-if="!editingFileId || editingFileId !== file._id">{{ file.filename }}</span>
                    <input v-if="editingFileId === file._id" v-model="newFilename" />
                </td>
                <td width="20%">
                    {{ formatDate(file.uploadDate) }}
                </td>
                <!-- Actions column -->
                <td width="20%">
                    <!-- <button v-if="editingFileId !== file._id" @click="startEditing(file)">Rename</button> -->
                    <button v-if="editingFileId === file._id" @click="renameFile(file._id)">Save</button>
                    <button v-if="editingFileId === file._id" @click="cancelRename">Cancel</button>
                    <font-awesome-icon :icon="['fas', 'download']" v-if="editingFileId !== file._id" @click="downloadFile(file._id, file.filename)" />
                    <font-awesome-icon :icon="['fas', 'trash']" style="color: red; margin-left: 10px;" v-if="editingFileId != file._id" 
                        @click="deleteFile(file._id)" @hover=""/>
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
            newFilename: ""
        };
    },
    methods: {
        // Handle file selection
        handleFileUpload(event) {
            this.selectedFile = event.target.files[0];
            this.uploadFile();
        },
        async uploadFile() {
            if (!this.selectedFile) return;
            try {
                await api.uploadFile(this.selectedFile);
                alert("✅ File uploaded successfully!");
                this.selectedFile = null;
                this.getFiles();
                this.$refs.fileInput.value = ""; 
            } catch (error) {
                console.error("❌ Upload failed:", error);
            }
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
                    alert("✅ File deleted!");
                    this.getFiles();
                } catch (error) {
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
                alert("❌ Filename cannot be empty!");
                return;
            }
            try {
                await api.renameFile(id, this.newFilename);
                alert("✅ File renamed successfully!");
                this.getFiles();
                this.cancelRename();
            } catch (error) {
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
    }
    },
    mounted() {
        this.getFiles();
    }
};
</script>

<style>
.container {
    max-width: 80%;
    margin: auto;
    text-align: center;
}

.upload-section {
    margin-bottom: 20px;
}

table {
    width: 100%;
    /* border: 1px solid #000; */
    border-collapse: collapse;
}

td{
    border-bottom: 1px solid #AAA;
    border-collapse: collapse;
    height: 40px;
}

th{
    border-bottom: 1px solid #000;
    border-collapse: collapse;
    color: black;
}

button {
    margin-left: 10px;
    cursor: pointer;
    border: none;
}
</style>