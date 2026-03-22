import React from "react";
import RoomItem from "./RoomItem";

export default function RoomsList({ rooms, onEdit, onDelete }) {
    if (!rooms.length) {
        return <div className="empty">Номеров пока нет</div>;
    }

    return (
        <div className="list">
            {rooms.map((r) => (
                <RoomItem key={r.id} room={r} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
}