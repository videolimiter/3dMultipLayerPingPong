import * as THREE from "three"

export const PHYSICS = {
  GRAVITY: 0,
  TIME_STEP: 1 / 120,

  BALL: {
    INITIAL_SPEED: 20,
    MAX_SPEED: 30,
    RADIUS: 0.4,
    MASS: 1,
    RESTITUTION: 1.0,
    FRICTION: 0.0,
    LINEAR_DAMPING: 0,
    STEERING_FORCE: 0.8,
    BOOST_FORCE: 0.5,
    BRAKE_FORCE: 0.8,
    ROLLING_FRICTION: 0.03,
    ANGULAR_DAMPING: 0,
    ROTATION_SPEED: 0,
    SEGMENTS: 32,
    STOP_THRESHOLD: 0.05,
    PADDLE_INFLUENCE: 0.7,
    SPEED_INCREASE: 1.0,
    MAX_BOUNCE_ANGLE: Math.PI / 3,
    MAX_PADDLE_ANGLE: Math.PI / 6,
    CONTACT_EQUATION_STIFFNESS: 1e8,
  },

  PADDLE: {
    LEFT: {
      RESTITUTION: 1.0,
      FRICTION: 0.0,
      MOVE_SPEED: 2000,
      MAX_SPEED: 15,
      ACCELERATION: 10,
      DECELERATION: 10,
      IMPACT_FORCE: 1.0,
      ANGLE_INFLUENCE: 1.0,
    },
    RIGHT: {
      RESTITUTION: 1.0,
      FRICTION: 0.0,
      MOVE_SPEED: 2000,
      MAX_SPEED: 15,
      ACCELERATION: 10,
      DECELERATION: 10,
      IMPACT_FORCE: 1.0,
      ANGLE_INFLUENCE: 1.0,
    },
    RESTITUTION: 1.0,
    FRICTION: 0.0,
    ACCELERATION: 1,
    DECELERATION: 100,
    WIDTH: 0.1,
    HEIGHT: 1,
    DEPTH: 4,
    MASS: 0,
    INITIAL_POSITIONS: {
      left: 13,
      right: -13,
    },
  },

  WALL: {
    RESTITUTION: 1.0,
    FRICTION: 0.0,
    TOP: {
      RESTITUTION: 1.0,
      FRICTION: 0.0,
      BOUNCE_MODIFIER: 1.0,
    },
    BOTTOM: {
      RESTITUTION: 1.0,
      FRICTION: 0.0,
      BOUNCE_MODIFIER: 1.0,
    },
  },
}

export const GAME = {
  FIELD: {
    WIDTH: 30,
    HEIGHT: 20,
    DEPTH: 1,
    WALL_HEIGHT: 0.2,
    WALL_THICKNESS: 0.1,
  },
  MAX_PLAYERS: 2,
  POINTS_TO_WIN: 11,
  CAMERA: {
    left: {
      POSITION: {
        x: -20,
        y: 15,
        z: 0,
      },
      LOOK_AT: new THREE.Vector3(0, 0, 0),
      UP: new THREE.Vector3(0, 1, 0),
    },
    right: {
      POSITION: {
        x: 20,
        y: 15,
        z: 0,
      },
      LOOK_AT: new THREE.Vector3(0, 0, 0),
      UP: new THREE.Vector3(0, 1, 0),
    },
  },
  INPUT: {
    PADDLE_SPEED: 1,
  },
}
