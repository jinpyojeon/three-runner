var scene, camera, renderer;
var mousePos;

var figure;
var sun;

var game;
var deltaTime = 0;
var newTime = new Date().getTime();
var oldTime = new Date().getTime();

var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
};

init();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 10;
    camera.position.y = 2;

    var ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    var geomSun = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    var matSun = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading })
    sun = new THREE.Mesh(geomSun, matSun);
    sun.position.set(5, 5, -1);
    scene.add(sun);

    var light = new THREE.DirectionalLight(Colors.red, 1, 10);
    light.position.set(sun.position);
    light.position.set(0, 1, 0); //default; light shining from top
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

    // var groundMesh = new THREEx.GrassGround();
    // scene.add(groundMesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0xEEEEEE);

    var loader = new THREE.OBJLoader();


    loader.load('models/Stick_Figure_by_Swp.OBJ',
        function(object) {
            object.position.set(1, 1, 0);
            object.rotation.set(1, 1, 180);
            figure = object;
            scene.add(figure);
        }
    );

    window.onload = function() {
        document.body.appendChild(renderer.domElement);
        render();
    }

    document.addEventListener("mousemove", handleMouseMove, false);
}

function render() {
    // camera.rotation.z -= 0.1;
    // figure.position.z += 0.01;
    if (sun) figure.position.z -= 0.01;
    if (figure) figure.position.set(mousePos.x * 10, mousePos.y * 10, 1);
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function handleMouseMove(event) {
    var tx = -1 + (event.clientX / window.innerWidth) * 2;
    var ty = 1 - (event.clientY / window.innerHeight) * 2;
    mousePos = { x: tx, y: ty };
}

function procGenerateCubes() {

}