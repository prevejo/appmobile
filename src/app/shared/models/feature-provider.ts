import { Feature } from './feature';
import { Observable } from 'rxjs';

export interface FeatureProvider<T> {

    getFeature(entity: T): Observable<Feature>;

}