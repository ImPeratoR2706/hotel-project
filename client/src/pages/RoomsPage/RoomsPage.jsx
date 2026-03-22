import React, { useEffect, useState } from "react";
import "./RoomsPage.scss";
import RoomsList from "../../components/RoomsList";
import RoomModal from "../../components/RoomModal";
import { api } from "../../api";

export default function RoomsPage() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingRoom, setEditingRoom] = useState(null);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const data = await api.getRooms();
            setRooms(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки номеров");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingRoom(null);
        setModalOpen(true);
    };

    const openEdit = (room) => {
        setModalMode("edit");
        setEditingRoom(room);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingRoom(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить номер?");
        if (!ok) return;

        try {
            await api.deleteRoom(id);
            setRooms((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления номера");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newRoom = await api.createRoom(payload);
                setRooms((prev) => [...prev, newRoom]);
            } else {
                const updatedRoom = await api.updateRoom(payload.id, payload);
                setRooms((prev) => prev.map((r) => (r.id === payload.id ? updatedRoom : r)));
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения номера");
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Hotel Management</div>
                    <div className="header__right">React + Express</div>
                </div>
            </header>
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Номера отеля</h1>
                        <button className="btn btn--primary" onClick={openCreate}>+ Создать</button>
                    </div>
                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <RoomsList rooms={rooms} onEdit={openEdit} onDelete={handleDelete} />
                    )}
                </div>
            </main>
            <footer className="footer">
                <div className="footer__inner">© {new Date().getFullYear()} Hotel Management</div>
            </footer>
            <RoomModal open={modalOpen} mode={modalMode} initialRoom={editingRoom} onClose={closeModal} onSubmit={handleSubmitModal} />
        </div>
    );
}