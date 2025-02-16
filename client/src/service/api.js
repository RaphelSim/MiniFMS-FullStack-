import axios from "axios";

// using localhost
const API_URL = "http://localhost:8000/api/files"; 

export default {
    // 📤 Upload File
    async uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        return axios.post(`${API_URL}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // 📂 Get All Files
    async getFiles() {
        return axios.get(`${API_URL}/all`);
    },

    // 📥 Download File
    async downloadFile(id, filename) {
        const response = await axios.get(`${API_URL}/download/${id}`, { responseType: "blob" });

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
    },

    // 🗑️ Delete File
    async deleteFile(id) {
        return axios.delete(`${API_URL}/delete/${id}`);
    },

    // ✏️ Rename a file
    async renameFile(id, newFilename) {
    return axios.put(`${API_URL}/update/${id}`, { filename: newFilename });
}
};