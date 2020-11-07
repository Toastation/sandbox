import * as THREE from './libraries/threejs/three.module.js';
import { OrbitControls } from './libraries/threejs/OrbitControls.js';
import { FBXLoader } from './libraries/threejs/FBXLoader.js';
import { BufferGeometryUtils } from './libraries/threejs/BufferGeometryUtils.js';

const WIDTH = 800;
const HEIGHT = 600;
const RADIAL_SEG = 8;

const canvas = document.querySelector("#harmo3d");
const renderer = new THREE.WebGLRenderer({canvas});
const cam = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.5, 1000);
const scene = new THREE.Scene();
const loader = new FBXLoader();
const clock = new THREE.Clock();

var dtAcc = 0;
var itCount = 0;

// material
var materialWireframe = new THREE.MeshBasicMaterial( {
    color: 0x0,
    wireframe: true,
    transparent: true
} );
var materialPhongWhite = new THREE.MeshPhongMaterial( {
    color: 0xffffff,
    flatShading: true,
    vertexColors: true,
    shininess: 0,
    polygonOffset: true,
    polygonOffsetUnits: 1,
    polygonOffsetFactor: 1
} );

// geom
var cylinderGeom = undefined;
var count = 0;

// mesh
var cylinderMeshWireframe = undefined;
var cylinderMesh = undefined;

// other
var controls = new OrbitControls(cam, renderer.domElement);
var light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);

// diffusion
var constrained = undefined;
var weights = undefined, weightsBuffer = undefined;
var adjList = undefined;
var vertexFaceLookup = undefined;
var vertexEdgeLookup = undefined;
var edges = undefined;
var cotanWeights = undefined;

function init() {
    cam.position.z = 5;
    renderer.setClearColor(new THREE.Color(255, 255, 255), 8);
    loader.load("./cylinder2.fbx", function(fbx) { 
        // geom
        var cylinderBufferGeom = fbx.children[0].geometry;
        cylinderGeom = new THREE.Geometry().fromBufferGeometry(cylinderBufferGeom);
        cylinderGeom.mergeVertices();
        initGeom();

        // mesh
        cylinderMeshWireframe = new THREE.Mesh(cylinderGeom, materialWireframe);
        cylinderMesh = new THREE.Mesh(cylinderGeom, materialPhongWhite);
        scene.add(cylinderMeshWireframe); 
        scene.add(cylinderMesh);

        console.log("vertices: ", cylinderGeom.vertices.length);
    }, undefined, function(error) { 
        console.error("error " + error); 
    } );
    requestAnimationFrame(animate);
}

function initGeom() {
    // get vertices count, create attributes
    count = cylinderGeom.vertices.length;
    weights = new Float32Array(count);
    weightsBuffer = new Float32Array(count);
    
    // set contrained vertices weights
    constrained = new Array(count);
    initWeights();
    
    // init lookup arrays
    adjList = new Array(count);
    vertexFaceLookup = new Array(count);
    vertexEdgeLookup = new Array(count);
    edges = {};
    cotanWeights = []; // new Array(cylinderGeom.faces.length + cylinderGeom.vertices.length - 2); 
    createLookup(cylinderGeom, adjList, vertexFaceLookup, vertexEdgeLookup, edges);
    computeCotanWeights(cylinderGeom, edges);

    // update color based on weight values
    updateColor(true);
    
    // align with y axis
    cylinderGeom.rotateX(-Math.PI/2);
}

function updateColor(first) {
    for (var i = 0; i < cylinderGeom.vertices.length; i++) {
        var color = new THREE.Color().setHSL(weights[i]/6, 1.0, 0.5);
        for (var j = 0; j < vertexFaceLookup[i].length; j++) {
            var face = cylinderGeom.faces[vertexFaceLookup[i][j]];
            if (first) {
                if (face.a == i) face.vertexColors[0] = color; 
                else if (face.b == i) face.vertexColors[1] = color;
                else if (face.c == i) face.vertexColors[2] = color;
            } else {
                if (face.a == i) face.vertexColors[0].copy(color); 
                else if (face.b == i) face.vertexColors[1].copy(color);
                else if (face.c == i) face.vertexColors[2].copy(color);
            }
        }
    }
    cylinderGeom.colorsNeedUpdate = true;
}

function initWeights() {
    var positions = cylinderGeom.vertices;
    for (var i = 0; i < count; i++) {
        constrained[i] = positions[i].z < -0.99 || positions[i].z > 0.99; // top and bottom vertices of the cylinder
        if (positions[i].z < -0.99) weights[i] = 1.0;
        else if (positions[i].z > 0.99) weights[i] = 0.0;
        else weights[i] = Math.random();
    }
}

function animate(time) {
    controls.update();
    renderer.render(scene, cam);

    dtAcc += clock.getDelta();
    if (dtAcc > 1) {
        diffuse(cylinderGeom, constrained, vertexEdgeLookup);
        updateColor(false);
        dtAcc = 0;
        itCount++;
    }

    if (itCount >= 10) {
        itCount = 0;
        dtAcc = 0;
        cylinderGeom.rotateX(Math.PI/2);
        initWeights();
        cylinderGeom.rotateX(-Math.PI/2);
    }

    requestAnimationFrame(animate);
}

init();

// UTILS

function createLookup(geometry, adjList, vertexFaceLookup, vertexEdgeLookup, edges) {
    var nbVertices = geometry.vertices.length;
    var nbFaces = geometry.faces.length;

    function addVertex(idx, list) {
        if (!list.includes(idx))
            list.push(idx);
    }

    function addEdge(a, b, face) {
        var aIdx = Math.min(a, b);
        var bIdx = Math.max(a, b);
        var edgeKey = aIdx + "-" + bIdx;
        var edge;
        if (edgeKey in edges)
            edge = edges[edgeKey];
        else {
            edge = {
                a: aIdx,
                b: bIdx,
                faces: []
            };
            vertexEdgeLookup[a].push(edge);
            vertexEdgeLookup[b].push(edge);
            edges[edgeKey] = edge;
        }
        edge.faces.push(face);
        face.edges.push(edge);
    }

    for (var i = 0; i < nbVertices; i++) {
        adjList[i] = [];
        vertexFaceLookup[i] = [];
        vertexEdgeLookup[i] = [];
    }

    for (var i = 0; i < nbFaces; i++) {
        var face = geometry.faces[i];
        face.edges = [];

        addVertex(face.b, adjList[face.a]);
        addVertex(face.c, adjList[face.a]);

        addVertex(face.a, adjList[face.b]);
        addVertex(face.c, adjList[face.b]);

        addVertex(face.a, adjList[face.c]);
        addVertex(face.b, adjList[face.c]);

        vertexFaceLookup[face.a].push(i);
        vertexFaceLookup[face.b].push(i);
        vertexFaceLookup[face.c].push(i);
        
        addEdge(face.a, face.b, face);
        addEdge(face.b, face.c, face);
        addEdge(face.a, face.c, face);
    }   
}

function diffuse(geometry, constrained, vertexEdgeLookup) {
    copyArray(weights, weightsBuffer);
    var t = 0.9;
    for (var i = 0; i < geometry.vertices.length; i++) {
        if (constrained[i]) continue;
        var totWeight = 0;
        var totCotan = 0;
        var jIdx;
        for (var j = 0; j < vertexEdgeLookup[i].length; j++) {
            jIdx = i == vertexEdgeLookup[i][j].a ? vertexEdgeLookup[i][j].b : vertexEdgeLookup[i][j].a;
            totCotan += vertexEdgeLookup[i][j].cotan;
            totWeight += weightsBuffer[jIdx] * vertexEdgeLookup[i][j].cotan;
        }
        weights[i] = weights[i] * (1 - t) + (totWeight / totCotan) * t; 
    }
}

function computeCotanWeights(geometry, edges) {
    var i = 0;
    for (let edgeKey in edges) {
        var edge = edges[edgeKey];
        // assert #faces == 2
        var face1 = edge.faces[0];
        var face2 = edge.faces[1];
        var a = geometry.vertices[edge.a];
        var b = geometry.vertices[edge.b];
        var c, d;
        for (var i = 0; i < face1.edges.length; i++) {
            if (edge != face1.edges[i]) {
                if (face1.edges[i].a != edge.a && face1.edges[i].a != edge.b)
                    c = geometry.vertices[face1.edges[i].a];
                else if (face1.edges[i].b != edge.a && face1.edges[i].b != edge.b)
                    c = geometry.vertices[face1.edges[i].b];
                else 
                    console.log("?? (c)");
                break;
            }
        }
        for (var i = 0; i < face2.edges.length; i++) {
            if (edge != face2.edges[i]) {
                if (face2.edges[i].a != edge.a && face2.edges[i].a != edge.b)
                    d = geometry.vertices[face2.edges[i].a];
                else if (face2.edges[i].b != edge.a && face2.edges[i].b != edge.b)
                    d = geometry.vertices[face2.edges[i].b];
                else 
                    console.log("?? (d)");
                    break;
            }
        }
        var v1 = new THREE.Vector3(a.x - c.x, a.y - c.y, a.z - c.z);
        var v2 = new THREE.Vector3(b.x - c.x, b.y - c.y, b.z - c.z);
        var v3 = new THREE.Vector3(a.x - d.x, a.y - d.y, a.z - d.z);
        var v4 = new THREE.Vector3(b.x - d.x, b.y - d.y, b.z - d.z);
        var cotan1 = v1.dot(v2) / (v1.cross(v2)).length();
        var cotan2 = v3.dot(v4) / (v3.cross(v4)).length();
        var cotan = cotan1 + cotan2;
        var cotanMax = Math.cos(1e-6) / Math.sin(1e-6);
        edge.cotan = clamp(cotan, -cotanMax, cotanMax);
    }
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function copyArray(src, dst) {
    // assert src and dst length
    for (var i = 0; i < dst.length; i++) {
        dst[i] = src[i];
    }
}