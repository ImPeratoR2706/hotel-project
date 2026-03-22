import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
    }
});

export const api = {
    createRoom: async (room) => {
        let response = await apiClient.post("/rooms", room);
        return response.data;
    },
    getRooms: async () => {
        let response = await apiClient.get("/rooms");
        return response.data;
    },
    getRoomById: async (id) => {
        let response = await apiClient.get(`/rooms/${id}`);
        return response.data;
    },
    updateRoom: async (id, room) => {
        let response = await apiClient.patch(`/rooms/${id}`, room);
        return response.data;
    },
    deleteRoom: async (id) => {
        let response = await apiClient.delete(`/rooms/${id}`);
        return response.data;
    }
};