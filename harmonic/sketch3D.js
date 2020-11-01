import * as THREE from './libraries/threejs/three.module.js';
import { OrbitControls } from './libraries/threejs/OrbitControls.js';

const WIDTH = 800;
const HEIGHT = 600;
const RADIAL_SEG = 8;

const canvas = document.querySelector("#harmo3d");
const renderer = new THREE.WebGLRenderer({canvas});
const cam = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 1, 1000);
const scene = new THREE.Scene();
var controls = new OrbitControls(cam, renderer.domElement);

// materials
var materialWireframe = new THREE.MeshBasicMaterial({color: 0x0, wireframe: true, wireframeLinewidth: 4, transparent: true});
var materialPhongWhite = new THREE.MeshBasicMaterial({color: 0xFFFFFF, flatShading: true, vertexColors: false});
var materialPhongRed = new THREE.MeshBasicMaterial({color: 0xFF0000, flatShading: true, vertexColors: false});

// geoms
var cylinderGeom = new THREE.CylinderBufferGeometry(5, 5, 10, RADIAL_SEG, 20);
var sphereGeom = new THREE.SphereBufferGeometry(0.4);

// meshes
var cylinderWireframe = new THREE.Mesh(cylinderGeom, materialWireframe);
var cylinderPhong = new THREE.Mesh(cylinderGeom, materialPhongWhite);

var count = cylinderGeom.attributes.position.count;
cylinderGeom.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));

var constrained = new Array(count);
for (var i = 0; i < constrained.length; i++)
    constrained[i] = (i < RADIAL_SEG || i >= (count-RADIAL_SEG-1));

cam.position.z = 20;
scene.add(cylinderPhong);
scene.add(cylinderWireframe);

renderer.setClearColor(new THREE.Color(70, 70, 70), 255);
controls.update();
renderer.render(scene, cam);

function animate(time) {
    controls.update();
    renderer.render(scene, cam);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);