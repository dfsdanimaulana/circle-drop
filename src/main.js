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
  },
});

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);

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

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: CW, y: CH },
});

// define our categories (as bit fields, there are up to 32 available)
const defaultCategory = 0x0001,
  redCategory = 0x0002,
  greenCategory = 0x0004,
  blueCategory = 0x0008;

// walls
const thickness = 20;
const wallOptions = {
  isStatic: true,
  render: {
    fillStyle: "#fc175e",
  },
};
const topWall = Bodies.rectangle(CW / 2, 0, CW, thickness, wallOptions);
const bottomWall = Bodies.rectangle(
  CW / 2,
  CH,
  CW,
  thickness * 4,
  wallOptions
);
const leftWall = Bodies.rectangle(0, CH / 2, thickness, CH, wallOptions);
const rightWall = Bodies.rectangle(
  CW,
  CH / 2,
  thickness,
  CH,
  wallOptions
);
Composite.add(world, [topWall, rightWall, leftWall, bottomWall]);
const colors = [
  "#f5a7ff",
  "#346dd6",
  "#d63434",
  "#34d642",
  "#ebe145",
  /* "#f56a26",
  "#8a6ae1",
  "#34d6b6",
  "#8a5340",
  "#777777",
  "#00ffff",
  "#ff00ff",*/
];

const categories = [];

let currentSize = 10;

for (let i = 1; i < colors.length + 1; i++) {
  categories.push({
    size: currentSize,
    category: `c${i}`,
    color: colors[i - 1],
  });

  currentSize += 5;
}

// circle container
const circles = [];

// create first circle and add to world and container
const firstCircleCategory = Common.choose(categories);
const firstCircle = Bodies.circle(CW / 2, 50, firstCircleCategory.size, {
  isStatic: true,
  category: firstCircleCategory.category,
  collisionFilter: {
    mask: defaultCategory | redCategory,
  },
  render: {
    fillStyle: firstCircleCategory.color,
  },
});
circles.push(firstCircle);
const stack = Composite.add(world, circles);

Events.on(mouseConstraint, "mousemove", (event) => {
  // update latest circle position here
  Body.setPosition(circles[circles.length - 1], {
    x: event.mouse.position.x,
    y: 50,
  });
});

Events.on(mouseConstraint, "mouseup", () => {
  // set latest circle isStatic to false here
  Body.setStatic(circles[circles.length - 1], false);

  // create new circle and add to world and container
  const newCategory = Common.choose(categories);
  const newCircle = Bodies.circle(CW / 2, 50, newCategory.size, {
    isStatic: true,
    category: newCategory.category,
    collisionFilter: {
      mask: defaultCategory | blueCategory,
    },
    render: {
      fillStyle: newCategory.color,
    },
  });
  circles.push(newCircle);
  Composite.add(world, newCircle);
});

Events.on(engine, "collisionActive", (event) => {
  // list of active collision between two body []
  const lists = event.source.pairs.list;

  // check collision between circles
  const length = lists.length;
  for (let i = 0; i < length; i++) {
    // Access and work with array[i]
    const bodyA = lists[i].bodyA;
    const bodyB = lists[i].bodyB;

    if (
      bodyA.category === bodyB.category &&
      bodyA.circleRadius === bodyB.circleRadius &&
      bodyA.label === "Circle Body" &&
      bodyB.label === "Circle Body" &&
      !bodyA.isStatic &&
      !bodyB.isStatic
    ) {
      // get the body index in circles array
      const indexA = circles.indexOf(bodyA);

      // remove bodyA in circles array
      circles.splice(indexA, 1);
      // remove bodyA in world bodies
      Composite.remove(stack, bodyA);

      // update bodyB
      // check previous bodyB category
      // update depends on previous bodyB category
      bodyB.render.fillStyle = "#ffffff";
      Body.scale(bodyB, 2, 2);
    }
  }
});

// blue and blue category objects should not be draggable with the mouse
mouseConstraint.collisionFilter.mask = greenCategory;
