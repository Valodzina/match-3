import { Container } from 'pixi.js';

export abstract class BaseScene extends Container {
    // Метод, который будет вызываться при изменении размеров экрана
    abstract resize(width: number, height: number): void;

    // Метод для очистки памяти при уничтожении сцены
}
