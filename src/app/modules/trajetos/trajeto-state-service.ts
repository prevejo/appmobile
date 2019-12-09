import { Injectable } from '@angular/core';
import { TrajetoService } from './trajeto.service';
import { RouteLocation, ParadaRouteLocation } from 'src/app/shared/models/route-location';
import { Subscribable, Observable, of, throwError, empty, EMPTY } from 'rxjs';
import { Trajeto, TrechoPercurso } from '../../shared/models/trajeto';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { StartRoutePosition, RoutePosition, EndRoutePosition } from 'src/app/shared/models/route-location-entry';
import { AreaIntegracao } from 'src/app/shared/models/area-integracao';
import { FeatureCollection } from 'geojson';
import { map } from 'rxjs/operators';
import { AreaIntegracaoService } from 'src/app/shared/services/area-integracao.service';
import { PercursoService } from 'src/app/shared/services/percurso.service';
import { FeatureProvider } from 'src/app/shared/models/feature-provider';
import { Percurso } from 'src/app/shared/models/percurso';
import { Feature } from 'src/app/shared/models/feature';
import { LineString } from 'src/app/shared/util/linestring';
import { TrechoPercursoCollection, TrechoPosition, buildPostionFor } from 'src/app/shared/models/trecho-percurso-collection';
import { FeatureEntity } from 'src/app/shared/models/feature-entity';
import { CacheableObservable } from 'src/app/shared/util/cacheable-observable';

@Injectable()
export class TrajetoStateService {

    private currentTrajetoSelecionadoState: TrajetoState;

    constructor(
        private trajetoService: TrajetoService,
        private areaService: AreaIntegracaoService,
        private percursoService: PercursoService) {}

    consumeTrajetoSelecionadoState(): Observable<TrajetoState> {
        if (this.currentTrajetoSelecionadoState === undefined) {
            this.setTrajetoSelecionadoState(
            JSON.parse(TRAJETO_QUANDO_VAZIO),
            new ParadaRouteLocation({
                cod: '4976',
                geo: {
                    type: 'Point',
                    coordinates: [-48.03187, -15.86769]
                }
            }),
            new ParadaRouteLocation({
                cod: '3742',
                geo: {
                    type: 'Point',
                    coordinates: [-47.96421, -15.76486]
                }
            }));
        }

        return this.currentTrajetoSelecionadoState === undefined
            ? throwError('Trajeto não definido')
            : of(this.currentTrajetoSelecionadoState);
    }

    instanceListState(origem: RouteLocation, destino: RouteLocation): TrajetoListState {
        return new TrajetoListImpl(origem, destino, this.trajetoService.obterTrajetos(origem, destino), this);
    }

    setTrajetoSelecionadoState(trajeto: Trajeto, origem: RouteLocation, destino: RouteLocation) {
        const areasIntegracao: Observable<FeatureCollection> = trajeto.trechos.length > 1
            ? this.areaService.obterFeatureCollection(trajeto.trechos.slice(1)
                .map(trecho => trecho.areaEmbarque.areaIntegracao as AreaIntegracao))
            : null;

        this.currentTrajetoSelecionadoState = new TrajetoStateImpl(
            trajeto,
            origem,
            destino,
            areasIntegracao,
            this.percursoService.toFeatureProvider()
        );
    }

}

export interface TrajetoListState {

    origem: RouteLocation;
    destino: RouteLocation;

    trajetos(): Subscribable<Trajeto[]>;
    setTrajetoSelecionado(trajeto: Trajeto): void;

}

class TrajetoListImpl implements TrajetoListState {

    constructor(
        public origem: RouteLocation,
        public destino: RouteLocation,
        private trajetosObs: Observable<Trajeto[]>,
        private trajetoStateService: TrajetoStateService) {
        this.trajetosObs = new CacheableObservable(trajetosObs);
    }

    trajetos(): Subscribable<Trajeto[]> {
        return this.trajetosObs;
    }

    setTrajetoSelecionado(trajeto: Trajeto) {
        this.trajetoStateService.setTrajetoSelecionadoState(trajeto, this.origem, this.destino);
    }

}


export interface TrajetoState {

    origem(): Observable<FeatureEntity<RouteLocation>>;
    destino(): Observable<FeatureEntity<RouteLocation>>;
    linhas(): Observable<FeatureEntity<TrechoPercursoCollection>[]>;
    areasIntegracao(): Observable<FeatureEntity<FeatureCollection>>;

}

class TrajetoStateImpl implements TrajetoState {

    constructor(
        private trajeto: Trajeto,
        private origemLocation: RouteLocation,
        private destinoLocation: RouteLocation,
        private areas: Observable<FeatureCollection>,
        private percursoProvider: FeatureProvider<Percurso>
    ) {}

    origem(): Observable<FeatureEntity<RouteLocation>> {
        return of(new RouteFeatureEntity(this.origemLocation, new StartRoutePosition()));
    }

    destino(): Observable<FeatureEntity<RouteLocation>> {
        return of(new RouteFeatureEntity(this.destinoLocation, new EndRoutePosition()));
    }

    linhas(): Observable<FeatureEntity<TrechoPercursoCollection>[]> {
        return of(this.trajeto.trechos
            .map((trecho, i) => new PercursoFeatureEntity(
                i === 0 ?
                    buildPostionFor('start') :
                    i === this.trajeto.trechos.length - 1 ? buildPostionFor('end') : buildPostionFor('middle'),
                trecho.percursos,
                this.percursoProvider,
                this.origemLocation,
                this.destinoLocation
            )));
    }

    areasIntegracao(): Observable<FeatureEntity<FeatureCollection>> {
        return this.areas == null ? of(null) : this.areas.pipe(map(fc => new AreaIntegracaoEntity(fc)));
    }

}




class PercursoFeatureEntity implements TrechoPercursoCollection, FeatureEntity<TrechoPercursoCollection> {

    entity: TrechoPercursoCollection;
    percursoSelecionado: TrechoPercurso;
    private listener: (percurso: TrechoPercurso) => void = () => {};

    constructor(
        public position: TrechoPosition,
        public percursos: TrechoPercurso[],
        private percursoProvider: FeatureProvider<Percurso>,
        private origem: RouteLocation,
        private destino: RouteLocation) {
        this.entity = this;
        this.selecionarPercurso(percursos[0]);
    }

    addPercursoSelecionadoListener(listener: (percurso: TrechoPercurso) => void) {
        this.listener = listener;
    }

    trocarPercurso() {
        if (this.percursos.length > 1) {
            let currentIndex: number = this.percursoSelecionado ? this.percursos.indexOf(this.percursoSelecionado): 0;

            currentIndex = currentIndex < this.percursos.length - 1 ? currentIndex + 1 : 0;

            this.selecionarPercurso(this.percursos[currentIndex]);
        }
    }

    selecionarPercurso(percurso: TrechoPercurso) {
        this.percursoSelecionado = percurso;
        this.listener(percurso);
    }

    getEntity(): TrechoPercursoCollection {
        return this.entity;
    }

    toFeatureLayer(): Observable<FeatureLayer> {
        const existentes: string[] = [this.origem, this.destino]
            .filter(r => r instanceof ParadaRouteLocation)
            .map(p => (p as ParadaRouteLocation).getParada().cod);

        const embarque = this.percursoSelecionado.embarques[0];
        const desembarque = this.percursoSelecionado.desembarques[0];

        const paradas: Feature[] = [
            this.percursoSelecionado.embarques[0],
            this.percursoSelecionado.desembarques[0]
        ].filter(parada => existentes.indexOf(parada.cod) === -1)
            .map(parada => Feature.fromGeoPoint(parada.geo, {
                codigo: parada.cod
            }));

        return this.percursoProvider.getFeature(this.percursoSelecionado.percurso)
            .pipe(map(feature => {

                feature = LineString.fromLinestring(feature.getGeoJson().geometry as GeoJSON.LineString)
                    .firstCut(embarque.geo, desembarque.geo)
                    .toFeature(feature.getGeoJson().properties);

                return FeatureLayer.fromFeatures([...paradas, feature], { shape: this.position.getFeatureLayerShape() })
            }));
    }
}

class RouteFeatureEntity implements FeatureEntity<RouteLocation> {

    constructor(private routeLocation: RouteLocation, private position: RoutePosition) {}

    getEntity(): RouteLocation {
        return this.routeLocation;
    }

    toFeatureLayer(): Observable<FeatureLayer> {
        return of(this.routeLocation.toFeatureLayer(this.position));
    }

}

class AreaIntegracaoEntity implements FeatureEntity<FeatureCollection> {

    constructor(private areas: FeatureCollection) {}

    getEntity(): FeatureCollection {
        return this.areas;
    }

    toFeatureLayer(): Observable<FeatureLayer> {
        return of(FeatureLayer.fromCollection(this.areas));
    }

}

const TRAJETO_QUANDO_VAZIO = '{"origem":{"parada":{"id":3316,"cod":"4976","geo":{"type":"Point","coordinates":[-48.03187,-15.8677]}}},"destino":{"parada":{"id":1567,"cod":"3742","geo":{"type":"Point","coordinates":[-47.96422,-15.76489]}}},"trechos":[{"areaEmbarque":{"parada":{"id":3316,"cod":"4976","geo":{"type":"Point","coordinates":[-48.03187,-15.8677]}}},"areaDesembarque":{"areaIntegracao":{"id":4,"descricao":"Palácio do Buriti"}},"percursos":[{"embarques":[{"id":3316,"cod":"4976","geo":{"type":"Point","coordinates":[-48.03187,-15.8677]}}],"desembarques":[{"id":184,"cod":"3262","geo":{"type":"Point","coordinates":[-47.9078,-15.78706]}}],"percurso":{"id":1157,"sentido":"IDA","linha":{"id":727,"numero":"394.1","descricao":"Samambaia Sul (2ª Avenida)/Rodoviária do Plano Piloto (Pistão Sul -EPTG- SIG)","tarifa":5},"origem":"SAMAMBAIA SUL","destino":"RODOVIÁRIA DO PLANO PILOTO"}}]},{"areaEmbarque":{"areaIntegracao":{"id":4,"descricao":"Palácio do Buriti"}},"areaDesembarque":{"parada":{"id":1567,"cod":"3742","geo":{"type":"Point","coordinates":[-47.96422,-15.76489]}}},"percursos":[{"embarques":[{"id":849,"cod":"3254","geo":{"type":"Point","coordinates":[-47.90714,-15.78502]}}],"desembarques":[{"id":1567,"cod":"3742","geo":{"type":"Point","coordinates":[-47.96422,-15.76489]}}],"percurso":{"id":920,"sentido":"CIRCULAR","linha":{"id":582,"numero":"0.143","descricao":"Circular - Rodoviária Plano Piloto / Hospital da Criança / Regimento de Cavalari","tarifa":3.5},"origem":"RODOVIÁRIA DO PLANO PILOTO","destino":"RODOVIÁRIA DO PLANO PILOTO"}},{"embarques":[{"id":849,"cod":"3254","geo":{"type":"Point","coordinates":[-47.90714,-15.78502]}}],"desembarques":[{"id":1567,"cod":"3742","geo":{"type":"Point","coordinates":[-47.96422,-15.76489]}}],"percurso":{"id":849,"sentido":"CIRCULAR","linha":{"id":534,"numero":"143.1","descricao":"CIRCULAR - Rodoviária Plano Piloto / Colégio Militar de Brasilia / Regimento de Cavalaria de Guarda","tarifa":3.5},"origem":"RODOVIÁRIA DO PLANO PILOTO","destino":"RODOVIÁRIA DO PLANO PILOTO"}}]}]}';