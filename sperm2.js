function adjustPath(path) {
    console.log('Original path:', path);
    if (isGitHubPages()) {
        // Remove leading '../' or '../../'
        let cleanPath = path.replace(/^(?:\.\.\/)+/, '');
        
        // Prepend the repository name for GitHub Pages
        const adjustedPath = `/kimsimon/${cleanPath}`;
        
        // Append ?raw=true for image files
        if (adjustedPath.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
            const finalPath = adjustedPath + '?raw=true';
            console.log('Adjusted path for GitHub Pages:', finalPath);
            return finalPath;
        }
        console.log('Adjusted path for GitHub Pages:', adjustedPath);
        return adjustedPath;
    } else {
        // For local development, just remove any leading '../'
        const localPath = path.replace(/^(?:\.\.\/)+/, '');
        console.log('Adjusted path for local:', localPath);
        return localPath;
    }
}

function simulationSketch(p) {

  // Global variables for simulation
  let cols = 20, rows_ = 14;
  let mesh = [];
  let nodes = [];
  let keyToNode = {};
  let assets = [];
  let assetCount = 108; // Number of PNGs
  let spermCells = [];
  let lastShuffle = 0;
  let shuffleInterval = 111; // milliseconds

  // Global flag to indicate whether simulation has started
  let simStarted = false;

  p.preload = function() {
    for (let i = 1; i <= assetCount; i++) {
      let assetPath = adjustPath('algo_compressed/line_' + i + '.png');
      assets.push(p.loadImage(
        assetPath,
        () => {}, // success callback 
        () => { console.error('Failed to load:', assetPath); }
      ));
    }
  };

  p.setup = function() {
    const container = document.getElementById('sperm-simulation');
    const canvasWidth = container.clientWidth;
    const canvasHeight = container.clientHeight;
    let canvas = p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
    canvas.parent('sperm-simulation');

    let marginX = 80;
    let marginY = 80;

    // 1. Create mesh grid (invisible substrate)
    mesh = [];
    for (let y = 0; y < rows_; y++) {
      let meshRow = [];
      for (let x = 0; x < cols; x++) {
        let px = p.map(x, 0, cols - 1, -p.width / 2 + marginX, p.width / 2 - marginX);
        let py = p.map(y, 0, rows_ - 1, -p.height / 2 + marginY, p.height / 2 - marginY);
        meshRow.push({
          x: px,
          y: py,
          vx: 0,
          vy: 0,
          rest_x: px,
          rest_y: py
        });
      }
      mesh.push(meshRow);
    }

    // 2. Create muscle nodes according to QWERTY layout
    const keyboardRows = [
      "qwertyuiop",
      "asdfghjkl",
      "zxcvbnm"
    ];
    nodes = [];
    keyToNode = {};
    let totalRows = keyboardRows.length;
    for (let row = 0; row < totalRows; row++) {
      let keys = keyboardRows[row];
      let y = p.map(row, 0, totalRows - 1, -p.height / 2 + marginY, p.height / 2 - marginY);
      for (let col = 0; col < keys.length; col++) {
        let x = p.map(col, 0, keys.length - 1, -p.width / 2 + marginX, p.width / 2 - marginX);
        let key = keys[col];
        let node = { x, y, force: 0, pullRadius: 180, holding: false };
        nodes.push(node);
        keyToNode[key] = nodes.length - 1;
      }
    }

    // 3. Create sperm cells by generating 111 unique cells then duplicating each 6 times
    let uniqueCount = 111;
    let duplicatesPerUnique = 3; // Total will be 111 * 6 = 666
    let minSpacing = 10;         // Minimum spacing (in pixels) for unique cells
    let uniqueCells = [];

    // Helper for conflict detection among unique cells
    function checkConflictUnique(candidate) {
      for (let cell of uniqueCells) {
        if (p.dist(cell.x, cell.y, candidate.x, candidate.y) < minSpacing) {
          return true;
        }
      }
      return false;
    }

    // Generate unique cells
    for (let i = 0; i < uniqueCount; i++) {
      let candidate;
      let attempts = 0;
      while (attempts < 30) {
        let x = p.random(-p.width / 2, p.width / 2);
        let y = p.random(-p.height / 2, p.height / 2);
        candidate = { x, y };
        if (!checkConflictUnique(candidate)) {
          break;
        }
        attempts++;
      }
      // Save unique cell with its characteristics once conflict-free
      uniqueCells.push({
        x: candidate.x,
        y: candidate.y,
        vx: p.random(-1, 1),
        vy: p.random(-1, 1),
        assetIndex: i % assets.length,  // Which asset to use
        scale: p.random(0.333, 0.555),
        angle: p.random(p.TWO_PI),
        angleSpeed: p.random(-0.02, 0.02)
      });
    }

    // Duplicate each unique cell 6 times with slight random offsets
    spermCells = [];
    for (let cell of uniqueCells) {
      for (let j = 0; j < duplicatesPerUnique; j++) {
        spermCells.push({
          x: cell.x + p.random(-5, 5), // small offset for visual variety
          y: cell.y + p.random(-5, 5),
          vx: cell.vx,
          vy: cell.vy,
          img: assets[cell.assetIndex],
          scale: cell.scale,
          angle: cell.angle,
          angleSpeed: cell.angleSpeed
        });
      }
    }

     // Simulate an Enter key press by executing the firm reset code:
    for (let cell of spermCells) {
      cell.vx = p.random(-16, 16);
      cell.vy = p.random(-16, 16);
    }

    simStarted = true;
    
  }; // end setup

  p.draw = function() {
    p.background(255);

    for (let node of nodes) {
      if (node.holding) {
        node.pullRadius = p.constrain(node.pullRadius + 1, 180, 1000); // gradually increases to max 300
      } else {
        node.pullRadius = 180; // resets when not held
      }
    }

    // Swap images randomly at an interval
    if (p.millis() - lastShuffle > shuffleInterval) {
      let swapsPerInterval = 111;
      for (let n = 0; n < swapsPerInterval; n++) {
        let i = p.floor(p.random(spermCells.length));
        let j = p.floor(p.random(spermCells.length));
        let temp = spermCells[i].img;
        spermCells[i].img = spermCells[j].img;
        spermCells[j].img = temp;
      }
      lastShuffle = p.millis();
    }

    // --- Mesh physics (invisible substrate) ---
    for (let y = 0; y < rows_; y++) {
      for (let x = 0; x < cols; x++) {
        let point = mesh[y][x];
        let fx = (point.rest_x - point.x) * 0.04;
        let fy = (point.rest_y - point.y) * 0.04;
        let nodePullLimit = 180;
        for (let node of nodes) {
          let d = p.dist(point.x, point.y, node.x, node.y);
          if (node.force > 0 && d < node.pullRadius) {
            let strength = 3 * node.force * (node.pullRadius - d) / node.pullRadius;
            fx += (node.x - point.x) * strength * 0.1;
            fy += (node.y - point.y) * strength * 0.1;
          }
        }
        point.vx = (point.vx + fx) * 0.88;
        point.vy = (point.vy + fy) * 0.88;
        point.x += point.vx;
        point.y += point.vy;
      }
    }

    // --- Animate and draw sperm cells ---
    for (let cell of spermCells) {
      let fx = 0, fy = 0;
      for (let node of nodes) {
        let d = p.dist(cell.x, cell.y, node.x, node.y);
        if (node.force > 0 && d < node.pullRadius) {
          let strength = 3 * node.force * (node.pullRadius - d) / node.pullRadius;
          fx += (node.x - cell.x) * strength * 0.005;
          fy += (node.y - cell.y) * strength * 0.005;
        }
      }
      cell.vx = (cell.vx + fx) * 0.96;
      cell.vy = (cell.vy + fy) * 0.96;
      cell.x += cell.vx;
      cell.y += cell.vy;

      // Bounce off viewport edges
      if (cell.x < -p.width / 2) { cell.x = -p.width / 2; cell.vx *= -1; }
      else if (cell.x > p.width / 2) { cell.x = p.width / 2; cell.vx *= -1; }
      if (cell.y < -p.height / 2) { cell.y = -p.height / 2; cell.vy *= -1; }
      else if (cell.y > p.height / 2) { cell.y = p.height / 2; cell.vy *= -1; }

      cell.angle += cell.angleSpeed;
      let animatedScale = cell.scale + 0.1 * p.sin(p.frameCount * 0.03 + cell.x);

      p.push();
      p.translate(cell.x, cell.y);
      p.rotate(cell.angle);
      p.imageMode(p.CENTER);
      let maxSize = 64;
      let scaleFactor = p.min(maxSize / p.max(cell.img.width, cell.img.height), 1) * animatedScale;
      p.image(cell.img, 0, 0, cell.img.width * scaleFactor, cell.img.height * scaleFactor);
      p.pop();
    }
  }; // end draw

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.keyPressed = function() {
    if (p.keyCode === 32) {  // Space bar: gentle shake
      for (let cell of spermCells) {
        cell.vx = p.random(-2, 2);
        cell.vy = p.random(-2, 2);
      }
    } else if (p.keyCode === p.ENTER || p.keyCode === p.RETURN) {  // Firm reset
      for (let cell of spermCells) {
        cell.vx = p.random(-16, 16);
        cell.vy = p.random(-16, 16);
      }
    } else {
      let k = p.key.toLowerCase();
      if (k in keyToNode) {
        let idx = keyToNode[k];
        nodes[idx].force = 1;
        nodes[idx].holding = true;
      }
    }
  };

  p.keyReleased = function() {
    let k = p.key.toLowerCase();
    if (k in keyToNode) {
      nodes[keyToNode[k]].force = 0;
    }
  };
}