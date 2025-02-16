<template>
    <div v-if="isVisible" class="alert-dialog">
        <div class="dialog-content">
            <h3>{{ message }}</h3>
            <br />
            <br />
            <h3 class="clickable" @click="closeDialog"><u>OK</u></h3>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isVisible: true // Dialog starts visible
        };
    },
    methods: {
        closeDialog() {
            this.isVisible = false; // Hide the dialog
            this.$emit("close"); // Notify parent
        }
    }
};
</script>

<style>
.alert-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2); /* Dark overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; /* Ensure it stays on top */
}

.dialog-content {
    width: 30%;
    height: 30%;
    background: #f9f9f9;
    padding: 50px;
    border-radius: 0px;
    border: 2px solid #000;
    text-align: center;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    font-family: 'Pixelify Sans', sans-serif;
    font-style: normal;
    font-size: 30px;
}

.clickable {
    cursor: pointer;
}

button {
    margin-top: 15px;
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    border-radius: 5px;
}

button:hover {
    background-color: #0056b3;
}
</style>