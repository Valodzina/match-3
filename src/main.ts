import './style.css';
import { Application } from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { MenuScene } from './scenes/MenuScene';

async function bootstrap() {
    const app = new Application();

    await app.init({
        background: '#1a1a2e',
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    const container = document.getElementById('app');
    if (container) container.appendChild(app.canvas);

    // Инициализируем менеджер сцен
    SceneManager.init(app);
    
    // Переходим на сцену меню
    SceneManager.changeScene(new MenuScene());
}

bootstrap().catch((err) => console.error(err));