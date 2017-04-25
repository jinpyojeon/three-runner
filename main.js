var scene, camera, renderer;

init();


function init() {
    scene = new THREE.Scene();


    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    var light = new THREE.DirectionalLight(0xffffff, 1, 100);
    light.position.set(0, 1, 0); //default; light shining from top
    scene.add(light);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xEEEEEE);

    // var manager = new THREE.LoadingManager();
    // manager.onProgress = function(item, loaded, total) {
    //     console.log(item, loaded, total);
    // };

    var loader = new THREE.OBJLoader();

    loader.load('models/Stick_Figure_by_Swp.OBJ',
        function(object) {
            object.position.set(0, 0, 0);
            scene.add(object);
        }
    );

    window.onload = function() {
        document.body.appendChild(renderer.domElement);
    }

    render();
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}