<template>
    <div class="container">
        <h1>📂 File Management System</h1>

        <!-- 📤 File Upload -->
        <div class="upload-section">
            <input type="file" @change="handleFileUpload" />
            <button @click="uploadFile" :disabled="!selectedFile">Upload</button>
        </div>

        <!-- 📂 File List -->
        <h2>Stored Files</h2>
        <ul v-if="files.length">
            <li v-for="file in files" :key="file._id">
                📄 <span v-if="!editingFileId || editingFileId !== file._id">{{ file.filename }}</span>
                <input v-if="editingFileId === file._id" v-model="newFilename" />

                <button v-if="editingFileId !== file._id" @click="startEditing(file)">Rename</button>
                <button v-if="editingFileId === file._id" @click="renameFile(file._id)">Save</button>
                <button v-if="editingFileId === file._id" @click="cancelRename">Cancel</button>

                <button @click="downloadFile(file._id, file.filename)">Download</button>
                <button @click="deleteFile(file._id)">Delete</button>
            </li>
        </ul>
        <p v-else>No files available.</p>
    </div>
</template>

<script>
import api from "@/service/api.js";

export default {
    data() {
        return {
            selectedFile: null,
            files: [],
            editingFileId: null,  // Track which file is being edited
            newFilename: ""  // Store new filename input
        };
    },
    methods: {
        // Handle file selection
        handleFileUpload(event) {
            this.selectedFile = event.target.files[0];
        },

        // Upload File
        async uploadFile() {
            if (!this.selectedFile) return;
            try {
                await api.uploadFile(this.selectedFile);
                alert("✅ File uploaded successfully!");
                this.selectedFile = null;
                this.getFiles(); // Refresh file list
            } catch (error) {
                console.error("❌ Upload failed:", error);
            }
        },

        // Fetch Files
        async getFiles() {
            try {
                const response = await api.getFiles();
                this.files = response.data;
            } catch (error) {
                console.error("❌ Error fetching files:", error);
            }
        },

        // Download File
        async downloadFile(id, filename) {
            try {
                await api.downloadFile(id, filename);
            } catch (error) {
                console.error("❌ Error downloading file:", error);
            }
        },

        // Delete File
        async deleteFile(id) {
            if (confirm("Are you sure you want to delete this file?")) {
                try {
                    await api.deleteFile(id);
                    alert("✅ File deleted!");
                    this.getFiles(); // Refresh file list
                } catch (error) {
                    console.error("❌ Error deleting file:", error);
                }
            }
        },

        // Start Renaming a File
        startEditing(file) {
            this.editingFileId = file._id;
            this.newFilename = file.filename;
        },

        // Cancel Renaming
        cancelRename() {
            this.editingFileId = null;
            this.newFilename = "";
        },

        // Rename File
        async renameFile(id) {
            if (!this.newFilename.trim()) {
                alert("❌ Filename cannot be empty!");
                return;
            }

            try {
                await api.renameFile(id, this.newFilename);
                alert("✅ File renamed successfully!");
                this.getFiles(); // Refresh file list
                this.cancelRename(); // Reset input field
            } catch (error) {
                console.error("❌ Error renaming file:", error);
            }
        }
    },
    mounted() {
        this.getFiles(); // Fetch files on load
    }
};
</script>

<style>
.container {
    max-width: 600px;
    margin: auto;
    text-align: center;
}

.upload-section {
    margin-bottom: 20px;
}

button {
    margin-left: 10px;
    cursor: pointer;
}
</style>