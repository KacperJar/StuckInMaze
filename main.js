import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CubeControls } from './cube-controls';
import { deltaTime, texture } from 'three/tsl';
import { Clock } from 'three/webgpu';

// Scena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 20;
camera.position.z = 10;
camera.position.x = 0;
camera.rotation.set(0, 25, 0)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true// Scena

// Kontrola kamery
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.mouseButtons = {
    MIDDLE: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN
}
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05

orbitControls.update();

// Światła
const dLight = new THREE.DirectionalLight('white', 0.8);
dLight.position.x = 20;
dLight.position.y = 30;
dLight.castShadow = true;
const d = 35;
dLight.shadow.camera.left = - d;
dLight.shadow.camera.right = d;
dLight.shadow.camera.top = d;
dLight.shadow.camera.bottom = - d;
scene.add(dLight);

const aLight = new THREE.AmbientLight('white', 0.5);
scene.add(aLight);

// Dodaj renderer do ciała strony
document.body.appendChild(renderer.domElement);

// Responsywność
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Kolizja
function boxCollision(box1, box2) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right;
    const yCollision = box1.top >= box2.bottom && box1.bottom <= box2.top;
    const zCollision = box1.back >= box2.front && box1.front <= box2.back;
    if (xCollision && yCollision && zCollision) console.log("COLLISION")
    return xCollision && yCollision && zCollision;
}

// Tworzenie ziemi
const groundSize = {w: 8, h:1, d: 60};
const ground = new THREE.Mesh(new THREE.BoxGeometry(groundSize.w, groundSize.h, groundSize.d), new THREE.MeshPhongMaterial({ color: 'grey'}));
scene.add(ground);

// Tworzenie gracza
const playerCube = new CubeControls(1, "green", null, ground, groundSize, {x: 0, y: 3, z: 0})
scene.add(playerCube.mesh);

var playerStats = {
    lives: 3,
    isInvincible: false,
    maxInvincibleAfterContactCooldown : 80, // w klatkach
    invincibleAfterContactCooldown  : 0,
    onInvincibleCooldown: false,
    baseColor: playerCube.mesh.material.color.clone(),
    contactColor: playerCube.mesh.material.color.clone(),
    invincibleColor: playerCube.mesh.material.color.clone()
}
playerStats.invincibleColor.set("white");
playerStats.contactColor.set("yellow");

// Wykrywanie wcisniecia przyciskow
window.addEventListener("keydown", (event) => {
    playerCube.keysPressed[event.key.toUpperCase()] = true;
})

window.addEventListener("keyup", (event) => {
    playerCube.keysPressed[event.key.toUpperCase()] = false;
})

// Przeciwnicy
var enemies = [];

var frames = 0;

// Poziomy trudności
const DIFFICULTIES = Object.freeze({
  EASY: {size: 1.25, color: "red", texture: null, velocity: {x: 0, y: 0, z: 0.01}, spawnrate: 200, lives: 5},
  MEDIUM: {size: 1.5, color: "red", texture: null, velocity: {x: 0, y: 0, z: 0.05}, spawnrate: 100, lives: 3},
  HARD: {size: 1.75, color: "red", texture: null, velocity: {x: 0, y: 0, z: 0.1}, spawnrate: 60, lives: 1}
})

var curDifficulty = DIFFICULTIES.EASY;
function selectDifficulty(difficulty) {
    curDifficulty = difficulty;
}

// Funckje przycisków
const mainMenu = document.getElementById("mainMenu");
const difficultySelection = document.getElementById("difficultySelection");
const deathScreen = document.getElementById("deathScreen");

const playBtn = document.getElementById("playBtn");
const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");
const returnMenuBtn = document.getElementById("returnMenuBtn");

const lives = document.getElementById("lives");

function lose() {
    deathScreen.style.display = "flex";
    deathScreen.style.top = "0";

    playerCube.mesh.position.x = 0;
    playerCube.mesh.position.y = 3;
    playerCube.mesh.position.z = 0;
    playerCube.mesh.material.color = playerStats.baseColor;
    playerStats.isInvincible = false;
    playerStats.invincibleAfterContactCooldown = 0;
    playerStats.onInvincibleCooldown = false;
    enemies.forEach(enemy => {
        if (!enemy.destroyed) enemy.destroy();
    })
    enemies = [];
}
function goBackMenu() {
    lives.textContent = "X żyć"
    deathScreen.style.top = "-100%";
    difficultySelection.style.top = "0";
    mainMenu.style.top = "0";
}

function handleButtons() {
    playBtn.addEventListener("click", (event) => {
        mainMenu.style.top = "-100%";
    })

    easyBtn.addEventListener("click", (event) => {
        difficultySelection.style.top = "-100%";
        selectDifficulty(DIFFICULTIES.EASY);
        init();
    })

    mediumBtn.addEventListener("click", (event) => {
        difficultySelection.style.top = "-100%";
        selectDifficulty(DIFFICULTIES.MEDIUM);
        init();
    })

    hardBtn.addEventListener("click", (event) => {
        difficultySelection.style.top = "-100%";
        selectDifficulty(DIFFICULTIES.HARD);
        init();
    })

    returnMenuBtn.addEventListener("click", (event) => {
        goBackMenu();
    })
}

handleButtons();

// Funckja tick (wykonuje sie co klatke)
function tick() {
    let animId = requestAnimationFrame(tick);

    playerCube.update(frames);
    enemies.forEach(enemy => {
        if (!enemy.destroyed) {
            enemy.update(ground);
            if (boxCollision(playerCube, enemy) && !playerStats.isInvincible) {
                playerCube.mesh.material.color = playerStats.contactColor;
                playerStats.isInvincible = true;
                playerStats.invincibleAfterContactCooldown = playerStats.maxInvincibleAfterContactCooldown;
                playerStats.onInvincibleCooldown = true;
                playerStats.lives --;
                lives.textContent = `${playerStats.lives}x Żyć`;
                enemy.destroy();
                if (playerStats.lives <= 0) {
                    cancelAnimationFrame(animId);
                    lose();
                }
            }
        }

    })
    renderer.render(scene, camera);
    if (frames % curDifficulty.spawnrate == 0) {
        const newEnemy = new CubeControls(curDifficulty.size, curDifficulty.color, curDifficulty.texture, ground, groundSize, {x: (Math.random() - 0.5) * 5, y: 3, z: -8}, curDifficulty.velocity)
        newEnemy.isEnemy = true;
        enemies.push(newEnemy);
        scene.add(newEnemy.mesh);
    }
    frames ++;
    if (playerStats.onInvincibleCooldown) {
        // Zmiana koloru gracza po 10 klatkach od uderzenia
        if (playerStats.maxInvincibleAfterContactCooldown - playerStats.invincibleAfterContactCooldown >= 15) {
            // Miganie koloru
            if (frames % 20 >= 10) playerCube.mesh.material.color = playerStats.invincibleColor;
            else playerCube.mesh.material.color = playerStats.baseColor;
        }

        if (playerStats.invincibleAfterContactCooldown > 0) playerStats.invincibleAfterContactCooldown --;
        else {
            playerStats.isInvincible = false;
            playerStats.onInvincibleCooldown = false;
            playerCube.mesh.material.color = playerStats.baseColor;
        }
    }
}

function init() {
    playerStats.lives = curDifficulty.lives;
    lives.textContent = `${playerStats.lives}x Żyć`
    tick();
}