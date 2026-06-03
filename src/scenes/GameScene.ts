import { Container, Graphics, Text } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../core/SceneManager';
import { MenuScene } from './MenuScene';
import { currentLocale, t } from '../core/i18n';

export class GameScene extends BaseScene {
    
    private levelId: number;
    private headerContainer = new Container();
    private boardContainer = new Container(); // Изолированный контейнер для механики Match-3
    
    private background = new Graphics();
    private boardBackground = new Graphics();
    
    private movesText!: Text;
    private scoreText!: Text;
    private backButton = new Container();

    constructor(levelId: number) {
        super();
        
        this.levelId = levelId;
        // 1. Слой фона
        this.addChild(this.background);
        
        // 2. Слой игрового поля
        this.addChild(this.boardContainer);
        this.boardContainer.addChild(this.boardBackground);
        
        // 3. Слой UI поверх всего
        this.addChild(this.headerContainer);

        this.initUI();
        this.loadLevelData();
    }

    private initUI(): void {
        const textStyle = { 
            fontFamily: currentLocale.styles.fontFamily, 
            fontSize: currentLocale.styles.uiFontSize, 
            fill: '#ffffff',
            fontWeight: 'bold' as const
        };

        this.movesText = new Text({ text: t('gameMoves') + ' 25', style: textStyle });
        this.scoreText = new Text({ text: t('gameScore') + ' 0', style: textStyle });

        this.createBackButton();

        this.headerContainer.addChild(this.movesText);
        this.headerContainer.addChild(this.scoreText);
    }

    private createBackButton(): void {
        const btnBg = new Graphics().roundRect(0, 0, 60, 40, 10).fill({ color: 0xe74c3c });
        const btnText = new Text({ text: '←', style: { fill: '#ffffff', fontSize: 24, fontWeight: 'bold' } });
        
        btnText.position.set((60 - btnText.width) / 2, (40 - btnText.height) / 2);
        
        this.backButton.addChild(btnBg, btnText);
        this.backButton.eventMode = 'static';
        this.backButton.cursor = 'pointer';
        
        // Возврат в меню
        this.backButton.on('pointerup', () => {
            SceneManager.changeScene(new MenuScene());
        });
        
        this.headerContainer.addChild(this.backButton);
    }

    private loadLevelData(): void {
        console.log(`Инициализация уровня ${this.levelId}... Загрузка JSON...`);
        // Здесь мы будем парсить JSON и строить сетку
    }

    public resize(width: number, height: number): void {
        const padding = 20;
        
        // Фон на весь экран
        this.background.clear().rect(0, 0, width, height).fill({ color: 0x1a1a2e });

        // --- 1. Позиционируем Хедер ---
        this.backButton.position.set(padding, padding);
        this.movesText.position.set(width / 2 - this.movesText.width / 2, padding);
        this.scoreText.position.set(width - this.scoreText.width - padding, padding);

        // Вычисляем, где заканчивается интерфейс
        const headerBottom = Math.max(
            this.backButton.y + this.backButton.height, 
            this.movesText.y + this.movesText.height
        ) + padding;

        // --- 2. Рассчитываем коробку для игрового поля ---
        // Сколько места осталось под полем (от хедера до низа экрана)
        const availableWidth = width - padding * 2;
        const availableHeight = height - headerBottom - padding * 2;
        
        // Для начала сделаем поле строго квадратным (по наименьшей доступной стороне)
        const boardSize = Math.min(availableWidth, availableHeight);

        // Рисуем подложку, чтобы визуально видеть границы нашего поля
        this.boardBackground.clear()
            .roundRect(0, 0, boardSize, boardSize, 20)
            .fill({ color: 0x2e2e4f, alpha: 0.8 });

        // Центрируем контейнер с полем в оставшемся пространстве
        this.boardContainer.x = (width - boardSize) / 2;
        this.boardContainer.y = headerBottom + (availableHeight - boardSize) / 2;
    }

   public destroy(): void {
        // 3. Вызываем destroy у родительского Container
        super.destroy({ children: true }); 
    }
}