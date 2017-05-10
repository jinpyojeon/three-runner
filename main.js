var scene, camera, renderer;
var mousePos = { x: 0, y: 0 };

var player, floor, sun, sky;

var game = {
    finished: false,
    points: 0,
    speed: 1
};

var newTime = new Date().getTime();
var oldTime = new Date().getTime();

var obstacles = [];
var coins = [];

var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
    gold: 0xffdf00
};

init();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 10;
    camera.position.y = 2;

    var ambientLight = new THREE.AmbientLight(Colors.white); // soft white light
    scene.add(ambientLight);

    var geomSun = new THREE.TetrahedronGeometry(8, 2);
    var matSun = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shininess: 0,
        specular: 0xffffff,
        shading: THREE.FlatShading
    });
    sun = new THREE.Mesh(geomSun, matSun);
    sun.scale.set(0.25, 0.25, 0.25);
    sun.position.set(5, 20, -10);
    scene.add(sun);

    var light = new THREE.DirectionalLight(Colors.red, 1);
    light.position.set(0, 1, 0);
    scene.add(light);

    var listener = new THREE.AudioListener();
    camera.add(listener);

    // // create a global audio source
    // var sound = new THREE.Audio(listener);

    // var audioLoader = new THREE.AudioLoader();

    // //Load a sound and set it as the Audio object's buffer
    // audioLoader.load('sounds/ambient.ogg', function(buffer) {
    //     sound.setBuffer(buffer);
    //     sound.setLoop(true);
    //     sound.setVolume(0.5);
    //     sound.play();
    // });

    var loader = new THREE.TextureLoader();

    var grassTexture = loader.load('src/images/grasslight-small.jpg', function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(1, 512);
    });

    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100000, 8, 8),
        new THREE.MeshBasicMaterial({
            map: grassTexture
        }));
    floor.rotation.x -= Math.PI / 2;
    floor.position.y -= 1
    scene.add(floor);

    var skyTexture = loader.load('src/images/sky.jpg', function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(1, 1);
    });

    sky = new THREE.Mesh(
        new THREE.PlaneGeometry(10000, 1000, 8, 8),
        new THREE.MeshBasicMaterial({
            map: skyTexture
        }));
    sky.position.z = -60;
    scene.add(sky);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0xEEEEEE);

    var loader = new THREE.OBJLoader();

    // var ratamahatta = new THREEx.MD2CharacterRatmahatta();
    // scene.add(ratamahatta.character.object3d);

    loader.load('models/Stick_Figure_by_Swp.OBJ',
        function(object) {
            object.position.set(1, 0, 8);
            object.scale.set(0.5, 0.5, 0.5);
            // object.rotation.set(0, -Math.PI / 2, 1);
            player = object;
            scene.add(player);
        }
    );

    // var mtlLoader = new THREE.MTLLoader();
    // mtlLoader.setPath('models/');
    // mtlLoader.load('Oak_Dark_01.mtl', function(materials) {

    //     materials.preload();

    //     var objLoader = new THREE.OBJLoader();
    // loader.setMaterials(materials);
    // loader.setPath('models');
    // lader.load('Oak_Dark_01.obj', function(object) {

    //     object.position.y = -95;
    //     scene.add(object);

    // }, onProgress, onError);

    // });

    window.onload = function() {
        document.body.appendChild(renderer.domElement);
        render();
    }

    document.addEventListener("mousemove", handleMouseMove, false);

    document.body.addEventListener('keydown', function(event) {
        var inputs = player.input;
        if (event.keyCode === 37) inputs.left = true
        if (event.keyCode === 39) inputs.right = true
    });

    document.body.addEventListener('keyup', function(event) {
        var inputs = player.input;
        if (event.keyCode === 37) inputs.left = false
        if (event.keyCode === 39) inputs.right = false
    });
}

function render() {

    if (!game.finished) {
        if (player) player.position.set(mousePos.x * 10, 0, 8);
        floor.position.z += 0.3 * game.speed;
        sky.position.x += 0.1;
        updateSun();
        procGenerateRocks();
        // procGenerateCoins();
        moveObstacles();
        moveCoins();
        detectCollision();
        game.speed += 0.0001;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}

function updateSun() {
    if (sun) {
        sun.rotation.z += Math.sin(0.1);
        sun.rotation.y += Math.sin(0.1);
        sun.position.y *= Math.PI * Math.sin(sun.position.y);
    }
}

function handleMouseMove(event) {
    var tx = -1 + (event.clientX / window.innerWidth) * 2;
    var ty = 1 - (event.clientY / window.innerHeight) * 2;
    mousePos = { x: tx, y: ty };
}

function updatePlayer() {
    if (player.input) {
        if (player.input.left) player.position.x += 0.1;
        if (player.input.right) player.position.x -= 0.1;
    }
}

function procGenerateRocks() {
    newTime = new Date().getTime();

    if (newTime - oldTime > 2000) {
        oldTime = new Date().getTime();

        var spawnNum = Math.round(Math.random() * 3);
        var spawnedObs;
        for (var i = 0; i < spawnNum; i++) {
            spawnedObs = new Rock();
            spawnedObs.mesh.position.x = -10 + Math.random() * 20;
            spawnedObs.mesh.position.z = -20 - Math.random() * 10;
            spawnedObs.mesh.scale.set(0.1, 0.1, 0.1);
            obstacles.push(spawnedObs);
            scene.add(spawnedObs.mesh);
        }

        var spawnNum = Math.round(Math.random() * 3);
        var spawnedObs;
        for (var i = 0; i < spawnNum; i++) {
            spawnedObs = new Coin();
            spawnedObs.mesh.position.x = -10 + Math.random() * 20;
            spawnedObs.mesh.position.z = -20 - Math.random() * 10;
            spawnedObs.mesh.scale.set(0.1, 0.1, 0.1);
            coins.push(spawnedObs);
            scene.add(spawnedObs.mesh);
        }
    }
}


// function procGenerateCoins() {
//     newTime = new Date().getTime();

//     if (newTime - oldTime > 2000) {
//         oldTime = new Date().getTime();

//     }
// }

function moveObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].mesh.position.z += 0.3;
        if (obstacles[i].mesh.position.z > 6) {
            scene.remove(obstacles[i].mesh);
            obstacles.splice(i, 1);
        }
    }
}

function moveCoins() {

    for (var i = 0; i < coins.length; i++) {
        coins[i].mesh.position.z += 0.3 * game.speed;
        if (coins[i].mesh.position.z > 9) {
            scene.remove(coins[i].mesh);
            coins.splice(i, 1);
        }
    }
}

function detectCollision() {
    for (var i = 0; i < obstacles.length; i++) {
        console.log(player.position.distanceTo(obstacles[i].mesh.position));
        if (player.position.distanceTo(obstacles[i].mesh.position) < 3) {
            scene.remove(obstacles[i].mesh);
            obstacles.splice(i, 1);
            initiateCollision("obstacle");
            game.finished = true;
        }
    }

    for (var i = 0; i < coins.length; i++) {
        if (player.position.distanceTo(coins[i].mesh.position) < 3) {
            scene.remove(coins[i].mesh);
            coins.splice(i, 1);
            initiateCollision("coin");
        }
    }
}

function initiateCollision(obj) {
    if (obj == "obstacle") console.log("Encountered obs");
    else if (obj == "coin") {
        game.points += 1;
        console.log(game.points);
    }
}

function Coin() {
    var geom = new THREE.TetrahedronGeometry(8, 2);
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.gold,
        shininess: 0,
        specular: 0xffffff,
        shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.scale.set(0.5, 0.5, 0.5);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
}

function Rock() {
    var geom = new THREE.TetrahedronGeometry(8, 2);
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.brownDark,
        shininess: 0,
        specular: 0xffffff,
        shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.scale.set(0.8, 0.8, 0.8);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
    //*/
}