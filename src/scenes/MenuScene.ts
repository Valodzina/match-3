import { Container, Graphics, Text, Rectangle, FederatedPointerEvent } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { LevelButton, type LevelState } from '../ui/LevelButton'; // <-- Правильный импорт
import { currentLocale, t } from '../core/i18n'; // <-- Импорт локализации
import gsap from 'gsap';

export class MenuScene extends BaseScene {
    private scrollContainer = new Container();
    private uiContainer = new Container();
    private scrollMask = new Graphics();
    private headerText!: Text;
    private starsText!: Text;

    // Статистика
    private totalLevels = 50;
    private currentStarsCount = 0;
    private levelButtons: LevelButton[] = [];

    private isDragging = false;
    private pointerStartY = 0;
    private containerStartY = 0;
    private velocityY = 0;
    private lastPointerY = 0;

    private minScrollY = 0;
    private maxScrollY = 0;
    private headerHeight = 100;

    constructor() {
        super();
        this.addChild(this.scrollContainer);
        this.addChild(this.scrollMask);
        this.scrollContainer.mask = this.scrollMask;
        this.addChild(this.uiContainer);

        this.initUI(); // <-- Вызываем только его
        this.initScrollEvents();
    }
    private initUI(): void {
        // Заголовок из локализации
        this.headerText = new Text({
            text: t('menuTitle'),
            style: {
                fontFamily: currentLocale.styles.fontFamily,
                fontSize: currentLocale.styles.titleFontSize,
                fill: '#ffffff',
                fontWeight: 'bold',
            },
        });
        this.uiContainer.addChild(this.headerText);

        // Чтобы инициализировать счетчик звезд, сначала нужно сгенерировать уровни,
        // поэтому мы вызываем createLevelGrid до создания текста звезд
        this.createLevelGrid();

        // Счетчик звезд
        const maxStars = this.totalLevels * 3;
        this.starsText = new Text({
            text: t('menuStars', { current: this.currentStarsCount, total: maxStars }),
            style: {
                fontFamily: currentLocale.styles.fontFamily,
                fontSize: currentLocale.styles.uiFontSize,
                fill: '#ffd700', // Золотой цвет
                fontWeight: 'bold',
            },
        });
        this.uiContainer.addChild(this.starsText);
    }

    private createLevelGrid(): void {
        this.currentStarsCount = 0; // Сбрасываем перед генерацией

        for (let i = 1; i <= this.totalLevels; i++) {
            let state: LevelState = 'locked';
            let stars = 0;

            if (i <= 5) {
                state = 'completed';
                stars = Math.floor(Math.random() * 3) + 1;
                this.currentStarsCount += stars; // Плюсуем собранные звезды
            } else if (i === 6) {
                state = 'unlocked';
            }

            const btn = new LevelButton({ levelNumber: i, state, stars });
            this.levelButtons.push(btn);
            this.scrollContainer.addChild(btn);
        }
    }

    private initScrollEvents(): void {
        this.scrollContainer.eventMode = 'static';
        this.scrollContainer.cursor = 'grab';

        this.scrollContainer.on('pointerdown', this.onPointerDown, this);
        this.on('pointermove', this.onPointerMove, this);
        this.on('pointerup', this.onPointerUp, this);
        this.on('pointerupoutside', this.onPointerUp, this);
        this.eventMode = 'static';
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        gsap.killTweensOf(this.scrollContainer);
        this.isDragging = true;
        this.scrollContainer.cursor = 'grabbing';
        this.pointerStartY = event.global.y;
        this.containerStartY = this.scrollContainer.y;
        this.lastPointerY = event.global.y;
        this.velocityY = 0;
    }

    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.isDragging) return;
        const currentY = event.global.y;
        const deltaY = currentY - this.pointerStartY;
        this.velocityY = currentY - this.lastPointerY;
        this.lastPointerY = currentY;

        let targetY = this.containerStartY + deltaY;
        if (targetY > this.maxScrollY)
            targetY = this.maxScrollY + (targetY - this.maxScrollY) * 0.3;
        else if (targetY < this.minScrollY)
            targetY = this.minScrollY + (targetY - this.minScrollY) * 0.3;

        this.scrollContainer.y = targetY;
    }

    private onPointerUp(): void {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.scrollContainer.cursor = 'grab';

        let targetY = this.scrollContainer.y + this.velocityY * 10;
        if (targetY > this.maxScrollY) targetY = this.maxScrollY;
        else if (targetY < this.minScrollY) targetY = this.minScrollY;

        gsap.to(this.scrollContainer, { y: targetY, duration: 0.5, ease: 'power2.out' });
    }
    public resize(width: number, height: number): void {
        const padding = 20;
        const gap = 20;

        // --- ИСПРАВЛЕНИЕ 1: Позиционирование всех элементов хедера ---
        this.headerText.x = (width - this.headerText.width) / 2;
        this.headerText.y = padding;

        // Этого блока не было: ставим счетчик звезд под заголовком
        this.starsText.x = (width - this.starsText.width) / 2;
        this.starsText.y = this.headerText.y + this.headerText.height + 10;

        // Динамически вычисляем высоту хедера, чтобы уровни начинались строго под ним
        this.headerHeight = this.starsText.y + this.starsText.height + padding;
        // -------------------------------------------------------------

        // Маска теперь корректно закрывает область под динамическим хедером
        this.scrollMask
            .clear()
            .rect(0, this.headerHeight, width, height - this.headerHeight)
            .fill({ color: 0xffffff });

        const isPortrait = height > width;
        const columns = isPortrait ? 3 : Math.max(5, Math.floor(width / 120));

        const availableWidth = width - padding * 2;
        const targetTileSize = (availableWidth - gap * (columns - 1)) / columns;
        const scaleFactor = targetTileSize / LevelButton.SIZE;

        const gridWidth = columns * targetTileSize + (columns - 1) * gap;
        const startX = (width - gridWidth) / 2;

        // Теперь startY вычисляется от правильного headerHeight
        const startY = this.headerHeight + padding;

        let maxButtonY = 0;

        this.levelButtons.forEach((btn, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;

            btn.scale.set(scaleFactor);
            btn.x = startX + col * (targetTileSize + gap);
            btn.y = startY + row * (targetTileSize + gap);

            if (btn.y + targetTileSize > maxButtonY) {
                maxButtonY = btn.y + targetTileSize;
            }
        });

        // --- ИСПРАВЛЕНИЕ 2: Корректировка зоны скролла ---
        const contentHeight = maxButtonY + padding;

        // Зона, реагирующая на тач, должна начинаться под хедером
        this.scrollContainer.hitArea = new Rectangle(0, this.headerHeight, width, contentHeight);

        this.maxScrollY = 0;
        const visibleHeight = height - this.headerHeight;

        if (contentHeight - this.headerHeight > visibleHeight) {
            this.minScrollY = -(contentHeight - this.headerHeight - visibleHeight);
        } else {
            this.minScrollY = 0;
        }

        if (this.scrollContainer.y < this.minScrollY) {
            this.scrollContainer.y = this.minScrollY;
        } else if (this.scrollContainer.y > this.maxScrollY) {
            this.scrollContainer.y = this.maxScrollY;
        }
    }

    public destroy(): void {
        gsap.killTweensOf(this.scrollContainer);
        super.destroy({ children: true });
        // this.scrollContainer.destroy({ children: true });
        // this.uiContainer.destroy({ children: true });
        // this.scrollMask.destroy();
    }
}
