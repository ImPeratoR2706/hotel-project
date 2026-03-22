import React from "react";

export default function RoomItem({ room, onEdit, onDelete }) {
    return (
        <div className="roomRow">
            <div className="roomMain">
                <div className="roomId">#{room.id}</div>
                <div className="roomName">{room.name}</div>
                <div className="roomCategory">{room.category}</div>
                <div className="roomPrice">{room.price} ₽</div>
                <div className="roomCapacity">{room.capacity} мест</div>
                <div className="roomStatus">{room.isAvailable ? "Свободен" : "Занят"}</div>
            </div>
            <div className="roomActions">
                <button className="btn" onClick={() => onEdit(room)}>Редактировать</button>
                <button className="btn btn--danger" onClick={() => onDelete(room.id)}>Удалить</button>
            </div>
        </div>
    );
}