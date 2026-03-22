import React, { useEffect, useState } from "react";

export default function RoomModal({ open, mode, initialRoom, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [capacity, setCapacity] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        if (!open) return;
        setName(initialRoom?.name ?? "");
        setCategory(initialRoom?.category ?? "");
        setDescription(initialRoom?.description ?? "");
        setPrice(initialRoom?.price != null ? String(initialRoom.price) : "");
        setCapacity(initialRoom?.capacity != null ? String(initialRoom.capacity) : "");
        setIsAvailable(initialRoom?.isAvailable ?? true);
    }, [open, initialRoom]);

    if (!open) return null;

    const title = mode === "edit" ? "Редактирование номера" : "Создание номера";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = name.trim();
        const parsedPrice = Number(price);
        const parsedCapacity = Number(capacity);

        if (!trimmed) {
            alert("Введите название номера");
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            alert("Введите корректную цену");
            return;
        }
        if (!Number.isFinite(parsedCapacity) || parsedCapacity < 1) {
            alert("Введите корректную вместимость");
            return;
        }

        onSubmit({
            id: initialRoom?.id,
            name: trimmed,
            category: category.trim(),
            description: description.trim(),
            price: parsedPrice,
            capacity: parsedCapacity,
            isAvailable: isAvailable
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modal__header">
                    <div className="modal__title">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">✕</button>
                </div>
                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Люкс" autoFocus />
                    </label>
                    <label className="label">
                        Категория
                        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Например, Premium" />
                    </label>
                    <label className="label">
                        Описание
                        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание номера" rows="3" />
                    </label>
                    <label className="label">
                        Цена (₽)
                        <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Например, 5000" inputMode="numeric" />
                    </label>
                    <label className="label">
                        Вместимость (чел)
                        <input className="input" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Например, 2" inputMode="numeric" />
                    </label>
                    <label className="label">
                        <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                        Доступен для бронирования
                    </label>
                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn btn--primary">{mode === "edit" ? "Сохранить" : "Создать"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}