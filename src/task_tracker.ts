import Spaceship from "./spaceship";
import Planet from "./planet";
import { distance_format } from "./util/dist_format";

export class TasksTracker {
  currentPlanet: number;
  missionOrder = [5, 6, 7, 8, 4, 3, 2, 1, 0];
  questCompleteDelay = -1;
  task1 = document.getElementById("task1");
  task2 = document.getElementById("task2");
  task3 = document.getElementById("task3");
  missionElement = document.getElementById("current-mission");
  completeElement = document.getElementById("mission-complete");
  taskListElement = document.getElementById("task-list");
  youWinElement = document.getElementById("you-win");

  constructor(private ship: Spaceship, private planets: Planet[]) {
    this.currentPlanet = this.missionOrder.shift();
  }

  update(timeAccel: number) {
    if (this.questCompleteDelay <= 0) {
      let planet = this.planets[this.currentPlanet];
      (window as any).nx = planet.x;
      (window as any).ny = planet.y;

      let closeEnough = planet.distanceToShip < planet.recommendedOrbit;
      let correctTimeAccel = timeAccel == planet.recommendedTimeAccel;
      let furthestPointOfOrbit = this.ship.furthestDistToPlanet;
      let furthestPointOfOrbitCutoff = (planet.orbitCutoff + planet.recommendedOrbit) / 2;
      let staysCloseEnough = furthestPointOfOrbit < furthestPointOfOrbitCutoff
      let isCircular = this.ship.furthestDistToPlanet / this.ship.closestDistToPlanet < 25;
      let inOrbit = closeEnough && correctTimeAccel && isCircular && staysCloseEnough;
      let taskComplete = closeEnough && correctTimeAccel && inOrbit;

      let closeEnoughMsg = "Get within " + distance_format(planet.recommendedOrbit) + " of " + planet.name + ".<p>Current distance: " + distance_format(planet.distanceToShip) + ".</p>";
      let correctTimeAccelMsg = "Set time acceleration to " + planet.recommendedTimeAccel + ".<p>(Change by pressing , and .)</p>";
      let inOrbitMsg = "Establish an orbit."
      if (closeEnough && correctTimeAccel) {
        if (!staysCloseEnough) {
          inOrbitMsg += "<p>Warning: Furthest point of orbit (" + distance_format(furthestPointOfOrbit) + ") needs to be less than " + distance_format(furthestPointOfOrbitCutoff) + ".</p>";
        } else if (!isCircular) {
          inOrbitMsg += "<p>Warning: Orbit should be (mostly) circular.</p>";
        }
      }

      let checkMark = " &#10004;  "
      let xMark = " &#10005;  ";

      if (closeEnough) {
        closeEnoughMsg = checkMark + closeEnoughMsg;
        this.task1.classList.add("task-complete");
      } else {
        closeEnoughMsg = xMark + closeEnoughMsg;
        this.task1.classList.remove("task-complete");
      }

      if (correctTimeAccel) {
        correctTimeAccelMsg = checkMark + correctTimeAccelMsg;
          this.task2.classList.add("task-complete");
      } else {
        correctTimeAccelMsg = xMark + correctTimeAccelMsg;
          this.task2.classList.remove("task-complete");
      }

      if (inOrbit) {
        inOrbitMsg = checkMark + inOrbitMsg;
          this.task3.classList.add("task-complete");
      } else {
        inOrbitMsg = xMark + inOrbitMsg;
          this.task3.classList.remove("task-complete");
      }

      this.task1.innerHTML = closeEnoughMsg;
      this.task2.innerHTML = correctTimeAccelMsg;
      this.task3.innerHTML = inOrbitMsg;
      this.missionElement.innerHTML = "Orbit " + planet.name;

      if (taskComplete) {
        this.completeElement.classList.remove("hidden");
        this.questCompleteDelay = 60 * 3;
        this.currentPlanet = this.missionOrder.shift();
        if (!this.currentPlanet) {
          this.youWinElement.classList.remove("hidden");
          this.taskListElement.classList.add("hidden");
        }
      } else if (!this.completeElement.classList.contains("hidden")) {
        this.completeElement.classList.add("hidden");
      }
    } else {
      this.questCompleteDelay -= 1;
    }
  }
}
