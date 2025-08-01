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



    // main scrapper process and logic
    class routeScrapper {
      /**
       * @param {puppeteer.Page} page - Puppeteer page instance
       * @param {Object} districts - Object with district codes as keys, search terms as values
       * @param {Object} selectors - All selectors needed for input fields, buttons, etc.
       */
      constructor(page, districts, selectors) {
        this.page = page;
        this.districts = districts;
        this.selectors = selectors;
      }
  
      // Main loop: for each origin, loop over all destinations
      async run() {
        const districtCodes = Object.keys(this.districts);
  
        for (const originCode of districtCodes) {
          const originName = this.districts[originCode];
          console.log(`🚩 Origin: ${originCode} (${originName})`);
  
          for (const destCode of districtCodes) {
            const destinationName = this.Districts[destCode];
  
            if (originCode === destCode) {
              console.log(`⏩ Skipping same district (${originCode})`);
              continue;
            }
  
            console.log(`➡️ Route: ${originCode} ➡️ ${destCode}`);
  
            try {
              await this.setOrigin(originName);
              await this.setDestination(destinationName);
              await this.extractRouteData(originCode, destCode);
            } catch (err) {
              console.error(`❌ Failed route ${originCode} ➡️ ${destCode}:`, err.message);
            }
  
            await this.reset();
          }
        }
  
        console.log("✅ All routes analyzed.");
      }
  
      // Set origin by typing into the search input
      async setOrigin(searchQuery) {
        await this.page.waitForSelector(this.routeSelectors.originSearchInput, { visible: true });
        await this.page.click(this.routeSelectors.originSearchInput, { clickCount: 3 });
        await this.page.keyboard.press('Backspace');
        await this.page.type(this.routeSelectors.originSearchInput, searchQuery, { delay: 50 });
  
        await this.page.waitForSelector(this.routeSelectors.resultItem, { visible: true });
        await this.page.click(this.routeSelectors.resultItem);
        await this.page.click(this.routeSelectors.originSubmit);
      }
  
      // Set destination by typing into the same or another input
      async setDestination(searchQuery) {
        await this.page.waitForSelector(this.routeSelectors.destinationInput, { visible: true });
        await this.page.click(this.routeSelectors.destinationInput, { clickCount: 3 });
        await this.page.keyboard.press('Backspace');
        await this.page.type(this.routeSelectors.destinationInput, searchQuery, { delay: 50 });
  
        await this.page.waitForSelector(this.routeSelectors.resultItem, { visible: true });
        await this.page.click(this.routeSelectors.resultItem);
        await this.page.click(this.routeSelectors.destinationSubmit);
      }
  
      // Placeholder: Implement how to extract the route info
      async extractRouteData(originCode, destCode) {
        console.log(`🔍 Extracting data for ${originCode} ➡️ ${destCode}`);
        // TODO: Add your actual logic here (screenshot, scrape price/time, etc.)
      }
  
      // Clear or reset the interface between routes
      async reset() {
        // TODO: Implement if there's a "clear" or "reset" button
        // Or just reload the page if it's cleaner
        await this.page.reload({ waitUntil: 'networkidle2' });
      }
    }
  
    // #########################################################
    // 7. Instantiate Navigation Class 
    // #########################################################
    /*
    // Create a district search map from the districts data
    // const districtSearchMap = {};
    // districts.forEach(district => {
    //   const districtName = district.district || district.name || district.title;
    //   districtSearchMap[district.id] = districtName;
    // });
    
    // const scrapper = new routeScrapper(page, districtSearchMap, selectors);
    // await scrapper.run();
    */
  
    // ---------------------------------------------------------