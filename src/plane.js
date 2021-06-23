import * as THREE from 'three';

const planeModel = new THREE.Group();

const metalMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });

const geometry = new THREE.CylinderGeometry(1, 1, 8, 24);
const fuselage = new THREE.Mesh(geometry, metalMaterial);
fuselage.rotateX(Math.PI * 0.5);

planeModel.add(fuselage);

const nose = new THREE.Mesh(new THREE.ConeGeometry(1, 3, 32), metalMaterial);
nose.position.set(0, 0, 5.5);
nose.rotation.x = Math.PI * 0.5;
planeModel.add(nose);

const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(0, 0.2);
shape.lineTo(2, 0.2);
shape.lineTo(2, 0);
shape.lineTo(0, 0);

const extrudeSettings = {
  depth: 8,
  bevelThickness: 0.1,
  bevelSize: 0.05,
};

const wings = new THREE.Mesh(
  new THREE.ExtrudeGeometry(shape, extrudeSettings),
  metalMaterial
);
wings.position.set(-4, -0.25, 0);
wings.rotation.y = Math.PI * 0.5;

planeModel.add(wings);

export default planeModel;
