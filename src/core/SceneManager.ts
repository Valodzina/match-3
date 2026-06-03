import { Application } from 'pixi.js';
import { BaseScene } from '../scenes/BaseScene';

export class SceneManager {
    private static app: Application;
    private static currentScene: BaseScene | null = null;

    public static init(app: Application): void {
        this.app = app;
        
        // Подписываемся на ресайз от Pixi v8
        this.app.renderer.on('resize', () => {
            this.resize(this.app.screen.width, this.app.screen.height);
        });
    }

    public static changeScene(newScene: BaseScene): void {
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy();
        }

        this.currentScene = newScene;
        this.app.stage.addChild(newScene);
        
        // Сразу вызываем ресайз для новой сцены под текущий экран
        this.resize(this.app.screen.width, this.app.screen.height);
    }

    private static resize(width: number, height: number): void {
        if (this.currentScene) {
            this.currentScene.resize(width, height);
        }
    }
}