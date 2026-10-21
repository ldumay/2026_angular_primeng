import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

declare const Cesium: any; // pas de typings pour la 1.22

@Component({
  selector: 'app-cesium-page',
  standalone: true,
  imports: [],
  templateUrl: './cesium-page.html',
  styleUrl: './cesium-page.scss',
})
export class CesiumPage {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  private zone = inject(NgZone);
  private viewer: any;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.viewer = new Cesium.Viewer(this.container.nativeElement, {
        imageryProvider: Cesium.createOpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/',
        }),
        baseLayerPicker: false,
        geocoder: false,            // supprime l'avertissement Bing
        timeline: false,
        fullscreenButton: true,
        sceneMode: Cesium.SceneMode.SCENE2D,
        fullscreenElement: this.container.nativeElement,
        infoBox: false,             // supprime l'iframe sandboxée et le 404
        selectionIndicator: false,  // associé à l'InfoBox
        animation: false,
      });
      this.viewer.camera.setView({
        // lon, lat, hauteur en mètres
        // destination: Cesium.Cartesian3.fromDegrees(0, 0, 1),
        // ouest, sud, est, nord
        destination: Cesium.Rectangle.fromDegrees(-180, 60, 180, 60),
      });
    });
  }

  ngOnDestroy(): void {
    this.viewer?.destroy(); // libère WebGL, workers et listeners
  }
}
