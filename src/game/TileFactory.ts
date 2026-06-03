import { Container, Graphics, Text } from 'pixi.js';
import type { CellData } from './types';

// Жестко фиксируем базовый логический размер ячейки для движка
export const TILE_SIZE = 64;

export class TileFactory {
    public static createVisual(cell: CellData): Container | null {
        // -1 (тень от мульти-тайла) и -2 (пролет/дырка) — визуально пустые
        if (cell.code === -1 || cell.code === -2) {
            return null;
        }

        const container = new Container();

        // 1. Вычисляем размеры. Если это большой элемент (code 23), он займет больше места
        let widthTiles = 1;
        let heightTiles = 1;

        if (cell.dir && cell.val) {
            // Предполагаем, что якорь элемента — верхняя левая клетка
            if (cell.dir === 'right') widthTiles += cell.val;
            if (cell.dir === 'down') heightTiles += cell.val;
            // Для left и up потребуется смещение координат x/y, но пока заложим фундамент размеров
        }

        // -4 пикселя для красивого визуального зазора между тайлами
        const widthPx = widthTiles * TILE_SIZE - 4;
        const heightPx = heightTiles * TILE_SIZE - 4;

        // 2. Создаем визуальное представление на основе кода
        // В будущем тут будет switch(cell.code), который достает нужный спрайт
        let color = 0x4a4a6a; // серый по умолчанию
        if (cell.code === 10) color = 0x3498db; // синий
        if (cell.code === 12) color = 0x2ecc71; // зеленый
        if (cell.code === 13) color = 0xe74c3c; // красный
        if (cell.code === 14) color = 0xf1c40f; // желтый
        if (cell.code === 23) color = 0x9b59b6; // фиолетовый бустер (мульти-тайл)

        const view = new Graphics().roundRect(0, 0, widthPx, heightPx, 12).fill({ color });

        container.addChild(view);

        // Временно добавим текст с кодом поверх тайла для удобства дебага
        const debugText = new Text({
            text: `${cell.code}`,
            style: { fontSize: 16, fill: '#ffffff', fontWeight: 'bold' },
        });
        debugText.position.set((widthPx - debugText.width) / 2, (heightPx - debugText.height) / 2);
        container.addChild(debugText);

        return container;
    }
}
