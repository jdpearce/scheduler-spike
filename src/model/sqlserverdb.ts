"use strict";

import * as sql from 'msnodesqlv8';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

export class SqlServerDB {

	connectionString: string;

	constructor(instance: string, database: string) {
		this.connectionString = `Driver={SQL Server Native Client 11.0};Server=${instance};Trusted_Connection={Yes};Database={${database}}`;
	}

	select(query: any): Observable<any>{
		return Observable.create((subscriber: Subscriber<any>) => {
			sql.open(this.connectionString, (err: any, conn: any) => {
				if (err) {
					subscriber.error(err);
          return;
				} 
        
        conn.query(query, (qerr: any, results: any) => {
          if (qerr) {
            subscriber.error(qerr);
            return;
          }

          subscriber.next(results);
          subscriber.complete(); 
        });
			});
			return () => {}
		});
	}
}