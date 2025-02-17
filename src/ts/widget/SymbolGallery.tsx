/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { property, subclass } from "esri/core/accessorSupport/decorators";
import Collection from "esri/core/Collection";
import Portal from "esri/portal/Portal";
import PortalItem from "esri/portal/PortalItem";
import PortalQueryParams from "esri/portal/PortalQueryParams";
import PortalQueryResult from "esri/portal/PortalQueryResult";
import EsriSymbol from "esri/symbols/Symbol";
import { renderable, tsx } from "esri/widgets/support/widget";

import PlanningScene from "../PlanningScene";
import DrawWidget from "./DrawWidget";
import SymbolGroup from "./symbols/SymbolGroup";
import SymbolItem from "./symbols/SymbolItem";

import OAuthInfo from "esri/identity/OAuthInfo";
import esriId from "esri/identity/IdentityManager";

export enum SymbolGroupId {
  Icons = "Icons",
  Trees = "Trees",
  Vehicles = "Vehicles",
  Events = "Events"
}

// I manually added my portalItem here. This portalItem is a webstyle consisting of 4 models. 
const eventStyle = new PortalItem({
  id: "8051e673ec134e0186833bc258267a6b",
})

eventStyle.load()
.then(function(){
  console.log('loaded')
// the webmap successfully loaded
})
.catch(function(error){
// the webmap or portal failed to load
console.log("The resource failed to load: ", error);
});

@subclass("app.draw.SymbolGallery")
export default class SymbolGallery extends DrawWidget {

  @property() public scene: PlanningScene;

  @property() public groups = new Collection<SymbolGroup>();

  @renderable()
  @property()
  public selectedGroupId: SymbolGroupId | null;

  @property({
    readOnly: true,
    dependsOn: ["selectedGroupId", "groups"],
  })
  public get selectedGroup(): SymbolGroup | null {
    const selectedGroupId = this.selectedGroupId;
    return this.groups.find((group) => group.category === selectedGroupId);
  }

  @renderable()
  @property()
  public selectedSymbol: SymbolItem | null;

  @property({
    readOnly: true,
  })
  public readonly iconClass = "icon-ui-collection";

  private portal: Portal | null = null;

  public postInitialize() {
    if (!this.groups.length) {
      const futureItems = this.queryPortalItems();
      this.groups.add(new SymbolGroup(SymbolGroupId.Icons, futureItems));
      this.groups.add(new SymbolGroup(SymbolGroupId.Trees, futureItems));
      this.groups.add(new SymbolGroup(SymbolGroupId.Vehicles, futureItems));
      this.groups.add(new SymbolGroup(SymbolGroupId.Events, futureItems));
    }
  }
  
  public render() {
    const selectedGroup = this.selectedGroup;
    const galleryItems = selectedGroup ? selectedGroup.items.toArray() : [];
    const galleryGridClass = galleryItems.length ? ["gallery-grid"] : ["hide"];
    return (
      <div>
        <div class={ galleryGridClass.join(" ") }>
        {
          galleryItems.map((item) => this.renderSymbolItem(item))
        }
        </div>
      </div>
    );
  }

  private renderSymbolItem(item: SymbolItem) {
    //console.log(item)
    const href = item.thumbnailHref;
    return (
      <div class="gallery-grid-item" key={href} bind={this} onclick={ this.selectSymbolItem } data-item={item}>
        <img src={href} />
      </div>
    );
  }

  private selectSymbolItem(event: any) {
    const selectedSymbol = event.currentTarget["data-item"] as SymbolItem;
    if (selectedSymbol) {
      this.selectedGroupId = null;
      selectedSymbol.fetchSymbol().then((symbol) => {
        return this.placeSymbol(symbol);
      }).catch(() => {
        // Ignore
      });
    }
  }

  private placeSymbol(symbol: EsriSymbol): Promise<void> {
    return this.createPointGraphic(symbol).then((graphic) => {
      return this.placeSymbol(graphic.symbol);
    });
  }

  private loadPortal(): Promise<Portal> {
    const portal = this.portal || Portal.getDefault();

    return portal.load().then(() => {
      this.portal = portal;
      return portal;
    });
  }

  // I added the last .then() in this function. The part i added pushed the previously loaded webstyle into the results, 
  // so it is included with the other items. 
  // Not sure if this works though, so far I havent been able to get any models to actually load. 
  
  private queryPortalItems(): Promise<PortalItem[]> {
    return this.loadPortal()
      .then((portal) => {
        return portal.queryGroups({
          query: "title:\"Esri Styles\" AND owner:esri_en",
        });
      })
      .then((groups: PortalQueryResult) => {
        const queryParams = new PortalQueryParams({
          num: 20,
          sortField: "title",
        });
        return groups.results[0].queryItems(queryParams) as Promise<PortalQueryResult>;
      })
        .then((queryResult) => {
          queryResult.results.push(eventStyle)
        return queryResult.results;
      })

  }

}
