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

    // #########################################################
  // 6. basic price extraction for cab and bike (before making the classes)
  // #########################################################

  // origin search bar selected
  await page.waitForSelector(selectors.originSearchBtn, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.originSearchBtn, { clickCount: 3 });

  // origin inputed
  await page.waitForSelector(selectors.originSearchInput, { visible: true, waitUntil: 'networkidle2' });
  console.log("🔍 origin searchbar found and active");


  // Clear any existing text in search input
  await page.click(selectors.destinationSearchInput, { clickCount: 3 });
  await page.keyboard.press('Backspace');

  // Type in origin search input
  await page.type(selectors.originSearchInput, "میدان راه آهن", { delay: 100 }); // delay for if prevents fast typing
  console.log("📝 origin typed");

  // Select first item in the search results
  await page.waitForSelector(selectors.firstSearchLi, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.firstSearchLi, { clickCount: 3 });
  console.log("👆 first item selected");

  // submit origin
  await page.waitForSelector(selectors.originSearchSubmit, { visible: true, waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.click(selectors.originSearchSubmit, { clickCount: 3 });
  console.log("📤 origin submitted");
  await sleep(2000);

  //destination search bar 
  await page.waitForSelector(selectors.destinationSearchBtn, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.destinationSearchBtn, { clickCount: 3 });
  console.log("🔍 destination searchbar found and active");


  // Clear any existing text in search input
  await page.click(selectors.destinationSearchInput, { clickCount: 3 });
  await page.keyboard.press('Backspace');

  // Type in destination search input
  await page.type(selectors.destinationSearchInput, "دهکده المپیک", { delay: 100 }); // delay for if prevents fast typing
  console.log("📝 destination typed");

  // Select first item in the search results
  await page.waitForSelector(selectors.firstSearchLi, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.firstSearchLi, { clickCount: 3 });
  console.log("👆 first item selected");
  await sleep(2000);

  // submit destination
  await page.waitForSelector(selectors.destinationSearchSubmit, { visible: true });
  await sleep(2000);
  await page.click(selectors.destinationSearchSubmit, { clickCount: 3 });
  console.log("📤 destination submitted");


  page.waitForSelector(selectors.cabPriceSelector, { visible: true })
    .then(() => page.$(selectors.cabPriceSelector))
    .then(element => page.evaluate(el => el.textContent.trim(), element))
    .then(cabPriceText => {
      console.log("💰🚕 cab Price text:", cabPriceText);

      // Convert price to number
      const cabPriceNumber = persianToNumber(cabPriceText);
      console.log("💰🚕 cab price as number:", cabPriceNumber);

      // Transition to Bike price section
      return page.waitForSelector(selectors.bikePriceTab, { visible: true });
    })
    .then(() => page.click(selectors.bikePriceTab, { clickCount: 3 }))
    .catch(err => console.error("❌ Error during price extraction:", err));

  page.waitForSelector(selectors.bikePriceSelector, { visible: true })
    .then(() => page.$(selectors.bikePriceSelector))
    .then(element => page.evaluate(el => el.textContent.trim(), element))
    .then(bikePriceText => {
      console.log("💰🏍️ Bike Price text:", bikePriceText);

      // Convert price to number
      const bikePriceNumber = persianToNumber(bikePriceText);
      console.log("💰🏍️ Bike price as number:", bikePriceNumber);

      // Transition to Bike price section
      return page.waitForSelector(selectors.bikeDelivaryTab, { visible: true });
    })
    .then(() => page.click(selectors.bikeDelivaryTab, { clickCount: 3 }))
    .catch(err => console.error("❌ Error during price extraction:", err));

  page.waitForSelector(selectors.bikeDelivaryPriceSelector, { visible: true })
    .then(() => page.$(selectors.bikeDelivaryPriceSelector))
    .then(element => page.evaluate(el => el.textContent.trim(), element))
    .then(bikeDelivaryPriceText => {
      console.log("💰🛵 Bike delivary Price text:", bikeDelivaryPriceText);

      // Convert price to number
      const bikeDelivaryPriceNumber = persianToNumber(bikeDelivaryPriceText);
      console.log("💰🛵 Bike delivary price as number:", bikeDelivaryPriceNumber);
    })
    .catch(err => console.error("❌ Error during price extraction:", err));