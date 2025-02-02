class Diagram{
  constructor(number, project){
    this.name = 'Name';
    this.highStates = [];
    this.number = number;
    
    this.ticks;
    this.stepSize;
    this.updateTicks(project);

    this.topLeft;
    this.area;
    this.statesArea;
    this.nameArea;

    this.calculateDimensions();
  }

  setNumber(number, project) {
    this.number = number;
    this.updateTicks(project);
  }

  updateTicks(project){
    this.ticks = project.ticks;
    this.stepSize = project.stepSize;

    this.calculateDimensions();
    for (let highState of this.highStates){
      highState.calculatePoints(this);
    }
  }

  calculateDimensions(){
    this.topLeft =
      Dimensions.diagramsTopLeft.offseted(
        0, this.number * Dimensions.containersSpan);
    this.area = 
      Rectangle.fromPointWidthHeight(
        this.topLeft, Dimensions.containerWidth, Dimensions.containerHeight);
    this.statesArea = 
      new Rectangle(
        this.area.p1.offseted(
          Dimensions.nameWidth + (2 * Dimensions.margin), 
          Dimensions.margin),
        this.area.p2.offseted(
          -Dimensions.margin, 
          -Dimensions.margin)
      );
    this.nameArea = 
      new Rectangle(
        this.area.p1.offseted(
          Dimensions.margin, 
          Dimensions.margin),
        this.area.p1.offseted(
          Dimensions.nameWidth + Dimensions.margin, 
          Dimensions.containerHeight - Dimensions.margin)
      );
  }

  rebuild(restoredDiagram){
    this.name = restoredDiagram.name;
    this.number = restoredDiagram.number;
    this.stepSize = restoredDiagram.stepSize;
    this.ticks = restoredDiagram.ticks;
    
    this.calculateDimensions();

    for (let restoredHighState of restoredDiagram.highStates){
      let highState = new HighState(0, 0, this)
      highState.rebuild(restoredHighState, this);

      this.highStates.push(highState);
    }
  }

  addHighState (highState){
    this.highStates.push(highState);
  }

  removeHighStateByIndex (index){
    this.highStates.splice(index, 1);
  }

  removeHighState(highState){
    let index = this.highStates.indexOf(highState);
    if (index >= 0){
      this.removeHighStateByIndex(index);
    }
  }

  drawMe() {
    this.area.drawMe();
    this.drawName();
    this.drawTicks();
    this.drawLowStates();
    this.drawHighStates();
  }

  drawName(){
    noStroke();
    textSize(Dimensions.nameSize_px);
    textStyle(BOLD);
    textFont(Dimensions.nameFont);
    textAlign(RIGHT, CENTER);
    fill(Colors.ticks);

    let x = this.nameArea.p2.x;
    let y = 0.5 * (this.nameArea.p1.y + this.nameArea.p2.y);

    text(this.name, x, y);
  }

  drawTicks(){
    strokeWeight(Dimensions.tickWidth_px);

    fill(Colors.ticks);
    textSize(Dimensions.tickLabelSize_px);
    textStyle(NORMAL);
    textFont(Dimensions.labeledTickFont);
    textAlign(CENTER, CENTER);

    for (let i = 0; i<= this.ticks; i++){
      let x = this.statesArea.p1.x + (i * this.stepSize);

      if (i % Dimensions.labeledTickEvery == 0){
        let y = this.statesArea.p2.y + (Dimensions.margin * 0.5);

        noStroke();
        text(i, x, y);
      } else {
        let yTop = this.statesArea.p2.y + Dimensions.tickYOffset_px;
        let yBot = yTop + Dimensions.tickLength_px;

        stroke(Colors.ticks);
        line(x, yTop, x, yBot);
      }

    }
  }

  drawLowStates() {
    strokeWeight(Dimensions.lowStateLineWidth);
    stroke(Colors.states);

    let upBy = ceil(Dimensions.lowStateLineWidth * 0.5);

    line(
      this.statesArea.p1.x,
      this.statesArea.p2.y-upBy,
      this.statesArea.p2.x,
      this.statesArea.p2.y-upBy
      )
  }

  drawHighStates() {
    this.highStates.forEach(state => state.drawMe());
  }

  setName(name) {
    this.name = name;
  }

  mouseInStatesArea(){
    let xInRange = this.statesArea.p1.x <= mouseX && mouseX <= this.statesArea.p2.x;
    let yInRange = this.area.p1.y <= mouseY && mouseY <= this.area.p2.y;

    return xInRange && yInRange;
  }

  mouseInNameArea(){
    let xInRange = this.nameArea.p1.x <= mouseX && mouseX <= this.nameArea.p2.x;
    let yInRange = this.nameArea.p1.y <= mouseY && mouseY <= this.nameArea.p2.y;

    return xInRange && yInRange;
  }

  xPositionPixelsToSteps(position_px){
    position_px = MyMath.limit(position_px, this.statesArea.p1.x, this.statesArea.p2.x);
    let positionRelative_px = position_px - this.statesArea.p1.x;
    return round(positionRelative_px/this.stepSize);
  }

  xPositionStepsToPixels(position_steps){
    return this.statesArea.p1.x + position_steps * this.stepSize;
  }
}