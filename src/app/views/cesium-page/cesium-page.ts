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
        sceneMode: Cesium.SceneMode.SCENE2D,
        baseLayerPicker: false,
        imageryProvider: Cesium.createOpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/',
        }),
        animation: false,
        timeline: false,
      });
      this.viewer.camera.setView({
        destination: Cesium.Rectangle.fromDegrees(-15, 35, 30, 60),
      });
    });
  }

  ngOnDestroy(): void {
    this.viewer?.destroy(); // libère WebGL, workers et listeners
  }
}
