const WORLD_SIZE = 10;
const PERCENT_OF_CHEESE = 0.1;
const INITIAL_START = 2;
const INITIAL_FPS = 100;

let slider;
let worldSize;
let input;
let avgStepsSpan;
let checkbox;

let seed = Date.now();
let strat = INITIAL_START;

let world;
let cheeseCount;
let steps;

let loops;
let avgSteps;

// 7 0 1
// 6   2
// 5 4 3
function getDirection(d) {
  switch (d) {
    case 0: {
      return [0, -1];
    }
    case 1: {
      return [1, -1];
    }
    case 2: {
      return [1, 0];
    }
    case 3: {
      return [1, 1];
    }
    case 4: {
      return [0, 1];
    }
    case 5: {
      return [-1, 1];
    }
    case 6: {
      return [-1, 0];
    }
    case 7: {
      return [-1, -1];
    }
  }
}

function generateDirection(mouseX, mouseY) {
  let newX;
  let newY;

  do {
    const step = getDirection(
      Math.floor(
        random() * 8
      )
    );
  
    newX = mouseX + step[0];
    newY = mouseY + step[1];
  
    if (
      newX < 0
      || newX > +worldSize.value() - 1
      || newY < 0
      || newY > +worldSize.value() - 1
    ) {
      continue;
    }

    return [
      newX,
      newY
    ]
  } while (true);
}

function findClosest(mouseX, mouseY) {
  const maxLevel = +worldSize.value();
  let level = 1;
  let i = 0;
  let direction = 0;
  let c = color(
    random() * 255,
    random() * 255,
    random() * 255,
    200
  )
  
  let x = mouseX - level;
  let y = mouseY - level;

  const rectSize = width / +worldSize.value();
  
  while (level < maxLevel) {
    fill(c);
    if (checkbox.checked()) {
      rect(
        rectSize * x,
        rectSize * y,
        rectSize,
        rectSize,
      );
    }

    if (
      world[x]
      && world[x][y]
      && world[x][y] === 1
    ) {
      return [x, y];
    }

    if (i % (level * 2) === 0) {
      direction += 2;
    }
    
    const d = getDirection(direction % 8);
    const stepX = d[0];
    const stepY = d[1];
    x += stepX;
    y += stepY;

    i++;

    if (i > 8 * level) {
      level++
      i = 0;
      direction = 0;
      c = color(
        random() * 255,
        random() * 255,
        random() * 255,
        200
      )
      
      x = mouseX - level;
      y = mouseY - level;
    }
  }
}

function strategy1(mouseX, mouseY) {
  const step = generateDirection(
    mouseX,
    mouseY
  );

  const newX = step[0];
  const newY = step[1];
  if (
    world[newX] !== undefined
    && world[newX][newY] !== undefined
  ) {
    world[mouseX][mouseY] = 0;
    
    if (world[newX][newY] === 1) {
      cheeseCount--;
    }
    
    world[newX][newY] = 2;
  }
}

function strategy2(mouseX, mouseY) {
  const step = findClosest(
    mouseX,
    mouseY
  );

  const newX = mouseX + Math.sign(step[0] - mouseX);
  const newY = mouseY + Math.sign(step[1] - mouseY);

  if (
    world[newX] !== undefined
    && world[newX][newY] !== undefined
  ) {
    world[mouseX][mouseY] = 0;
    
    if (world[newX][newY] === 1) {
      cheeseCount--;
    }
    
    world[newX][newY] = 2;
  }
}

function strategy3() {
  console.log(1);
}


function drawCheese(x, y) {
  fill(255, 204, 0);

  const squareSize = width / +worldSize.value();

  triangle(
    x + squareSize / 2,
    y + squareSize / 2 - squareSize / 4,

    x + squareSize / 2 - squareSize / 4,
    y + squareSize / 2 + squareSize / 4,

    x + squareSize / 2 + squareSize / 4,
    y + squareSize / 2 + squareSize / 4,
  );
}

function drawMouse(x, y) {
  fill(100, 100, 100);
  circle(
    x + width / +worldSize.value() / 2,
    y + width / +worldSize.value() / 2,
    width / +worldSize.value() / 2
  );
}

function restart() {
  avgStepsSpan.html('');

  if (steps > 0) {
    avgSteps += steps;
    avgStepsSpan.html(`Average steps: ${avgSteps / loops++}`);
  }

  steps = 2;

  world = new Array(+worldSize.value())
  .fill(null)
  .map(() =>
    new Array(+worldSize.value())
      .fill(null)
      .map(() => 0)
  );

  // randomSeed(seed);

  const percentOfCheese = +cheesePercentage.value() / 100;
  const worldSizeS = (+worldSize.value()) ** 2;
  cheeseCount = 
    Math.min(
      Math.floor(
        worldSizeS * percentOfCheese
      ),
      worldSizeS - 1
    )

  let count = cheeseCount;

  while (count) {
    const x = Math.floor(random() * +worldSize.value());
    const y = Math.floor(random() * +worldSize.value());
    if (world[x][y] !== 1) {
      world[x][y] = 1;
      count--;
    }
  }

  while (count === 0) {
    const x = Math.floor(random() * +worldSize.value());
    const y = Math.floor(random() * +worldSize.value());
    // const x = 4;
    // const y = 4;
    if (world[x][y] !== 1) {
      world[x][y] = 2;
      count--;
    }
  }
}

function setup() {
  createCanvas(600, 600);

  loops = 1;
  avgSteps = 0;
  steps = 0;

  avgStepsSpan = createSpan('');
  const desc = createDiv('FPS');
  const desc2 = createDiv('World size');
  const desc3 = createDiv('Percentage of cheese');
  input = createInput(String(INITIAL_FPS), 'number');
  slider = createSlider(1, 300, +input.value());
  worldSize = createInput(String(WORLD_SIZE), 'number');
  worldSize.attribute('min', '4')
  worldSize.attribute('max', '40')
  checkbox = createCheckbox('DEBUG', false);

  cheesePercentage = createInput(String(PERCENT_OF_CHEESE * 100), 'number');
  cheesePercentage.attribute('min', '1')
  cheesePercentage.attribute('max', '100')

  const div = createDiv();
  const div1 = createDiv();
  const div2 = createDiv();
  const div3 = createDiv();
  const div4 = createDiv();

  const buttonStart1 = createButton('Strategy #1 (random)');
  const buttonStart2 = createButton('Strategy #2');
  const buttonStart3 = createButton('Strategy #3 (knows exact position)');

  div1.child(input);
  div2.child(slider);
  div3.child(buttonStart1);
  div3.child(buttonStart2);
  div3.child(buttonStart3);
  div4.child(avgStepsSpan);
  div.child(desc);
  div.child(div1);
  div.child(div2);
  div.child(div3);
  div.child(div4);
  div.child(desc2);
  div.child(worldSize);
  div.child(desc3);
  div.child(cheesePercentage);
  div.child(createSpan('%'));
  div.child(checkbox);

  const clear = () => {
    avgSteps = 0;
    loops = 1;
    steps = 0;
    restart();
  }

  buttonStart1.mouseClicked(() => {
    strat = 1;
    clear();
  });

  buttonStart2.mouseClicked(() => {
    strat = 2;
    clear();
  });

  buttonStart3.mouseClicked(() => {
    strat = 3;
    clear();
  });

  worldSize.changed(() => {
    clear();
  });

  cheesePercentage.changed(() => {
    clear();
  });

  input.input(() => {
    slider.value(input.value())
  });
  
  slider.input(() => {
    input.value(slider.value())
  });

  restart();
}

function draw() {
  steps++;

  frameRate(+input.value());

  noStroke();
  let mouseX;
  let mouseY;

  for (let y = 0; y < +worldSize.value(); y++) {
    for (let x = 0; x < +worldSize.value(); x++) {
      const rectSize = width / +worldSize.value();
      if ((x + y) % 2 === 0) {
        fill(240, 240, 240);
      } else {
        fill(200, 200, 200);
      }

      rect(
        rectSize * x,
        rectSize * y,
        rectSize,
        rectSize,
      );

      if (world[x][y] === 1) {
        drawCheese(
          rectSize * x,
          rectSize * y
        )
      } else if (world[x][y] === 2) {
        mouseX = x;
        mouseY = y;

        drawMouse(
          rectSize * x,
          rectSize * y
        )
      }
    }
  }

  if (cheeseCount > 0) {
    switch (strat) {
      case 1: {
        strategy1(mouseX, mouseY);
        break;
      }
      case 2: {
        strategy2(mouseX, mouseY);
        break;
      }
      case 3: {
        strategy3(mouseX, mouseY);
        break;
      }
    }
  } else {
    restart();
  }
}

window.setup = setup;
window.draw = draw;
