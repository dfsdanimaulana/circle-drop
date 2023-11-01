// module aliases
const {
  Engine,
  Render,
  Runner,
  Bodies,
  Body,
  Common,
  Events,
  Composite,
  Mouse,
  MouseConstraint,
} = Matter;

const canvasWidth = window.innerWidth <= 768 ? window.innerWidth : 768;
const canvasHeight = window.innerHeight;

const canvas = document.getElementById("myCanvas"),
  CW = (canvas.width = canvasWidth),
  CH = (canvas.height = canvasHeight);

// create an engine
const engine = Engine.create();
const world = engine.world;

// create a renderer
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: CW,
    height: CH,
    wireframes: false,
    showCollisions: false,
    showDebug: false,
    showPositions: true,
  },
});

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

// define our categories (as bit fields, there are up to 32 available) to prevent moving the circle
const defaultCategory = 0x0001,
  redCategory = 0x0002,
  greenCategory = 0x0004;

// add mouse control
const mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  });

Composite.add(world, mouseConstraint);
// blue and blue category objects should not be draggable with the mouse
mouseConstraint.collisionFilter.mask = greenCategory;

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: CW, y: CH },
});

// walls
const thickness = 20;
const wallOptions = {
  isStatic: true,
};
const topWall = Bodies.rectangle(CW / 2, 0, CW, thickness, wallOptions);
const bottomWall = Bodies.rectangle(CW / 2, CH, CW, thickness * 4, wallOptions);
const leftWall = Bodies.rectangle(0, CH / 2, thickness, CH, wallOptions);
const rightWall = Bodies.rectangle(CW, CH / 2, thickness, CH, wallOptions);
Composite.add(world, [topWall, rightWall, leftWall, bottomWall]);

const categories = [];
const colors = [
  "#f5a7ff",
  "#346dd6",
  "#d63434",
  "#34d642",
  "#ebe145",
  "#ff00ff",
  "#f5a7ff",
  "#346dd6",
  "#d63434",
  "#34d642",
  "#ebe145",
  "#ff00ff",
  "#f5a7ff",
  "#346dd6",
  "#d63434",
  "#34d642",
  "#ebe145",
  "#ff00ff",
];

// scale between category
const scale = 1.5;

// initial radius of first circle
const initialValue = 10;

// radius ratio between category
const commonRatio = scale; // 7.5 / 5 = 1.5

// categories count
const numTerms = colors.length;

// create all possible radius sizes for the circle 
const sizes = generateGeometricSequence(initialValue, commonRatio, numTerms);
for (let i = 0; i < colors.length; i++) {
  categories.push({
    size: sizes[i],
    category: i,
    color: colors[i],
  });
}

function createCircle() {
  const category = getRandom([...categories.slice(0, 4)]);
  const options = {
    isStatic: true,
    restitution: 0.03, // bounce level
    category: category.category,
    collisionFilter: {
      mask: defaultCategory | redCategory,
    },
    render: {
      fillStyle: category.color,
    },
  };
  const circle = Bodies.circle(CW / 2, 50, category.size, options);
  Composite.add(world, circle);
}

// create first circle and add to world
createCircle();

// function to get all circle body in world
function getBodies() {
  return Composite.allBodies(world).filter(
    (body) => body.label === "Circle Body"
  );
}

// listen to mouse movement and update static circle position
Events.on(mouseConstraint, "mousemove", (event) => {
  // get all circle body
  const circles = getBodies();
  // update latest circle position here
  Body.setPosition(circles[circles.length - 1], {
    x: event.mouse.position.x,
    y: 50,
  });
});

// listen to mouse left click and set circle static to false
Events.on(mouseConstraint, "mouseup", (event) => {
  // get all circle body
  const circles = getBodies();
  // set latest circle isStatic to false here
  Body.setStatic(circles[circles.length - 1], false);
  // create next circle
  createCircle();
});

Events.on(engine, "collisionActive", (event) => {
  // lists of active collision between two circle => []
  const lists = event.source.pairs.list;

  // check collision between circles
  for (let i = 0; i < lists.length; i++) {
    // get collided circle
    const circleA = lists[i].bodyA;
    const circleB = lists[i].bodyB;

    // filter collided circle
    if (
      circleA.category === circleB.category &&
      circleA.circleRadius === circleB.circleRadius &&
      circleA.label === "Circle Body" &&
      circleB.label === "Circle Body" &&
      !circleA.isStatic &&
      !circleB.isStatic
    ) {
      // remove circleA in world
      Composite.remove(world, circleA);

      // update circleB
      // check previous circleB category
      const prevCategory = circleB.category;
      // update circleB category
      const newCategory = categories[prevCategory + 1];
      // update depends on previous circleB category
      Body.set(circleB, "category", newCategory.category);
      // Body.set(circleB, "circleRadius", newCategory.size);
      Body.set(circleB.render, "fillStyle", newCategory.color);
      // update circleB radius
      Body.scale(circleB, scale, scale);
    }
  }
});

let lastTime = Common.now();
// an example of using beforeUpdate event on an engine
Events.on(engine, "beforeUpdate", function (event) {
  // get all bodies in world
  const circles = getBodies();

  // game over condition
  for (let i = 0; i < circles.length; i++) {
    // chek circle highest y coordinate
    const y = circles[i].position.y;
    if (y <= 30) {
      console.log("Game Over");
      // stop world for re render
      Render.stop(render);
    }
  }

  // apply random forces every 5 secs
  if (Common.now() - lastTime >= 5000) {
    // update last time
    lastTime = Common.now();
  }
});

// get random value from areay
function getRandom(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function generateGeometricSequence(initialValue, commonRatio, numTerms) {
  const sequence = [];
  let currentValue = initialValue;

  for (let i = 0; i < numTerms; i++) {
    sequence.push(currentValue);
    currentValue *= commonRatio;
  }

  return sequence;
}
