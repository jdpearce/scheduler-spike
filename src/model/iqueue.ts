'use strict';

import {Observable} from 'rxjs/Observable';

export interface IQueue {
	send(obj:any, topic:string): Observable<any>;

  subscribe(topic: string): Observable<any>;
	subscribe(topic: string, share: string): Observable<any>;

	close(): void;
}