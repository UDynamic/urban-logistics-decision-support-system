 // #########################################################
  // 6. Navigator Class
  // #########################################################
  class CanvasNavigator {
    constructor(page, boundingBox, referenceWidth = 1000, baseStepLength = 100) {
      this.page = page;
      this.boundingBox = boundingBox;
      this.baseStepLength = baseStepLength;

      this.startX = boundingBox.x + boundingBox.width / 2;
      this.startY = boundingBox.y + boundingBox.height / 2;

      const scaleFactor = boundingBox.width / referenceWidth;
      this.stepLength = baseStepLength * scaleFactor;

      this.directionVectors = {
        right: { x: -1, y: 0 },
        up: { x: 0, y: 1 },
        left: { x: 1, y: 0 },
        down: { x: 0, y: -1 },
      };
    }

    async moveInDirection(direction, steps) {
      const vector = this.directionVectors[direction];
      if (!vector) {
        throw new Error(`Unknown direction: ${direction}`);
      }

      console.log(`🚀 Starting to move ${steps} steps to the ${direction.toUpperCase()}`);

      for (let i = 1; i <= steps; i++) {
        const fromX = this.startX;
        const fromY = this.startY;

        const toX = fromX + vector.x * this.stepLength;
        const toY = fromY + vector.y * this.stepLength;

        await this.page.mouse.move(fromX, fromY);
        await this.page.mouse.down();
        await this.page.mouse.move(toX, toY, { steps: 20 });
        await this.page.mouse.up();

        console.log(`${i}/${steps} ➡️ Moved one step ${direction}`);
      }

      console.log(`✅ Finished ${direction.toUpperCase()} movement`);
    }

    async moveByPattern(pattern) {
      for (const [direction, steps] of Object.entries(pattern)) {
        await this.moveInDirection(direction, steps);
      }
    }
  }

  // #########################################################
  // 7. Movement patterns
  // #########################################################

  // ! must add file or integrate database
  const D01movementPattern = {
    right: 26,
    up: 12,
  };

  // #########################################################
  // 7. Instantiate Navigation Class 
  // #########################################################
  const navigator = new CanvasNavigator(page, boundingBox);
  await navigator.moveByPattern(D01movementPattern);
