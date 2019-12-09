import { FeatureLayer } from './feature-layer';
import { Observable } from 'rxjs';

export interface FeatureEntity<T> {

    getEntity(): T;
    toFeatureLayer(): Observable<FeatureLayer>;

}