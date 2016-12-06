import { ScheduledQuery } from './scheduledquery';
import { IConfig } from '../config/iconfig';
import * as rx from 'rxjs';
import * as fs from 'fs';

let sql = require('msnodesqlv8');

export abstract class ScheduledQueryRepository {

  abstract getAll(): rx.Observable<ScheduledQuery[]>;
  getSingle(id: string): rx.Observable<ScheduledQuery> {
    return this.getAll().map(squeries => squeries.find(x => x.id === id));
  }
}

export class ScheduledQueryJsonRepository extends ScheduledQueryRepository {

  private squeries: ScheduledQuery[];

  constructor(private config: IConfig) {
    super();
  }

  getAll(): rx.Observable<ScheduledQuery[]> {
    return rx.Observable.create((subscriber: rx.Subscriber<ScheduledQuery[]>) => {
      fs.readFile(`${this.config.Root}/config/scheduledqueries.json`, 'utf8', (err, data) => {
        if (err) {
          subscriber.error(err);
          return;
        }

        this.squeries = ScheduledQuery.fromSqlResults(JSON.parse(data));
        subscriber.next(this.squeries);
        subscriber.complete();
      });
    });
  }

  getSingle(id: string): rx.Observable<ScheduledQuery> {
    return this.getAll().map(squeries => squeries.find(x => x.id === id));
  }
}
