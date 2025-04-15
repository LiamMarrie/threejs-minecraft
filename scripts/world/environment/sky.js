// sky.js
import * as THREE from "three";

export class Sky extends THREE.Mesh {
  constructor() {
    // creates sphere geometry for sky box
    const geometry = new THREE.SphereGeometry(5000, 32, 15);
    // shader GLSL material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        sunPosition: { value: new THREE.Vector3() },
        // additional uniforms for color gradients, etc.
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 sunPosition;
        varying vec3 vWorldPosition;
        void main() {
          // Very simplified gradient: brighter near the sun
          float intensity = max(dot(normalize(vWorldPosition), normalize(sunPosition)), 0.0);
          vec3 skyColor = mix(vec3(0.0, 0.0, 0.2), vec3(0.5, 0.7, 1.0), intensity);
          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide,
    });

    super(geometry, material);
  }
}
