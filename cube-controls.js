import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils.js';

export const KEYBINDS = Object.freeze({
    LEFT: 'A',
    RIGHT: 'D',
    LEFTARROW: 'ARROWLEFT',
    RIGHTARROW: 'ARROWRIGHT'
});

export class CubeControls {
    keysPressed = {
        'A': false,
        'D': false,
        'ARROWLEFT': false,
        'ARROWRIGHT': false,
    };
    gravity = 0.002;
    speed = 0.1;
    newVelocity = {x: 0, y: 0, z: 0};
    isEnemy = false;
    destroyed = false;   
    constructor (size, color, texture, ground, groundSize = {w: 10, h: 10, d: 10}, position = {x : 0, y : 0, z : 0}, velocity = {x : 0, y : 0, z : 0}, acceleration = {x: 0, y: 0, z: 0}) {
        this.size = size;
        console.log(texture)
        if (texture != null) this.mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshBasicMaterial({color: color, map: texture}))
        else this.mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshStandardMaterial({color: color}))
        this.ground = ground;
        this.groundSize = groundSize;
        this.velocity = velocity;
        this.mesh.position.set(position.x, position.y, position.z);
        this.top = this.mesh.position.y + (this.size / 2); 
        this.bottom = this.mesh.position.y - (this.size / 2);
        this.left = this.mesh.position.x - (this.size / 2);
        this.right = this.mesh.position.x + (this.size / 2);
        this.groundTop = ground.position.y + (groundSize.h / 2);
        this.groundLeft = ground.position.x - (groundSize.w / 2);
        this.groundRight = ground.position.x + (groundSize.w / 2);
        this.groundFront = ground.position.z - (groundSize.d / 2);
        this.groundBack = ground.position.z + (groundSize.d / 2);
        this.acceleration = acceleration;
    }

    update (frame) {
        this.top = this.mesh.position.y + (this.size / 2); 
        this.bottom = this.mesh.position.y - (this.size / 2);
        this.left = this.mesh.position.x - (this.size / 2);
        this.right = this.mesh.position.x + (this.size / 2);
        this.front = this.mesh.position.z - (this.size / 2);
        this.back = this.mesh.position.z + (this.size / 2);

        // Grawitacja i efekt odbicia sie
        this.velocity.y -= this.gravity;
        
        if (this.bottom + this.velocity.y <= this.groundTop) {
            //this.velocity.y = 0
            this.velocity.y *= 0.8;
            this.velocity.y = -this.velocity.y;
        } else {
            this.mesh.position.y += this.velocity.y;
        }
        
        this.movementWithKeys();
        if (this.velocity.x != 0 &&this.left + this.velocity.x > this.groundLeft && this.right + this.velocity.x < this.groundRight) {
            this.mesh.position.x += this.velocity.x //+ this.acceleration.x;
            //this.acceleration.x += (this.velocity.x >= 0) ? 0.01 : -0.01;
        } else {
            this.velocity.x = -this.velocity.x;
            //this.acceleration.x = 0;
        }

        if (this.velocity.z != 0 && this.front + this.velocity.z > this.groundFront && this.back + this.velocity.z < this.groundBack) {
            this.mesh.position.z += this.velocity.z //+ this.acceleration.z;
            //this.acceleration.z += (this.velocity.z >= 0) ? 0.01 : -0.01;
        } else if (this.isEnemy) {
            this.destroy()
           // this.acceleration.z = 0;
        } else {
            this.velocity.z = -this.velocity.z;
        }

       // this.velocity.x = lerp(this.velocity.x, this.newVelocity.x, 1 / (frame % 20));

    }
    movementWithKeys () {
        let directionX = (this.keysPressed[KEYBINDS.RIGHT] || this.keysPressed[KEYBINDS.RIGHTARROW]) - (this.keysPressed[KEYBINDS.LEFT] || this.keysPressed[KEYBINDS.LEFTARROW]); 
        if (directionX != NaN) this.velocity.x = directionX * this.speed;
    }

    destroy () {
        this.mesh.removeFromParent();
        this.destroyed = true;
    }

}