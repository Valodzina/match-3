export interface CellData {
    code: number;
    dir?: 'up' | 'down' | 'left' | 'right';
    val?: number;
}

export interface LevelData {
    width: number;
    height: number;
    moves: number;
    additionalTilesOnFall: {
        col: number;
        array: CellData[];
    }[];
    board: {
        froze: number[];
        data: CellData[];
    };
}
