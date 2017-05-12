var scene, camera, renderer;

var floor, sun, sky, player; // global variables

// Variables related to games
var game = {
    finished: false,
    points: 0,
    speed: 1,
    spawnRate: 1,
    input: { left: false, right: false }
};

var newTime = new Date().getTime();
var oldTime = new Date().getTime();

// Arrays to hold model objects
var obstacleTypes = [];
var obstacles = [];
var coins = [];

var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
    gold: 0xffdf00,
    sunsetOrange: 0xfe5b35
};

init();

function init() {
    scene = new THREE.Scene();

    // Initialize camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.z = 14;
    camera.position.y = 4;

    var ambientLight = new THREE.AmbientLight(Colors.white);
    scene.add(ambientLight);

    // Add sun 
    var geomSun = new THREE.TetrahedronGeometry(8, 2);
    var matSun = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shininess: 0,
        specular: 0xffffff,
        shading: THREE.FlatShading
    });
    sun = new THREE.Mesh(geomSun, matSun);
    sun.position.set(9, 20, -10);
    sun.scale.set(0.25, 0.25, 0.25);
    scene.add(sun);

    // Set Sun as the source of directional light and intensity 
    // By Eucludian distance
    var light = new THREE.DirectionalLight(Colors.sunsetOrange,
        sun.position.distanceTo(new THREE.Vector3(0, 0, 0)));
    light.position.set(sun.position);
    scene.add(light);

    // Loader to load up the textruers
    var loader = new THREE.TextureLoader();

    var grassTexture = loader.load('src/images/grasslight-small.jpg', function(texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        texture.repeat.set(1, 512);
    });

    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100000, 8, 8),
        new THREE.MeshLambertMaterial({
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
    renderer.setSize(window.innerWidth,
        Math.round(window.innerHeight * 0.8));

    // Load up the figure for the game
    var objLoader = new THREE.OBJLoader();
    var mtlLoader = new THREE.MTLLoader();
    objLoader.setPath('models/');
    mtlLoader.setPath('models/');

    objLoader.load('Stick_Figure_by_Swp.OBJ',
        function(object) {
            object.position.set(1, 0, 8);
            object.scale.set(0.5, 0.5, 0.5);
            player = object;
            scene.add(player);
        }
    );

    loadObstacleTypes();

    window.onload = function() {
        document.body.appendChild(renderer.domElement);

        document.addEventListener('keydown', function(event) {
            if (event.keyCode === 37) game.input.left = true
            if (event.keyCode === 39) game.input.right = true
        });

        document.addEventListener('keyup', function(event) {
            if (event.keyCode === 37) game.input.left = false
            if (event.keyCode === 39) game.input.right = false
        });

        render();
    }
}

// The main rendering loop function
function render() {

    if (!game.finished) {
        floor.position.z += 0.3 * game.speed;
        sky.position.x += 0.1;
        procGenerateRocks();
        moveObstacles();
        moveCoins();
        detectCollision();
        updatePlayer();
        game.speed += 0.0001;
        game.spawnRate += 0.001;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

}

function updatePlayer() {
    if (game.input.left) {
        if (player.position.x > -10) player.position.x -= 0.1;
        player.rotation.y = 0.3;
    } else if (game.input.right) {
        if (player.position.x < 10) player.position.x += 0.1;
        player.rotation.y = -0.3;
    } else {
        player.rotation.y = 0;
    }
}

function procGenerateRocks() {
    newTime = new Date().getTime();

    if (newTime - oldTime > 2000) {
        oldTime = new Date().getTime();

        var spawnNum = Math.round(Math.random() * 10 * game.spawnRate);
        var spawnedObs;
        for (var i = 0; i < spawnNum; i++) {
            spawnedObs = obstacleTypes[Math.floor(obstacleTypes.length * Math.random())];
            spawnedObs.position.x = -20 + Math.random() * 30;
            spawnedObs.position.z = -20;
            spawnedObs.scale.set(1, 1, 1);
            scene.add(spawnedObs);
            obstacles.push(spawnedObs);
        }

        spawnNum = Math.round(Math.random() * 3 * game.spawnRate);
        for (var i = 0; i < spawnNum; i++) {
            spawnedObs = new Coin();
            spawnedObs.mesh.position.x = -10 + Math.random() * 20;
            spawnedObs.mesh.position.z = -20 - Math.random() * 10;
            spawnedObs.mesh.position.y = 0.3;
            spawnedObs.mesh.scale.set(0.05, 0.05, 0.05);
            coins.push(spawnedObs);
            scene.add(spawnedObs.mesh);
        }
    }
}

function moveObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].position.z += 0.1 * game.speed;
        if (obstacles[i].position.z > 9) {
            scene.remove(obstacles[i]);
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
        if (player.position.distanceTo(obstacles[i].position) < 1) {
            scene.remove(obstacles[i]);
            obstacles.splice(i, 1);
            initiateCollision("obstacle");
            game.finished = true;
            var score = document.getElementById("score");
            score.innerHTML = "You lost with " + game.points + " points: ";
        }
    }

    for (var i = 0; i < coins.length; i++) {
        if (player.position.distanceTo(coins[i].mesh.position) < 1) {
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
        var score = document.getElementById("score");
        score.innerHTML = game.points;
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

function loadObstacleTypes() {
    var objLoader = new THREE.OBJLoader();
    var mtlLoader = new THREE.MTLLoader();
    objLoader.setPath('models/');
    mtlLoader.setPath('models/');

    mtlLoader.load('Oak_Dark_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Oak_Dark_01.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Tall_Rock_1_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Tall_Rock_1_01.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Tall_Rock_2_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Tall_Rock_2_01.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Tall_Rock_3_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Tall_Rock_3_01.mtl.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Oak_Fall_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Oak_Fall_01.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Oak_Green_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Oak_Green_01.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Tree_01.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Tree_01.obj', function(object) {
            obstacleTypes.push(object);
        });
    });

    mtlLoader.load('Tree_02.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('Tree_02.obj', function(object) {
            obstacleTypes.push(object);
        });
    });
}