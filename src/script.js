import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import Fragment from './shaders/fragment.glsl'
import Vertex from './shaders/vertex.glsl'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import t from "../static/textures/1-end.jpg"
import t1 from "../static/textures/1-first.jpg"

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Object
 */

const geometry = new THREE.PlaneBufferGeometry(480*1.905, 820*1.905, 480, 820)

const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: Vertex,
    fragmentShader: Fragment,
    uniforms: {
        time : {value: 0},
        progress : {value: 0},
        distortion : {value: 0},
        resolution : {value: new THREE.Vector4()},
        txt : {value: new THREE.TextureLoader().load(t)},
        txt1 : {value: new THREE.TextureLoader().load(t1)},
        uvRate1: {value : new THREE.Vector2(1, 1)}
    }
})

const points = new THREE.Points(geometry, material)

scene.add(points)

/**
 * GUI
 */
var distort = { 
    distortion: 0,
    bloomStrength: 0
}
gui.add(distort, 'distortion' , 0., 3., 0.01)
gui.add(distort, 'bloomStrength' , 0., 10., 0.01)

/**
 * Video Playback
 */
const video = document.getElementById('video1')
video.play()
video.addEventListener('ended', ()=>{
    gsap.to(video, {
        duration: 0.1,
        opacity: 0
    })
    
    gsap.to(material.uniforms.distortion, {
        duration: 2,
        value: 3
    })

    gsap.to(material.uniforms.progress, {
        duration: 1,
        delay: 1.5,
        value: 1
    })
    
    gsap.to(bloomPass, {
        duration: 2,
        strength: 1.5,
        ease: "power2.in"
    })
    
    gsap.to(material.uniforms.distortion, {
        duration: 2,
        value: 0,
        delay: 2
    })

    gsap.to(bloomPass, {
        duration: 2,
        strength: 0,
        delay: 2,
        ease: "power2.out",
        onComplete: () => {
            video.currentTime = 0
            video.play()
            gsap.to(video,{
                duration: 0,
                opacity: 1
            }) 
        }
    })
})


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //Composer
    composer.setSize( sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.001, 5000)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1500
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Post-Processing
 */
const renderScene = new RenderPass( scene, camera)

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = distort.bloomThreshold
bloomPass.strength = distort.bloomStrength
bloomPass.radius = distort.bloomRadius

const composer = new EffectComposer ( renderer)
composer.addPass ( renderScene )
composer.addPass(bloomPass)


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update vertex time
    material.uniforms.time.value = elapsedTime
    //material.uniforms.distortion.value = distort.distortion


    // Update controls
    controls.update()

    // Render
    //renderer.render(scene, camera)
    composer.render()

    //Update Post-Processing
    //bloomPass.strength = distort.bloomStrength

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()