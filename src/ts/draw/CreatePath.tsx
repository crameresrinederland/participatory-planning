
import DrawWidget from "./DrawWidget";

// esri
import Color from "esri/Color";
import {
  declared,
  property,
  subclass,
} from "esri/core/accessorSupport/decorators";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import { tsx } from "esri/widgets/support/widget";

@subclass("app.draw.CreatePath")
export default class CreatePath extends declared(DrawWidget) {

  @property()
  public trailLayer = this.createGraphicsLayer();

  @property()
  public streetLayer = this.createGraphicsLayer();

  public render() {
    return (
      <div>
        <div class="menu">
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, this.streetLayer) }>Create Street</button>
          </div>
          <div class="menu-item">
            <button class="btn" onclick={ this._startDrawing.bind(this, this.trailLayer) }>Create Walking Path</button>
          </div>
        </div>
      </div>
    );
  }

  private _startDrawing(layer: GraphicsLayer) {
    this.createPolyline(new Color("#b2b2b2")).then((polylines) => {
      polylines.forEach((geometry) => {
        const street = new Graphic({
          geometry,
          symbol: {
            type: "simple-line", // autocasts as SimpleLineSymbol()
            color: new Color("#cbcbcb"),
            width: 20,
          },
        } as any);

        layer.add(street);
      });
    });
    // this.sketchModel.reset();
    // this.sketchModel.create("polyline");
  }

  private _onSketchModelEvent(event: any) {

    // if (!event.graphic.geometry) {
    //   return;
    // }
    //
    // const point = this._pointFromEventInfo(event.toolEventInfo);
    // if (point && !contains(this.scene.maskPolygon, point)) {
    //   console.log("Baaaaad");
    //   this.sketchModel.polylineSymbol =  {
    //     type: "simple-line", // autocasts as SimpleLineSymbol()
    //     cap: "round",
    //     color: "#FF0000",
    //     width: 20,
    //   } as any;
    // } else {
    //   console.log("Goooood");
    //   this.sketchModel.polylineSymbol =  {
    //     type: "simple-line", // autocasts as SimpleLineSymbol()
    //     cap: "round",
    //     color: "#b2b3b2",
    //     width: 20,
    //   } as any;
    // }

  }

  // private _coordinatesFromEventInfo(eventInfo: any | null): number[] | undefined {
  //   if (eventInfo) {
  //     switch (eventInfo.type) {
  //       case "cursor-update":
  //         return eventInfo.coordinates;
  //       case "vertex-add":
  //         return eventInfo.added;
  //       default:
  //         break;
  //       }
  //   }
  // }
  //
  // private _pointFromEventInfo(eventInfo: any): Point | undefined {
  //   const coordinates = this._coordinatesFromEventInfo(eventInfo);
  //   if (coordinates) {
  //     return new Point({
  //       x: coordinates[0],
  //       y: coordinates[1],
  //       spatialReference: this.scene.view.spatialReference,
  //     });
  //   }
  // }

}
