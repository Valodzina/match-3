import { Container, Graphics, Text } from 'pixi.js';
import { SceneManager } from '../core/SceneManager';
import { GameScene } from '../scenes/GameScene';

export type LevelState = 'locked' | 'unlocked' | 'completed';

export interface LevelConfig {
    levelNumber: number;
    state: LevelState;
    stars: number;
}

export class LevelButton extends Container {
    // Внутренний контейнер для независимых анимаций нажатия
    private view = new Container();

    private bg = new Graphics();
    private numberText!: Text;
    private stateContainer = new Container();

    public readonly config: LevelConfig;
    public static readonly SIZE = 100;

    // Координаты для отличия клика от скролла
    private pointerDownX = 0;
    private pointerDownY = 0;

    constructor(config: LevelConfig) {
        super();
        this.config = config;

        // Всю графику добавляем во view, а не в основной контейнер
        this.view.addChild(this.bg);
        this.view.addChild(this.stateContainer);
        this.addChild(this.view);

        // Центрируем внутренний контейнер, чтобы он корректно сжимался от центра
        this.view.pivot.set(LevelButton.SIZE / 2, LevelButton.SIZE / 2);
        this.view.position.set(LevelButton.SIZE / 2, LevelButton.SIZE / 2);

        this.drawBackground();
        this.drawNumber();
        this.drawStateIndicators();
        this.setupInteractivity();
    }

    private drawBackground(): void {
        const color = this.config.state === 'locked' ? 0x555555 : 0x4a90e2;
        this.bg.clear().roundRect(0, 0, LevelButton.SIZE, LevelButton.SIZE, 20).fill({ color });
    }

    private drawNumber(): void {
        this.numberText = new Text({
            text: this.config.levelNumber.toString(),
            style: {
                fontFamily: 'Arial',
                fontSize: 36,
                fill: '#ffffff',
                fontWeight: 'bold',
            },
        });

        this.numberText.x = (LevelButton.SIZE - this.numberText.width) / 2;
        this.numberText.y = (LevelButton.SIZE - this.numberText.height) / 2 - 10;

        this.view.addChild(this.numberText);
    }

    private drawStateIndicators(): void {
        const graphics = new Graphics();
        this.stateContainer.addChild(graphics);

        if (this.config.state === 'locked') {
            graphics
                .roundRect((LevelButton.SIZE - 30) / 2, (LevelButton.SIZE - 30) / 2, 30, 30, 5)
                .fill({ color: 0x333333 });
        } else if (this.config.state === 'completed') {
            const starRadius = 8;
            const gap = 15;
            const startX = LevelButton.SIZE / 2 - gap;
            const y = LevelButton.SIZE - 20;

            for (let i = 0; i < 3; i++) {
                const color = i < this.config.stars ? 0xffd700 : 0x000000;
                const alpha = i < this.config.stars ? 1 : 0.3;

                graphics.circle(startX + i * gap, y, starRadius).fill({ color, alpha });
            }
        }
    }

    private setupInteractivity(): void {
        if (this.config.state === 'locked') return;

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerdown', (e) => {
            // Запоминаем глобальные координаты начала касания
            this.pointerDownX = e.global.x;
            this.pointerDownY = e.global.y;

            // Анимируем только внутренний view.
            // Внешний scale, которым управляет MenuScene, остается нетронутым!
            this.view.alpha = 0.8;
            this.view.scale.set(0.9);
        });

        const release = () => {
            this.view.alpha = 1;
            this.view.scale.set(1);
        };

        this.on('pointerup', (e) => {
            release();

            // Высчитываем расстояние, на которое сместился указатель
            const dx = e.global.x - this.pointerDownX;
            const dy = e.global.y - this.pointerDownY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Если смещение меньше 10 пикселей, считаем это кликом (защита от дрожания пальца)
            if (distance < 10) {
                SceneManager.changeScene(new GameScene(this.config.levelNumber));
            }
        });

        this.on('pointerupoutside', release);
    }
}
